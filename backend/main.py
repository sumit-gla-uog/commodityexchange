from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CommodEx API",
    description="B2B Commodity Exchange Platform API",
    version="1.0.0"
)

# CORS -Allow React frontend 
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # React dev server
        "http://localhost:5173",    # Vite dev server
        "https://commodex.netlify.app"  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "CommodEx API",
        "version": "1.0.0"
    }

# Routers - I will uncomment each module as it is implemented
# from rag.router import router as rag_router
from barter.router import router as barter_router
from pricing.router import router as pricing_router
# from auth.router import router as auth_router

# app.include_router(rag_router, prefix="/api/chat", tags=["RAG"])
app.include_router(barter_router, prefix="/api/barter", tags=["Barter"])
app.include_router(pricing_router, prefix="/api/prices", tags=["Pricing"])
# app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])