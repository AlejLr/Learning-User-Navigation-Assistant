import json

from fastapi import APIRouter, Response
from fastapi.responses import StreamingResponse

from app.models.schemas import ChatRequest, Message, TTSRequest
from app.services import llm, retrieval, tts

router = APIRouter()


@router.post("/chat")
async def chat(request: ChatRequest) -> StreamingResponse:
    chunks, sources = retrieval.retrieve(request.message)

    async def event_stream():
        full_response = ""
        async for event in llm.chat_stream(
            request.message, chunks, request.history, request.persona, request.voice_mode
        ):
            if event["type"] == "token":
                full_response += event["text"]
            yield f"data: {json.dumps(event)}\n\n"

        updated_history = request.history + [
            Message(role="user", content=request.message),
            Message(role="assistant", content=full_response),
        ]
        done_payload = {
            "type": "done",
            "sources": sources,
            "history": [m.model_dump() for m in updated_history],
        }
        yield f"data: {json.dumps(done_payload)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/tts")
def text_to_speech(request: TTSRequest) -> Response:
    audio = tts.synthesize(request.text)
    if not audio:
        return Response(status_code=204)
    return Response(content=audio, media_type="audio/mpeg")
