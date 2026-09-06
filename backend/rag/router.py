from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
# from rag.engine import query
# from rag.engine import query, retrieve_context, build_prompt, generate_response
from guardrails.checks import run_all_guards
from rag.agent import agentic_query

router = APIRouter()


class ChatRequest(BaseModel):
    query: str


class ChatResponse(BaseModel):
    query: str
    answer: str


# @router.post("/", response_model=ChatResponse)
# def chat(request: ChatRequest):
#     try:
#         answer = query(request.query)
#         return ChatResponse(
#             query=request.query,
#             answer=answer
#         )
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# currently only using agentic rag not normal rag chat endpoint, uncomment it when required ofr testing
# @router.post("/", response_model=ChatResponse)
# def chat(request: ChatRequest):
#     try:
#         # Input guards || topic + toxicity check
        
#         guard_result = run_all_guards(query=request.query)
        
#         if not guard_result["overall_passed"]:
#             return ChatResponse(
#                 query=request.query,
#                 answer=f"I cannot process this query. {guard_result['topic_guard']['reason'] if guard_result['topic_guard'] else guard_result['toxicity_guard']['reason']}"
#             )

#         # RAG pipeline
#         docs, metadatas = retrieve_context(request.query)
#         prompt = build_prompt(request.query, docs, metadatas)
#         answer = generate_response(prompt)

#         # Output guards || hallucination + length check
#         output_guard = run_all_guards(
#             query=request.query,
#             answer=answer,
#             context_chunks=docs
#         )

#         return ChatResponse(
#             query=request.query,
#             answer=answer
#         )

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.post("/agentic", response_model=ChatResponse)
def agentic_chat(request: ChatRequest):
    try:
        # Run all guardrails first
        # print('agentic_chat called with:', request.query)
        guard_result = run_all_guards(query=request.query)
        # print('guard_result:', guard_result)

        if not guard_result["overall_passed"]:
            return ChatResponse(
                query=request.query,
                answer=f"I cannot process this query. {guard_result['topic_guard']['reason'] if guard_result['topic_guard'] else guard_result['toxicity_guard']['reason']}"
            )

        # Agentic RAG || uses live prices + news + historical context
        answer = agentic_query(request.query)

        return ChatResponse(
            query=request.query,
            answer=answer
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))