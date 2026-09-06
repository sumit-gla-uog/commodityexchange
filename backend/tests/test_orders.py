import pytest
from fastapi.testclient import TestClient
from main import app
from orders.router import get_db

client = TestClient(app)


class FakeResponse:
    def __init__(self, data):
        self.data = data


class FakeQuery:
    def __init__(self, response_data):
        self._response_data = response_data
        self._or_filter = None

    def select(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def insert(self, *args, **kwargs):
        return self

    def update(self, *args, **kwargs):
        return self

    def or_(self, filter_str, *args, **kwargs):
        self._or_filter = filter_str
        return self

    def execute(self):
        return FakeResponse(self._response_data)


class FakeSupabase:
    def __init__(self, response_data):
        self._response_data = response_data

    def table(self, name):
        return FakeQuery(self._response_data)


VALID_ORDER_PAYLOAD = {
    "party_a_name": "OM Exchange Ltd",
    "party_a_commodity": "Copper",
    "party_a_quantity": 50,
    "party_b_name": "Scottish Metals Ltd",
    "party_b_commodity": "Aluminum",
    "party_b_quantity": 48,
    "status": "pending",
    "fair_value_delta": 512528,
    "fair_value": 677600,
    "platform_fee": 1537.58,
    "vat_treatment": "Zero-rated",
    "escrow_status": "pending",
    "initiator_user_id": "907ab4fe-d718-4d7c-a4ae-60d24a190c76",
    "counterparty_user_id": None,
}


#  POST / (create order)

def test_create_order_success():
    created = {**VALID_ORDER_PAYLOAD, "id": "order-1"}
    app.dependency_overrides[get_db] = lambda: FakeSupabase([created])

    res = client.post("/api/orders/", json=VALID_ORDER_PAYLOAD)
    app.dependency_overrides.clear()

    assert res.status_code == 200
    body = res.json()
    assert body["message"] == "Order created"
    assert body["order"]["id"] == "order-1"


def test_create_order_rejects_missing_required_field():
    incomplete_payload = {k: v for k, v in VALID_ORDER_PAYLOAD.items() if k != "party_a_name"}

    res = client.post("/api/orders/", json=incomplete_payload)

    assert res.status_code == 422  # Pydantic validation error


def test_create_order_allows_optional_fields_to_be_omitted():
    payload = {k: v for k, v in VALID_ORDER_PAYLOAD.items() if k not in ("note", "counterparty_user_id")}
    created = {**payload, "id": "order-2"}

    app.dependency_overrides[get_db] = lambda: FakeSupabase([created])

    res = client.post("/api/orders/", json=payload)
    app.dependency_overrides.clear()

    assert res.status_code == 200


#  GET / (list orders) 

def test_get_orders_returns_all_when_no_user_id():
    orders = [{"id": "o1"}, {"id": "o2"}]
    app.dependency_overrides[get_db] = lambda: FakeSupabase(orders)

    res = client.get("/api/orders/")
    app.dependency_overrides.clear()

    assert res.status_code == 200
    assert len(res.json()["orders"]) == 2


def test_get_orders_filters_by_user_id():
    orders = [{"id": "o1", "initiator_user_id": "u1"}]
    app.dependency_overrides[get_db] = lambda: FakeSupabase(orders)

    res = client.get("/api/orders/", params={"user_id": "u1"})
    app.dependency_overrides.clear()

    assert res.status_code == 200
    assert res.json()["orders"] == orders


#  GET /{order_id}

def test_get_order_returns_single_order():
    order = {"id": "order-1", "party_a_name": "OM Exchange Ltd"}
    app.dependency_overrides[get_db] = lambda: FakeSupabase([order])

    res = client.get("/api/orders/order-1")
    app.dependency_overrides.clear()

    assert res.status_code == 200
    assert res.json()["id"] == "order-1"


def test_get_order_returns_404_for_unknown_id():
    app.dependency_overrides[get_db] = lambda: FakeSupabase([])

    res = client.get("/api/orders/unknown-id")
    app.dependency_overrides.clear()

    assert res.status_code == 404
    assert res.json()["detail"] == "Order not found"


# PATCH /{order_id} (update note)

def test_update_order_note_success():
    updated = {"id": "order-1", "note": "delivered on time"}
    app.dependency_overrides[get_db] = lambda: FakeSupabase([updated])

    res = client.patch("/api/orders/order-1", json={"note": "delivered on time"})
    app.dependency_overrides.clear()

    assert res.status_code == 200
    assert res.json()["note"] == "delivered on time"


def test_update_order_note_returns_404_for_unknown_order():
    app.dependency_overrides[get_db] = lambda: FakeSupabase([])

    res = client.patch("/api/orders/unknown-id", json={"note": "some note"})
    app.dependency_overrides.clear()

    assert res.status_code == 404