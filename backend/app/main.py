from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class QueryRequest(BaseModel):
    question: str
    mode: str | None = "visitor"
    
class QueryResponse(BaseModel):
    answer: str
    
@app.post("/query", response_model=QueryResponse)
def query(req: QueryRequest):
    # TODO: wire retrieval + LLM here
    return QueryResponse(answer=f"[{req.mode} mode] Placeholder answer for: {req.question}")

@app.get("/health")
def health():
    return {"status": "ok"}