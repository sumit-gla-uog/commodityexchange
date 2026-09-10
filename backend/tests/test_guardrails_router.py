from fastapi.testclient import TestClient
from main import app
from guardrails.router import get_db

client = TestClient(app)


class FakeGuardrailService:
    """Patches get_logs behaviour by monkeypatching the module function
    used inside guardrails/router.py"""
    pass


def test_get_guardrail_logs_returns_paginated_response(monkeypatch):
    fake_logs = [
        {"status": "BLOCKED", "query": "What is Bitcoin price?", "reason": "Not a commodity", "created_at": "2026-09-10T11:47:03+00:00"},
        {"status": "PASSED", "query": "Copper price trend?", "reason": "Valid commodity query", "created_at": "2026-09-10T11:47:19+00:00"},
    ]

    def fake_get_logs(supabase, page, page_size):
        assert page == 1
        assert page_size == 5
        return {"logs": fake_logs, "total": 2}

    monkeypatch.setattr("guardrails.router.get_logs", fake_get_logs)
    app.dependency_overrides[get_db] = lambda: object()

    res = client.get("/api/guardrails/log?page=1&page_size=5")

    app.dependency_overrides.clear()

    assert res.status_code == 200
    body = res.json()
    assert body["total"] == 2
    assert len(body["logs"]) == 2
    assert body["logs"][0]["status"] == "BLOCKED"
    assert body["logs"][0]["query"] == "What is Bitcoin price?"
    assert body["logs"][0]["timestamp"] == "2026-09-10T11:47:03+00:00"


def test_get_guardrail_logs_uses_default_pagination(monkeypatch):
    captured = {}

    def fake_get_logs(supabase, page, page_size):
        captured["page"] = page
        captured["page_size"] = page_size
        return {"logs": [], "total": 0}

    monkeypatch.setattr("guardrails.router.get_logs", fake_get_logs)
    app.dependency_overrides[get_db] = lambda: object()

    res = client.get("/api/guardrails/log")

    app.dependency_overrides.clear()

    assert res.status_code == 200
    assert captured["page"] == 1
    assert captured["page_size"] == 5
    assert res.json() == {"logs": [], "total": 0}


def test_get_guardrail_logs_empty_when_no_logs(monkeypatch):
    def fake_get_logs(supabase, page, page_size):
        return {"logs": [], "total": 0}

    monkeypatch.setattr("guardrails.router.get_logs", fake_get_logs)
    app.dependency_overrides[get_db] = lambda: object()

    res = client.get("/api/guardrails/log?page=3&page_size=5")

    app.dependency_overrides.clear()

    assert res.status_code == 200
    body = res.json()
    assert body["logs"] == []
    assert body["total"] == 0