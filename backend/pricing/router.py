import time

from fastapi import APIRouter
import pandas as pd
import os
import requests as req
from dotenv import load_dotenv

load_dotenv()

ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

router = APIRouter()

CSV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data", "worldbank_clean.csv"
)

_cache = {}
_cache_time = {}
CACHE_TTL = 3600  # 1 hour cache

COMMODITY_UNITS = {
    "Crude oil, Brent":    "USD per barrel",
    "Natural gas, Europe": "USD per mmbtu",
    "Coal, Australian":    "USD per metric ton",
    "Aluminum":            "USD per metric ton",
    "Copper":              "USD per metric ton",
    "Nickel":              "USD per metric ton",
    "Zinc":                "USD per metric ton",
    "Lead":                "USD per metric ton",
    "Iron ore, cfr spot":  "USD per dry metric ton",
    "Wheat, US HRW":       "USD per metric ton",
    "Maize":               "USD per metric ton",
    "Sugar, world":        "USD per kg",
    "Palm oil":            "USD per metric ton",
    "Soybeans":            "USD per metric ton",
}

COMMODITY_CATEGORIES = {
    "Crude oil, Brent":    "Energy",
    "Natural gas, Europe": "Energy",
    "Coal, Australian":    "Energy",
    "Aluminum":            "Metals",
    "Copper":              "Metals",
    "Nickel":              "Metals",
    "Zinc":                "Metals",
    "Lead":                "Metals",
    "Iron ore, cfr spot":  "Metals",
    "Wheat, US HRW":       "Agriculture",
    "Maize":               "Agriculture",
    "Sugar, world":        "Agriculture",
    "Palm oil":            "Agriculture",
    "Soybeans":            "Agriculture",
}

# Alpha Vantage commodity function mapping
ALPHA_VANTAGE_COMMODITIES = {
    "Copper": "COPPER",
    "Aluminum": "ALUMINUM",
    "Crude oil, Brent": "BRENT",
    "Natural gas, Europe": "NATURAL_GAS",
    "Coal, Australian": None,        # Not available in Alpha Vantage
    "Nickel": "NICKEL",
    "Zinc": "ZINC",
    "Lead": "LEAD",
    "Iron ore, cfr spot": None,      # Not available
    "Wheat, US HRW": "WHEAT",
    "Maize": "CORN",
    "Sugar, world": "SUGAR",
    "Palm oil": None,                # Not available
    "Soybeans": "SOYBEANS",
}



@router.get("/historical")
def get_historical_prices():
    df = pd.read_csv(CSV_PATH)
    df = df.fillna("")
    
    commodities = []
    for commodity in COMMODITY_UNITS.keys():
        if commodity not in df.columns:
            continue
        
        # Latest price
        latest_row = df[df[commodity] != ""].iloc[-1]
        latest_price = latest_row[commodity]
        latest_date = latest_row["date"]
        
        # Previous month price for change calculation
        valid_rows = df[df[commodity] != ""]
        if len(valid_rows) >= 2:
            prev_price = valid_rows.iloc[-2][commodity]
            change = ((float(latest_price) - float(prev_price)) / float(prev_price)) * 100
        else:
            change = 0

        # Last 12 months for chart
        last_12 = valid_rows.tail(12)[["date", commodity]].to_dict("records")
        chart_data = [
            {"date": row["date"], "price": row[commodity]}
            for row in last_12
        ]

        commodities.append({
            "name": commodity,
            "category": COMMODITY_CATEGORIES[commodity],
            "latest_price": round(float(latest_price), 2),
            "latest_date": latest_date,
            "unit": COMMODITY_UNITS[commodity],
            "monthly_change": round(change, 2),
            "trend": "up" if change > 0 else "down",
            "chart_data": chart_data
        })

    return {"commodities": commodities}

@router.get("/live")
def get_live_prices():
    live_prices = {}
    # If cache is fresh then return cache 
    if _cache and (time.time() - _cache_time.get("last", 0)) < CACHE_TTL:
        return {"live_prices": _cache, "source": "cache"}


    for commodity, av_function in ALPHA_VANTAGE_COMMODITIES.items():
        if av_function is None:
            live_prices[commodity] = {
                "price": None,
                "date": None,
                "source": "not_available"
            }
            continue

        try:
            url = f"https://www.alphavantage.co/query?function={av_function}&interval=monthly&apikey={ALPHA_VANTAGE_KEY}"
            response = req.get(url, timeout=10)
            data = response.json()

             # Rate limit check
            if "Note" in data or "Information" in data:
                live_prices[commodity] = {
                    "price": None,
                    "date": None,
                    "source": "rate_limited"
                }
                continue

            # Alpha Vantage returns 'data' array with latest first
            if "data" in data and len(data["data"]) > 0:
                latest = data["data"][0]
                live_prices[commodity] = {
                    "price": float(latest["value"]),
                    "date": latest["date"],
                    "source": "alpha_vantage"
                }
            else:
                live_prices[commodity] = {
                    "price": None,
                    "date": None,
                    "source": "error"
                }

        except Exception as e:
            live_prices[commodity] = {
                "price": None,
                "date": None,
                "source": "error"
            }
         # Delay between calls to avoid rate limit
        time.sleep(12)  # 5 calls per minute on free tier

    _cache.clear()
    _cache.update(live_prices)
    _cache_time["last"] = time.time()

    return {"live_prices": live_prices}