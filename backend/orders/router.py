from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from functools import lru_cache
from db.client import get_supabase

router = APIRouter()


@lru_cache()
def get_db():
    return get_supabase()


class OrderRequest(BaseModel):
    party_a_name: str
    party_a_commodity: str
    party_a_quantity: float
    party_b_name: str
    party_b_commodity: str
    party_b_quantity: float
    status: str
    fair_value_delta: float
    fair_value: float
    platform_fee: float
    vat_treatment: str
    escrow_status: str
    note: Optional[str] = None
    initiator_user_id: Optional[str] = None
    counterparty_user_id: Optional[str] = None


@router.get("/")
def get_orders(user_id: str = None, supabase = Depends(get_db)):
    query = supabase.table("orders").select("*").order("created_at", desc=True)
    if user_id:
        query = query.or_(f"initiator_user_id.eq.{user_id},counterparty_user_id.eq.{user_id}")
    response = query.execute()
    return {"orders": response.data}


@router.post("/")
def create_order(order: OrderRequest, supabase = Depends(get_db)):
    response = supabase.table("orders").insert(order.model_dump(exclude_none=True)).execute()
    return {"message": "Order created", "order": response.data[0]}


@router.get("/{order_id}")
def get_order(order_id: str, supabase = Depends(get_db)):
    response = supabase.table("orders").select("*").eq("id", order_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return response.data[0]


@router.patch("/{order_id}")
def update_order_note(order_id: str, note: dict, supabase = Depends(get_db)):
    response = supabase.table("orders").update({
        "note": note["note"]
    }).eq("id", order_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return response.data[0]