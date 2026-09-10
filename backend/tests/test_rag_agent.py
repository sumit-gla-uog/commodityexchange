import pytest
from unittest.mock import patch, MagicMock
from rag.agent import get_historical_context, get_live_price, get_commodity_news


# get_historical_context

@patch("rag.agent.chromadb.PersistentClient")
@patch("rag.agent.requests.post")
def test_get_historical_context_returns_joined_documents(mock_post, mock_chroma_client):
    mock_post.return_value.json.return_value = [[0.1, 0.2, 0.3]]

    mock_collection = MagicMock()
    mock_collection.query.return_value = {
        "documents": [["Copper was priced at 13552 USD in 2026-03", "Copper rose 2% in 2026-02"]],
        "metadatas": [[{"source": "World Bank"}, {"source": "World Bank"}]]
    }
    mock_chroma_client.return_value.get_collection.return_value = mock_collection

    result = get_historical_context.func("copper price trend")

    assert "Copper was priced at 13552 USD" in result
    assert "Copper rose 2%" in result


@patch("rag.agent.requests.post")
def test_get_historical_context_handles_embedding_failure_gracefully(mock_post):
    mock_post.side_effect = Exception("HF API timeout")

    result = get_historical_context.func("copper price trend")

    assert "Historical data unavailable" in result
    assert "HF API timeout" in result


# get_live_price

@patch("rag.agent.requests.get")
def test_get_live_price_returns_formatted_price(mock_get):
    mock_get.return_value.json.return_value = {
        "data": [{"value": "83.76", "date": "2026-07-01"}]
    }

    result = get_live_price.func("crude oil")

    assert "83.76 USD" in result
    assert "2026-07-01" in result
    assert "Alpha Vantage" in result


def test_get_live_price_returns_not_available_for_unmapped_commodity():
    result = get_live_price.func("gold")

    assert "Live price not available for gold" in result


@patch("rag.agent.requests.get")
def test_get_live_price_handles_empty_api_response(mock_get):
    mock_get.return_value.json.return_value = {}

    result = get_live_price.func("copper")

    assert "Live price data not available for copper" in result


@patch("rag.agent.requests.get")
def test_get_live_price_handles_request_exception(mock_get):
    mock_get.side_effect = Exception("network error")

    result = get_live_price.func("wheat")

    assert "Error fetching live price" in result
    assert "network error" in result


# get_commodity_news

SAMPLE_RSS_XML = b"""<?xml version="1.0"?>
<rss><channel>
  <item><title>Oil prices rise on geopolitical risk</title><pubDate>Fri, 28 Aug 2026 10:00:00 GMT</pubDate></item>
  <item><title>Random unrelated headline</title><pubDate>Fri, 28 Aug 2026 09:00:00 GMT</pubDate></item>
  <item><title>Gold market signals shift</title><pubDate>Wed, 26 Aug 2026 08:00:00 GMT</pubDate></item>
</channel></rss>"""


@patch("rag.agent.requests.get")
def test_get_commodity_news_filters_by_commodity_name(mock_get):
    mock_get.return_value.content = SAMPLE_RSS_XML

    result = get_commodity_news.func("oil")

    assert "Oil prices rise on geopolitical risk" in result
    assert "Random unrelated headline" not in result


@patch("rag.agent.requests.get")
def test_get_commodity_news_falls_back_to_general_market_news(mock_get):
    # No item title contains the commodity name or any market keyword
    xml = b"""<?xml version="1.0"?>
    <rss><channel>
      <item><title>Sports team wins championship</title><pubDate>Fri, 28 Aug 2026 10:00:00 GMT</pubDate></item>
    </channel></rss>"""
    mock_get.return_value.content = xml

    result = get_commodity_news.func("silver")

    assert "Sports team wins championship" in result


@patch("rag.agent.requests.get")
def test_get_commodity_news_handles_request_exception(mock_get):
    mock_get.side_effect = Exception("feed unreachable")

    result = get_commodity_news.func("oil")

    assert "News unavailable" in result
    assert "feed unreachable" in result