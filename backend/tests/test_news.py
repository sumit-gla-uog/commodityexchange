from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app
from news.router import is_commodity_relevant, parse_feed

client = TestClient(app)


# is_commodity_relevant

def test_is_commodity_relevant_matches_keyword_in_title():
    assert is_commodity_relevant("Copper prices surge", "") is True


def test_is_commodity_relevant_matches_keyword_in_summary():
    assert is_commodity_relevant("Market update", "Wheat futures fell today") is True


def test_is_commodity_relevant_returns_false_when_no_keyword_present():
    assert is_commodity_relevant("Sports team wins championship", "Local news roundup") is False


# parse_feed 

SAMPLE_RSS = b"""<?xml version="1.0"?>
<rss><channel>
  <item>
    <title>Oil prices rise on geopolitical risk</title>
    <link>http://example.com/oil</link>
    <pubDate>Fri, 28 Aug 2026 10:00:00 GMT</pubDate>
    <description>Crude oil prices increased amid tensions.</description>
  </item>
  <item>
    <title>Local team wins the finals</title>
    <link>http://example.com/sports</link>
    <pubDate>Fri, 28 Aug 2026 09:00:00 GMT</pubDate>
    <description>A sports story with no relevance.</description>
  </item>
</channel></rss>"""


@patch("news.router.req.get")
def test_parse_feed_returns_only_commodity_relevant_articles(mock_get):
    mock_get.return_value.content = SAMPLE_RSS

    articles = parse_feed("http://fake-feed.com/rss")

    assert len(articles) == 1
    assert articles[0]["title"] == "Oil prices rise on geopolitical risk"
    assert articles[0]["link"] == "http://example.com/oil"
    assert "Crude oil prices increased" in articles[0]["summary"]


@patch("news.router.req.get")
def test_parse_feed_returns_empty_list_on_request_failure(mock_get):
    mock_get.side_effect = Exception("network error")

    articles = parse_feed("http://fake-feed.com/rss")

    assert articles == []


@patch("news.router.req.get")
def test_parse_feed_truncates_long_summary_to_200_chars(mock_get):
    long_description = "commodity " + ("x" * 300)
    xml = f"""<?xml version="1.0"?>
    <rss><channel>
      <item>
        <title>Commodity report</title>
        <link>http://example.com/report</link>
        <pubDate>Fri, 28 Aug 2026 10:00:00 GMT</pubDate>
        <description>{long_description}</description>
      </item>
    </channel></rss>""".encode()
    mock_get.return_value.content = xml

    articles = parse_feed("http://fake-feed.com/rss")

    assert len(articles[0]["summary"]) == 200


# ---------- GET / (news endpoint) ----------

@patch("news.router.parse_feed")
def test_get_news_aggregates_articles_from_all_feeds(mock_parse_feed):
    mock_parse_feed.side_effect = [
        [{"title": "Feed 1 article"}],
        [{"title": "Feed 2 article"}],
    ]

    res = client.get("/api/news/")

    assert res.status_code == 200
    body = res.json()
    assert body["total"] == 2
    assert body["source"] == "Yahoo Finance"
    assert mock_parse_feed.call_count == 2


@patch("news.router.parse_feed")
def test_get_news_limits_to_top_10_articles(mock_parse_feed):
    mock_parse_feed.side_effect = [
        [{"title": f"Article {i}"} for i in range(15)],
        [],
    ]

    res = client.get("/api/news/")

    assert res.status_code == 200
    assert res.json()["total"] == 10