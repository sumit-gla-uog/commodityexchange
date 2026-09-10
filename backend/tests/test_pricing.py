import time
import pytest
from unittest.mock import patch, MagicMock
import pandas as pd
import pricing.router as pricing_module


@pytest.fixture(autouse=True)
def reset_cache():
    """Ensure the module-level price cache doesn't leak between tests."""
    pricing_module._cache.clear()
    pricing_module._cache_time.clear()
    yield
    pricing_module._cache.clear()
    pricing_module._cache_time.clear()


# get_historical_prices 

@patch("pricing.router.pd.read_csv")
def test_get_historical_prices_computes_latest_price_and_change(mock_read_csv):
    mock_read_csv.return_value = pd.DataFrame({
        "date": ["2026-01", "2026-02", "2026-03"],
        "Copper": ["", 12000.0, 13552.0],
    })

    result = pricing_module.get_historical_prices()
    copper = next(c for c in result["commodities"] if c["name"] == "Copper")

    assert copper["latest_price"] == 13552.0
    assert copper["latest_date"] == "2026-03"
    assert copper["category"] == "Metals"
    assert copper["unit"] == "USD per metric ton"
    assert copper["trend"] == "up"
    expected_change = round(((13552.0 - 12000.0) / 12000.0) * 100, 2)
    assert copper["monthly_change"] == expected_change


@patch("pricing.router.pd.read_csv")
def test_get_historical_prices_marks_downward_trend(mock_read_csv):
    mock_read_csv.return_value = pd.DataFrame({
        "date": ["2026-01", "2026-02"],
        "Copper": [14000.0, 13000.0],
    })

    result = pricing_module.get_historical_prices()
    copper = next(c for c in result["commodities"] if c["name"] == "Copper")

    assert copper["trend"] == "down"
    assert copper["monthly_change"] < 0


@patch("pricing.router.pd.read_csv")
def test_get_historical_prices_skips_columns_not_in_csv(mock_read_csv):
    # CSV only has Copper | every other COMMODITY_UNITS entry should be skipped
    mock_read_csv.return_value = pd.DataFrame({
        "date": ["2026-01"],
        "Copper": [13552.0],
    })

    result = pricing_module.get_historical_prices()
    names = [c["name"] for c in result["commodities"]]

    assert names == ["Copper"]


@patch("pricing.router.pd.read_csv")
def test_get_historical_prices_handles_single_data_point(mock_read_csv):
    # Only one valid row - no previous price to compare against, change should be 0
    mock_read_csv.return_value = pd.DataFrame({
        "date": ["2026-01"],
        "Copper": [13552.0],
    })

    result = pricing_module.get_historical_prices()
    copper = next(c for c in result["commodities"] if c["name"] == "Copper")

    assert copper["monthly_change"] == 0
    assert copper["trend"] == "down"  # change > 0 is False when change == 0


# get_live_prices

@patch("pricing.router.time.sleep")
@patch("pricing.router.req.get")
def test_get_live_prices_returns_price_from_alpha_vantage(mock_get, mock_sleep):
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "data": [{"value": "83.76", "date": "2026-07-01"}]
    }
    mock_get.return_value = mock_response

    result = pricing_module.get_live_prices()

    assert result["live_prices"]["Copper"]["price"] == 83.76
    assert result["live_prices"]["Copper"]["source"] == "alpha_vantage"
    # commodities with no Alpha Vantage mapping should be marked not_available
    assert result["live_prices"]["Coal, Australian"]["source"] == "not_available"


@patch("pricing.router.time.sleep")
@patch("pricing.router.req.get")
def test_get_live_prices_handles_rate_limiting(mock_get, mock_sleep):
    mock_response = MagicMock()
    mock_response.json.return_value = {"Note": "API rate limit exceeded"}
    mock_get.return_value = mock_response

    result = pricing_module.get_live_prices()

    assert result["live_prices"]["Copper"]["source"] == "rate_limited"
    assert result["live_prices"]["Copper"]["price"] is None


@patch("pricing.router.time.sleep")
@patch("pricing.router.req.get")
def test_get_live_prices_handles_request_exception(mock_get, mock_sleep):
    mock_get.side_effect = Exception("network error")

    result = pricing_module.get_live_prices()

    assert result["live_prices"]["Copper"]["source"] == "error"
    assert result["live_prices"]["Copper"]["price"] is None


@patch("pricing.router.time.sleep")
@patch("pricing.router.req.get")
def test_get_live_prices_uses_cache_on_second_call(mock_get, mock_sleep):
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "data": [{"value": "83.76", "date": "2026-07-01"}]
    }
    mock_get.return_value = mock_response

    first_result = pricing_module.get_live_prices()
    assert "source" not in first_result  # fresh fetch has no top-level "source" key
    assert first_result["live_prices"]["Copper"]["source"] == "alpha_vantage"

    call_count_after_first = mock_get.call_count

    second_result = pricing_module.get_live_prices()

    assert second_result["source"] == "cache"
    # req.get should not have been called again on the cached path
    assert mock_get.call_count == call_count_after_first