import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from main import app
from barter.router import (
    get_db,
    calculate_fair_value,
    get_latest_price,
)

client = TestClient(app)


class FakeResponse:
    def __init__(self, data):
        self.data = data


class FakeQuery:
    """Chainable query builder that returns a fixed response regardless
    of which select/eq/insert/update/delete calls are made on it."""
    def __init__(self, response_data):
        self._response_data = response_data

    def select(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def insert(self, *args, **kwargs):
        return self

    def update(self, *args, **kwargs):
        return self

    def delete(self, *args, **kwargs):
        return self

    def execute(self):
        return FakeResponse(self._response_data)


class FakeSupabase:
    """Returns a different FakeQuery per table call, based on a
    table_name -> response_data map, so a single fake instance can
    serve multiple .table("listings")/.table("orders") calls with
    different canned responses."""
    def __init__(self, table_responses: dict):
        self._table_responses = table_responses

    def table(self, name):
        return FakeQuery(self._table_responses.get(name, []))


# calculate_fair_value (pure logic, mocked pricing) 

@patch("barter.router.get_latest_price")
def test_calculate_fair_value_balanced_pair(mock_price):
    # Copper at 13552/mt, Aluminum at 3439/mt — quantities chosen to balance
    mock_price.side_effect = lambda commodity: {
        "Copper": 13552.0,
        "Aluminum": 3439.0,
    }[commodity]

    listing_a = {"commodity_offered": "Copper", "quantity_offered_mt": 50}
    listing_b = {"commodity_offered": "Aluminum", "quantity_offered_mt": 197}

    result = calculate_fair_value(listing_a, listing_b)

    assert result is not None
    assert result["value_a"] == 677600.0
    assert result["value_b"] == 677483.0
    assert result["is_fair"] is True
    assert result["delta_pct"] < 5


@patch("barter.router.get_latest_price")
def test_calculate_fair_value_imbalanced_pair(mock_price):
    mock_price.side_effect = lambda commodity: {
        "Copper": 13552.0,
        "Aluminum": 3439.0,
    }[commodity]

    listing_a = {"commodity_offered": "Copper", "quantity_offered_mt": 100}
    listing_b = {"commodity_offered": "Aluminum", "quantity_offered_mt": 10}

    result = calculate_fair_value(listing_a, listing_b)

    assert result is not None
    assert result["is_fair"] is False
    assert result["delta_pct"] >= 5
    assert "Adjust quantity" in result["recommendation"]


@patch("barter.router.get_latest_price")
def test_calculate_fair_value_signed_delta_direction(mock_price):
    # value_a > value_b should give a positive delta_usd
    mock_price.side_effect = lambda commodity: {
        "Copper": 13552.0,
        "Aluminum": 3439.0,
    }[commodity]

    listing_a = {"commodity_offered": "Copper", "quantity_offered_mt": 100}
    listing_b = {"commodity_offered": "Aluminum", "quantity_offered_mt": 10}

    result = calculate_fair_value(listing_a, listing_b)
    assert result["delta_usd"] > 0

    # swapped listings should give a negative delta_usd
    result_swapped = calculate_fair_value(listing_b, listing_a)
    assert result_swapped["delta_usd"] < 0


@patch("barter.router.get_latest_price")
def test_calculate_fair_value_returns_none_when_price_missing(mock_price):
    mock_price.side_effect = lambda commodity: None if commodity == "Unknown Commodity" else 100.0

    listing_a = {"commodity_offered": "Unknown Commodity", "quantity_offered_mt": 50}
    listing_b = {"commodity_offered": "Copper", "quantity_offered_mt": 50}

    result = calculate_fair_value(listing_a, listing_b)
    assert result is None


# get_latest_price (CSV-backed, mocked pandas) 

@patch("barter.router.pd.read_csv")
def test_get_latest_price_returns_latest_valid_value(mock_read_csv):
    import pandas as pd
    mock_read_csv.return_value = pd.DataFrame({
        "date": ["2026-01", "2026-02", "2026-03"],
        "Copper": ["", 13000.0, 13552.0]
    })

    price = get_latest_price("Copper")
    assert price == 13552.0


@patch("barter.router.pd.read_csv")
def test_get_latest_price_returns_none_for_unknown_commodity(mock_read_csv):
    import pandas as pd
    mock_read_csv.return_value = pd.DataFrame({
        "date": ["2026-01"],
        "Copper": [13552.0]
    })

    price = get_latest_price("Unobtainium")
    assert price is None


# /match/{listing_id} endpoint (mocked Supabase + mocked pricing) 

@patch("barter.router.calculate_fair_value")
def test_match_listing_excludes_source_and_own_smes_listings(mock_fair_value):
    mock_fair_value.return_value = {
        "value_a": 1000, "value_b": 1000, "delta_usd": 0,
        "delta_pct": 0, "is_fair": True, "recommendation": "Fair exchange"
    }

    source = {"id": "L1", "sme_name": "Acme", "commodity_offered": "Copper", "commodity_wanted": "Aluminum", "quantity_offered_mt": 50}
    same_sme_listing = {"id": "L2", "sme_name": "Acme", "commodity_offered": "Aluminum", "commodity_wanted": "Copper", "quantity_offered_mt": 200}
    valid_match = {"id": "L3", "sme_name": "BuildRight", "commodity_offered": "Aluminum", "commodity_wanted": "Copper", "quantity_offered_mt": 197}

    app.dependency_overrides[get_db] = lambda: FakeSupabase({
        "listings": [source, same_sme_listing, valid_match]
    })

    res = client.post(f"/api/barter/match/{source['id']}")
    app.dependency_overrides.clear()

    assert res.status_code == 200
    body = res.json()
    matched_ids = [m["matched_listing"]["id"] for m in body["matches"]]
    assert "L3" in matched_ids
    assert "L2" not in matched_ids  # excluded: same sme_name as source


@patch("barter.router.calculate_fair_value")
def test_match_listing_excludes_non_reciprocal_commodities(mock_fair_value):
    mock_fair_value.return_value = {
        "value_a": 1000, "value_b": 1000, "delta_usd": 0,
        "delta_pct": 0, "is_fair": True, "recommendation": "Fair exchange"
    }

    source = {"id": "L1", "sme_name": "Acme", "commodity_offered": "Copper", "commodity_wanted": "Aluminum", "quantity_offered_mt": 50}
    # offers Aluminum (matches source's want) but wants Zinc, not Copper — not reciprocal
    non_reciprocal = {"id": "L2", "sme_name": "BuildRight", "commodity_offered": "Aluminum", "commodity_wanted": "Zinc", "quantity_offered_mt": 197}

    app.dependency_overrides[get_db] = lambda: FakeSupabase({
        "listings": [source, non_reciprocal]
    })

    res = client.post(f"/api/barter/match/{source['id']}")
    app.dependency_overrides.clear()

    assert res.status_code == 200
    assert res.json()["matches"] == []


def test_match_listing_returns_404_for_unknown_listing():
    app.dependency_overrides[get_db] = lambda: FakeSupabase({"listings": []})

    res = client.post("/api/barter/match/nonexistent-id")
    app.dependency_overrides.clear()

    assert res.status_code == 404


@patch("barter.router.calculate_fair_value")
def test_match_listing_skips_matches_with_no_fair_value(mock_fair_value):
    mock_fair_value.return_value = None  # simulates missing price data

    source = {"id": "L1", "sme_name": "Acme", "commodity_offered": "Copper", "commodity_wanted": "Aluminum", "quantity_offered_mt": 50}
    candidate = {"id": "L2", "sme_name": "BuildRight", "commodity_offered": "Aluminum", "commodity_wanted": "Copper", "quantity_offered_mt": 197}

    app.dependency_overrides[get_db] = lambda: FakeSupabase({
        "listings": [source, candidate]
    })

    res = client.post(f"/api/barter/match/{source['id']}")
    app.dependency_overrides.clear()

    assert res.status_code == 200
    assert res.json()["matches"] == []


# /listings/{listing_id} DELETE endpoint 

def test_delete_listing_rejects_non_active_status():
    app.dependency_overrides[get_db] = lambda: FakeSupabase({
        "listings": [{"status": "matched"}]
    })

    res = client.delete("/api/barter/listings/some-id")
    app.dependency_overrides.clear()

    assert res.status_code == 400
    assert res.json()["detail"] == "Only active listings can be deleted"


def test_delete_listing_returns_404_for_unknown_listing():
    app.dependency_overrides[get_db] = lambda: FakeSupabase({"listings": []})

    res = client.delete("/api/barter/listings/some-id")
    app.dependency_overrides.clear()

    assert res.status_code == 404