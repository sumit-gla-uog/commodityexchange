from fastapi import APIRouter
import pandas as pd
import os

router = APIRouter()

CSV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data", "worldbank_clean.csv"
)

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