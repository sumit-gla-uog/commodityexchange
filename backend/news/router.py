from fastapi import APIRouter
import requests as req
import xml.etree.ElementTree as ET
from datetime import datetime

router = APIRouter()

# Yahoo finance feeds for commodity news
NEWS_FEEDS = [
    "https://feeds.finance.yahoo.com/rss/2.0/headline?s=CPER,GLD,USO,UNG,WEAT,CORN,SOYB&region=US&lang=en-US",
    "https://finance.yahoo.com/news/rssindex",
]

COMMODITY_KEYWORDS = [
    "copper", "aluminum", "aluminium", "oil", "gas", "wheat",
    "corn", "maize", "sugar", "commodity", "commodities",
    "metal", "energy", "agriculture", "crude", "brent",
    "nickel", "zinc", "lead", "iron", "coal", "soybean",
    "procurement", "supply chain", "prices", "inflation"
]


def is_commodity_relevant(title: str, summary: str) -> bool:
    text = (title + " " + summary).lower()
    return any(keyword in text for keyword in COMMODITY_KEYWORDS)


def parse_feed(url: str) -> list:
    try:
        response = req.get(url, timeout=10, headers={"User-Agent": "CommodEx/1.0"})
        root = ET.fromstring(response.content)
        
        articles = []
        for item in root.findall(".//item"):
            title = item.findtext("title", "")
            link = item.findtext("link", "")
            pub_date = item.findtext("pubDate", "")
            description = item.findtext("description", "")

            if is_commodity_relevant(title, description):
                articles.append({
                    "title": title,
                    "link": link,
                    "published": pub_date,
                    "summary": description[:200] if description else ""
                })

        return articles

    except Exception as e:
        return []


@router.get("/")
def get_news():
    all_articles = []

    for feed_url in NEWS_FEEDS:
        articles = parse_feed(feed_url)
        all_articles.extend(articles)

    # Sort by published date, return top 10
    all_articles = all_articles[:10]

    return {
        "articles": all_articles,
        "total": len(all_articles),
        "source": "Yahoo Finance"
    }