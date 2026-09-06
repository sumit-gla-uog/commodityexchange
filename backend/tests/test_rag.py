import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


@patch("rag.router.agentic_query")
@patch("rag.router.run_all_guards")
def test_agentic_chat_returns_answer_when_guards_pass(mock_guards, mock_agentic_query):
    mock_guards.return_value = {
        "overall_passed": True,
        "topic_guard": {"passed": True, "reason": "Valid commodity intent"},
        "toxicity_guard": {"passed": True, "reason": "No harmful content"},
    }
    mock_agentic_query.return_value = "Copper is currently trending upward at $13,552/mt."

    res = client.post("/api/chat/agentic", json={"query": "How is copper doing?"})

    assert res.status_code == 200
    body = res.json()
    assert body["query"] == "How is copper doing?"
    assert body["answer"] == "Copper is currently trending upward at $13,552/mt."
    mock_agentic_query.assert_called_once_with("How is copper doing?")


@patch("rag.router.agentic_query")
@patch("rag.router.run_all_guards")
def test_agentic_chat_blocks_query_when_topic_guard_fails(mock_guards, mock_agentic_query):
    mock_guards.return_value = {
        "overall_passed": False,
        "topic_guard": {"passed": False, "reason": "Not related to commodities or procurement"},
        "toxicity_guard": {"passed": True, "reason": "No harmful content"},
    }

    res = client.post("/api/chat/agentic", json={"query": "What's the best pizza topping?"})

    assert res.status_code == 200
    body = res.json()
    assert "cannot process this query" in body["answer"]
    assert "Not related to commodities" in body["answer"]
    mock_agentic_query.assert_not_called()


@patch("rag.router.agentic_query")
@patch("rag.router.run_all_guards")
def test_agentic_chat_blocks_query_when_toxicity_guard_fails(mock_guards, mock_agentic_query):
    mock_guards.return_value = {
        "overall_passed": False,
        "topic_guard": None,
        "toxicity_guard": {"passed": False, "reason": "Harmful content detected"},
    }

    res = client.post("/api/chat/agentic", json={"query": "some abusive query"})

    assert res.status_code == 200
    body = res.json()
    assert "Harmful content detected" in body["answer"]
    mock_agentic_query.assert_not_called()


@patch("rag.router.agentic_query")
@patch("rag.router.run_all_guards")
def test_agentic_chat_returns_500_on_unexpected_error(mock_guards, mock_agentic_query):
    mock_guards.return_value = {
        "overall_passed": True,
        "topic_guard": {"passed": True, "reason": "Valid"},
        "toxicity_guard": {"passed": True, "reason": "Valid"},
    }
    mock_agentic_query.side_effect = Exception("LLM provider timeout")

    res = client.post("/api/chat/agentic", json={"query": "oil prices?"})

    assert res.status_code == 500
    assert "LLM provider timeout" in res.json()["detail"]


def test_agentic_chat_rejects_missing_query_field():
    res = client.post("/api/chat/agentic", json={})
    assert res.status_code == 422