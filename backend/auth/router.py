from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from db.client import get_supabase
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET", "commodex-secret-key-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24


# Request models
class RegisterRequest(BaseModel):
    email: str
    password: str
    sme_name: str
    location_uk: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/register")
def register(request: RegisterRequest):
    supabase = get_supabase()

    # Check if email already exists
    existing = supabase.table("users").select("id").eq("email", request.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed = bcrypt.hashpw(request.password.encode(), bcrypt.gensalt()).decode()

    # Save to Supabase
    response = supabase.table("users").insert({
        "email": request.email,
        "password": hashed,
        "sme_name": request.sme_name,
        "location_uk": request.location_uk
    }).execute()

    user = response.data[0]
    token = create_token(user["id"], user["email"])

    return {
        "message": "Registration successful",
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "sme_name": user["sme_name"]
        }
    }


@router.post("/login")
def login(request: LoginRequest):
    supabase = get_supabase()

    # Find user
    response = supabase.table("users").select("*").eq("email", request.email).execute()
    if not response.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = response.data[0]

    # Verify password
    if not bcrypt.checkpw(request.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(user["id"], user["email"])

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "sme_name": user["sme_name"]
        }
    }


@router.get("/me")
def get_me(payload: dict = Depends(verify_token)):
    supabase = get_supabase()
    response = supabase.table("users").select("id, email, sme_name, location_uk").eq("id", payload["user_id"]).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    return response.data[0]