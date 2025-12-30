from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.chat import QueryRequest, QueryResponse
from app.core.config import settings
from app.services.rag import answer_with_rag
from pydantic import BaseModel

app = FastAPI(title="Portfolio AI Navigation Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000","*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
    
@app.post("/query", response_model=QueryResponse)
def query(req: QueryRequest):
    return answer_with_rag(req)

@app.get("/health")
def health():
    return {"status": "ok"}