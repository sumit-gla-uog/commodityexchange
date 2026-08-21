from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db.client import get_supabase
import pandas as pd
import os

router = APIRouter()

CSV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data", "worldbank_clean.csv"
)


def get_latest_price(commodity: str):
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


class ListingRequest(BaseModel):
    sme_name: str
    commodity_offered: str
    quantity_offered_mt: float
    commodity_wanted: str
    quantity_wanted_mt: float
    location_uk: str


@router.get("/listings")
def get_listings(status: str = "active"):
    supabase = get_supabase()
    response = supabase.table("listings").select("*").eq("status", status).execute()
    return {"listings": response.data}


@router.post("/listings")
def create_listing(request: ListingRequest):
    supabase = get_supabase()
    data = {
        "sme_name": request.sme_name,
        "commodity_offered": request.commodity_offered,
        "quantity_offered_mt": request.quantity_offered_mt,
        "commodity_wanted": request.commodity_wanted,
        "quantity_wanted_mt": request.quantity_wanted_mt,
        "location_uk": request.location_uk,
        "status": "active"
    }
    response = supabase.table("listings").insert(data).execute()
    return {"message": "Listing created", "data": response.data[0]}


@router.get("/listings/{listing_id}")
def get_listing(listing_id: str):
    supabase = get_supabase()
    response = supabase.table("listings").select("*").eq("id", listing_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Listing not found")
    return response.data[0]


@router.post("/match/{listing_id}")
def match_listing(listing_id: str):
    supabase = get_supabase()

    # Get source listing
    source_res = supabase.table("listings").select("*").eq("id", listing_id).execute()
    if not source_res.data:
        raise HTTPException(status_code=404, detail="Listing not found")
    source = source_res.data[0]

    # Get all active listings
    all_res = supabase.table("listings").select("*").eq("status", "active").execute()
    listings = all_res.data

    matches = []
    for listing in listings:
        if listing["id"] == source["id"]:
            continue
        if listing["commodity_offered"] != source["commodity_wanted"]:
            continue
        if listing["commodity_wanted"] != source["commodity_offered"]:
            continue

        qty_diff = abs(listing["quantity_offered_mt"] - source["quantity_wanted_mt"])
        qty_max = max(listing["quantity_offered_mt"], source["quantity_wanted_mt"])
        if (qty_diff / qty_max) > 0.20:
            continue

        fair_value = calculate_fair_value(source, listing)
        matches.append({
            "matched_listing": listing,
            "fair_value": fair_value
        })

    if not matches:
        return {"message": "No matches found", "matches": []}

    # Create order in Supabase
    if matches:
        order_data = {
            "party_a_name": source["sme_name"],
            "party_a_commodity": source["commodity_offered"],
            "party_a_quantity": source["quantity_offered_mt"],
            "party_b_name": matches[0]["matched_listing"]["sme_name"],
            "party_b_commodity": matches[0]["matched_listing"]["commodity_offered"],
            "party_b_quantity": matches[0]["matched_listing"]["quantity_offered_mt"],
            "fair_value_delta": matches[0]["fair_value"]["delta_usd"] if matches[0]["fair_value"] else 0,
            "status": "pending"
        }
        supabase.table("orders").insert(order_data).execute()

    return {
        "source_listing": source,
        "matches": matches,
        "total_matches": len(matches)
    }