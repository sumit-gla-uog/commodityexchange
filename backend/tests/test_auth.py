import time
import jwt
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from main import app
from auth.router import create_token, verify_token, get_db, JWT_SECRET, JWT_ALGORITHM

client = TestClient(app)


class FakeCredentials:
    """Mimics HTTPAuthorizationCredentials for direct function calls."""
    def __init__(self, token: str):
        self.credentials = token


class FakeResponse:
    def __init__(self, data):
        self.data = data


class FakeTable:
    def __init__(self, existing_data, insert_data=None):
        self._existing_data = existing_data
        self._insert_data = insert_data
        self._last_call = "select"

    def select(self, *args, **kwargs):
        self._last_call = "select"
        return self

    def eq(self, *args, **kwargs):
        return self

    def insert(self, *args, **kwargs):
        self._last_call = "insert"
        return self

    def execute(self):
        if self._last_call == "insert" and self._insert_data is not None:
            return FakeResponse(self._insert_data)
        return FakeResponse(self._existing_data)


class FakeSupabase:
    def __init__(self, existing_data, insert_data=None):
        self._existing_data = existing_data
        self._insert_data = insert_data

    def table(self, name):
        return FakeTable(self._existing_data, self._insert_data)


#  create_token / verify_token (pure JWT logic) 

def test_create_token_returns_valid_jwt():
    token = create_token(user_id="user-123", email="test@example.com")
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

    assert payload["user_id"] == "user-123"
    assert payload["email"] == "test@example.com"
    assert "exp" in payload


def test_verify_token_accepts_valid_token():
    token = create_token(user_id="user-123", email="test@example.com")
    payload = verify_token(FakeCredentials(token))

    assert payload["user_id"] == "user-123"
    assert payload["email"] == "test@example.com"


def test_verify_token_rejects_expired_token():
    expired_payload = {
        "user_id": "user-123",
        "email": "test@example.com",
        "exp": int(time.time()) - 60
    }
    expired_token = jwt.encode(expired_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    with pytest.raises(HTTPException) as exc_info:
        verify_token(FakeCredentials(expired_token))

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Token expired"


def test_verify_token_rejects_invalid_signature():
    tampered_token = jwt.encode(
        {"user_id": "user-123", "email": "test@example.com"},
        "wrong-secret-key",
        algorithm=JWT_ALGORITHM
    )

    with pytest.raises(HTTPException) as exc_info:
        verify_token(FakeCredentials(tampered_token))

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid token"


def test_verify_token_rejects_malformed_token():
    with pytest.raises(HTTPException) as exc_info:
        verify_token(FakeCredentials("not-a-real-jwt-token"))

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid token"


# /register (mocked Supabase) 

def test_register_success():
    app.dependency_overrides[get_db] = lambda: FakeSupabase(
        existing_data=[],  # no existing user with this email
        insert_data=[{"id": "u1", "email": "new@example.com", "sme_name": "Acme", "location_uk": "Glasgow"}]
    )

    res = client.post("/api/auth/register", json={
        "email": "new@example.com",
        "password": "secret123",
        "sme_name": "Acme",
        "location_uk": "Glasgow"
    })

    app.dependency_overrides.clear()

    assert res.status_code == 200
    body = res.json()
    assert body["message"] == "Registration successful"
    assert body["user"]["email"] == "new@example.com"
    assert "token" in body


def test_register_rejects_existing_email():
    # FakeTable.execute() always returns the same data regardless of
    # select/insert, so a non-empty list simulates "email already exists"
    app.dependency_overrides[get_db] = lambda: FakeSupabase(
        existing_data=[{"id": "u1"}]
    )

    res = client.post("/api/auth/register", json={
        "email": "existing@example.com",
        "password": "secret123",
        "sme_name": "Acme",
        "location_uk": "Glasgow"
    })

    app.dependency_overrides.clear()

    assert res.status_code == 400
    assert res.json()["detail"] == "Email already registered"


#  /login (mocked Supabase) 

def test_login_success():
    import bcrypt
    hashed = bcrypt.hashpw(b"correct-password", bcrypt.gensalt()).decode()

    app.dependency_overrides[get_db] = lambda: FakeSupabase(
        existing_data=[{"id": "u1", "email": "a@b.com", "password": hashed, "sme_name": "Acme"}]
    )

    res = client.post("/api/auth/login", json={
        "email": "a@b.com",
        "password": "correct-password"
    })

    app.dependency_overrides.clear()

    assert res.status_code == 200
    body = res.json()
    assert body["user"]["email"] == "a@b.com"
    assert "token" in body


def test_login_rejects_unknown_email():
    app.dependency_overrides[get_db] = lambda: FakeSupabase(existing_data=[])

    res = client.post("/api/auth/login", json={
        "email": "nobody@example.com",
        "password": "whatever"
    })

    app.dependency_overrides.clear()

    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid email or password"


def test_login_rejects_wrong_password():
    import bcrypt
    hashed = bcrypt.hashpw(b"correct-password", bcrypt.gensalt()).decode()

    app.dependency_overrides[get_db] = lambda: FakeSupabase(
        existing_data=[{"id": "u1", "email": "a@b.com", "password": hashed, "sme_name": "Acme"}]
    )

    res = client.post("/api/auth/login", json={
        "email": "a@b.com",
        "password": "wrong-password"
    })

    app.dependency_overrides.clear()

    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid email or password"


# /me (mocked Supabase + valid token) 

def test_me_returns_current_user_with_valid_token():
    token = create_token(user_id="u1", email="a@b.com")

    app.dependency_overrides[get_db] = lambda: FakeSupabase(
        existing_data=[{"id": "u1", "email": "a@b.com", "sme_name": "Acme", "location_uk": "Glasgow"}]
    )

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})

    app.dependency_overrides.clear()

    assert res.status_code == 200
    assert res.json()["email"] == "a@b.com"


def test_me_rejects_missing_token():
    res = client.get("/api/auth/me")
    assert res.status_code == 403  # HTTPBearer's default when no header is sent