import anthropic

from app.core.config import settings
from app.models.schemas import Message

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

MAX_HISTORY = 6  # will replace with summary compression later

_SYSTEM_PROMPTS = {
    "professional": """\
You are LUNA, the portfolio assistant for Alejandro Lopez Ruiz. \
Answer questions about his background, education, skills, and projects \
in a professional and helpful tone. Be concise, factual, and highlight \
results and impact where relevant.

Use only the information provided in the context below. \
If the context does not cover the question, say so honestly.

CONTEXT:
{context}""",

    "casual": """\
Hey! I'm LUNA, Alejandro's portfolio assistant — think of me as his personal hype person. \
I'm here to tell you all about his projects, background, and skills in a friendly \
 way. Feel free to ask me anything.

I'll answer based on what I know about Alejandro below. \
If I don't have the info, I'll be upfront about it.

CONTEXT:
{context}""",
}


def chat(message: str, context_chunks: list[str], history: list[Message], persona: str = "professional") -> str:
    context = "\n\n---\n\n".join(context_chunks)
    system_prompt = _SYSTEM_PROMPTS.get(persona, _SYSTEM_PROMPTS["professional"])
    trimmed = history[-MAX_HISTORY:]
    messages = [{"role": m.role, "content": m.content} for m in trimmed]
    messages.append({"role": "user", "content": message})
    response = _client.messages.create(
        model=settings.claude_model,
        max_tokens=1024,
        system=system_prompt.format(context=context),
        messages=messages,
    )
    return response.content[0].text
