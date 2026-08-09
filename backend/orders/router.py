from fastapi import APIRouter
import json
import os

router = APIRouter()

# TODO: I'll Replace mock data with Supabase query
# supabase.table("orders").select("*").execute()
MOCK_ORDERS_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "mock_orders.json"
)


def load_orders():
    with open(MOCK_ORDERS_PATH, "r") as f:
        data = json.load(f)
    return data["orders"]


@router.get("/")
def get_orders():
    # TODO: Replace with Supabase query filtered by user
    orders = load_orders()
    return {"orders": orders}


@router.get("/{order_id}")
def get_order(order_id: str):
    # TODO: Replace with Supabase query by id
    orders = load_orders()
    order = next((o for o in orders if o["id"] == order_id), None)
    if not order:
        return {"error": "Order not found"}
    return order

@router.post("/")
def create_order(order: dict):
    # TODO: Replace with Supabase insert
    # supabase.table("orders").insert(order).execute()
    return {
        "message": "Order created successfully",
        "order": order
    }