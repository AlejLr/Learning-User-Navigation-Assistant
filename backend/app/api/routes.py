from fastapi import APIRouter

from app.models.schemas import ChatRequest, ChatResponse
from app.services import llm, retrieval

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    chunks, sources = retrieval.retrieve(request.message)
    response_text = llm.chat(request.message, chunks)
    return ChatResponse(response=response_text, sources=sources)
