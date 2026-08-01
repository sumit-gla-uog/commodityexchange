from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from rag.engine import query

router = APIRouter()


class ChatRequest(BaseModel):
    query: str


class ChatResponse(BaseModel):
    query: str
    answer: str


@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        answer = query(request.query)
        return ChatResponse(
            query=request.query,
            answer=answer
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))