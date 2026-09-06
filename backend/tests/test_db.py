from unittest.mock import patch
from db.client import get_supabase


@patch("db.client.create_client")
def test_get_supabase_calls_create_client_with_env_vars(mock_create_client, monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://fake-project.supabase.co")
    monkeypatch.setenv("SUPABASE_KEY", "fake-anon-key")

    # Re-import module-level constants since they're read at import time
    import db.client as client_module
    client_module.SUPABASE_URL = "https://fake-project.supabase.co"
    client_module.SUPABASE_KEY = "fake-anon-key"

    mock_create_client.return_value = "fake-client-instance"

    result = get_supabase()

    mock_create_client.assert_called_once_with(
        "https://fake-project.supabase.co", "fake-anon-key"
    )
    assert result == "fake-client-instance"