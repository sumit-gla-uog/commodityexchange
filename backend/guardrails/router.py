from fastapi import APIRouter, Depends
from functools import lru_cache
from db.client import get_supabase
from .service import get_logs

router = APIRouter()


@lru_cache()
def get_db():
    return get_supabase()


@router.get("/log")
def get_guardrail_logs(page: int = 1, page_size: int = 5, supabase = Depends(get_db)):
    result = get_logs(supabase, page, page_size)
    return {
        "logs": [
            {
                "status": log["status"],
                "query": log["query"],
                "reason": log["reason"],
                "timestamp": log["created_at"],
            }
            for log in result["logs"]
        ],
        "total": result["total"],
    }