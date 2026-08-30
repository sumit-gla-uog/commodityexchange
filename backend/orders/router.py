from fastapi import APIRouter, HTTPException
from db.client import get_supabase

router = APIRouter()


@router.get("/")
def get_orders(user_id: str = None):
    supabase = get_supabase()
    query = supabase.table("orders").select("*").order("created_at", desc=True)
    if user_id:
        query = query.or_(f"initiator_user_id.eq.{user_id},counterparty_user_id.eq.{user_id}")
    response = query.execute()
    return {"orders": response.data}

@router.post("/")
def create_order(order: dict):
    supabase = get_supabase()
    response = supabase.table("orders").insert(order).execute()
    return {"message": "Order created", "order": response.data[0]}


@router.get("/{order_id}")
def get_order(order_id: str):
    supabase = get_supabase()
    response = supabase.table("orders").select("*").eq("id", order_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return response.data[0]


@router.patch("/{order_id}")
def update_order_note(order_id: str, note: dict):
    supabase = get_supabase()
    response = supabase.table("orders").update({
        "note": note["note"]
    }).eq("id", order_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return response.data[0]