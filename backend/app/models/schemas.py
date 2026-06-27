from typing import Literal

from pydantic import BaseModel


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []
    persona: Literal["professional", "casual"] = "professional"
    voice_mode: bool = False


class TTSRequest(BaseModel):
    text: str
