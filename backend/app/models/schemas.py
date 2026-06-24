from typing import Literal

from pydantic import BaseModel


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []
    persona: Literal["professional", "casual"] = "professional"


class ChatResponse(BaseModel):
    response: str
    sources: list[str]
    history: list[Message]
