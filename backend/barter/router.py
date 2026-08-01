from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import os
import pandas as pd

router = APIRouter()

# TODO: I will replace mock data with Supabase database connection
# Mock data is used for prototype demo purposes only
# See mock_data.json for data structure reference
MOCK_DATA_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "mock_data.json"
)

# World Bank CSV for fair value calculation
CSV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data", "worldbank_clean.csv"
)


def load_listings():
    # TODO: Replace with Supabase query,  supabase.table("listings").select("*").execute()
    with open(MOCK_DATA_PATH, "r") as f:
        data = json.load(f)
    return data["listings"]


def get_latest_price(commodity: str):
    # Get latest price from World Bank CSV for fair value calculation
    df = pd.read_csv(CSV_PATH)
    if commodity not in df.columns:
        return None
    valid = df[df[commodity] != ""]
    if valid.empty:
        return None
    return float(valid.iloc[-1][commodity])


def calculate_fair_value(listing_a: dict, listing_b: dict):
    price_a = get_latest_price(listing_a["commodity_offered"])
    price_b = get_latest_price(listing_b["commodity_offered"])

    if not price_a or not price_b:
        return None

    value_a = listing_a["quantity_offered_mt"] * price_a
    value_b = listing_b["quantity_offered_mt"] * price_b
    delta = abs(value_a - value_b)
    higher = max(value_a, value_b)
    delta_pct = (delta / higher) * 100

    return {
        "value_a": round(value_a, 2),
        "value_b": round(value_b, 2),
        "delta_usd": round(delta, 2),
        "delta_pct": round(delta_pct, 2),
        "is_fair": delta_pct < 5,
        "recommendation": "Fair exchange" if delta_pct < 5
        else f"Adjust quantity by approximately {round(delta / price_b, 2)} mt to balance the exchange"
    }


# Request model for creating a listing
class ListingRequest(BaseModel):
    sme_name: str
    commodity_offered: str
    quantity_offered_mt: float
    commodity_wanted: str
    quantity_wanted_mt: float
    location_uk: str


@router.get("/listings")
def get_listings(status: str = "active"):
    # TODO: Replace with Supabase query filtered by status
    listings = load_listings()
    return {"listings": [l for l in listings if l["status"] == status]}


@router.post("/listings")
def create_listing(request: ListingRequest):
    # TODO: Replace with Supabase insert, supabase.table("listings").insert({...}).execute()
    # Mock response for prototype demo
    return {
        "id": "uuid-mock-new",
        "message": "Listing created successfully",
        "status": "active",
        "data": request.dict()
    }


@router.get("/listings/{listing_id}")
def get_listing(listing_id: str):
    # TODO: Will replace with Supabase query by id
    listings = load_listings()
    listing = next((l for l in listings if l["id"] == listing_id), None)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@router.post("/match/{listing_id}")
def match_listing(listing_id: str):
    # TODO: Replace with Supabase query for matching
    listings = load_listings()

    # Find the listing to match
    source = next((l for l in listings if l["id"] == listing_id), None)
    if not source:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Rule-based matching algorithm
    # Rule 1: commodity_offered matches commodity_wanted and vice versa
    # Rule 2: quantity within 20% tolerance
    # Rule 3: status must be active
    # Rule 4: no self match
    matches = []
    for listing in listings:
        if listing["id"] == source["id"]:
            continue
        if listing["status"] != "active":
            continue
        if listing["commodity_offered"] != source["commodity_wanted"]:
            continue
        if listing["commodity_wanted"] != source["commodity_offered"]:
            continue

        # Quantity tolerance check within 20 percent
        qty_diff = abs(listing["quantity_offered_mt"] - source["quantity_wanted_mt"])
        qty_max = max(listing["quantity_offered_mt"], source["quantity_wanted_mt"])
        if (qty_diff / qty_max) > 0.20:
            continue

        # Fair value calculation
        fair_value = calculate_fair_value(source, listing)

        matches.append({
            "matched_listing": listing,
            "fair_value": fair_value
        })

    if not matches:
        return {"message": "No matches found", "matches": []}

    if not matches:
        return {"message": "No matches found", "matches": []}

    # TODO: Auto-create order in Supabase when match is found
    mock_order = {
        "id": f"MCH-{listing_id[-4:]}",
        "sme_a": source["sme_name"],
        "commodity_a": source["commodity_offered"],
        "quantity_a": source["quantity_offered_mt"],
        "sme_b": matches[0]["matched_listing"]["sme_name"],
        "commodity_b": matches[0]["matched_listing"]["commodity_offered"],
        "quantity_b": matches[0]["matched_listing"]["quantity_offered_mt"],
        "fair_value_delta": matches[0]["fair_value"]["delta_usd"] if matches[0]["fair_value"] else 0,
        "status": "pending",
        "created_at": "2026-07-30"
    }

    return {
        "source_listing": source,
        "matches": matches,
        "total_matches": len(matches),
        "order_created": mock_order
    }

    return {
        "source_listing": source,
        "matches": matches,
        "total_matches": len(matches)
    }


# if matches:
#     # TODO: Auto_create order in Supabase when match is found
#     # For now mock response only
#     pass