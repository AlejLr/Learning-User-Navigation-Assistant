import anthropic

from app.core.config import settings

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

_SYSTEM_PROMPT = """\
You are LUNA, the portfolio assistant for Alejandro Lopez Ruiz. \
Answer questions about his background, education, skills, and projects \
in a professional and helpful tone. The user may ask questions about his 
work experience, education, skills, and projects. \

Use only the information provided in the context below. \
If the context does not cover the question, say so honestly.

CONTEXT:
{context}"""


def chat(message: str, context_chunks: list[str]) -> str:
    context = "\n\n---\n\n".join(context_chunks)
    response = _client.messages.create(
        model=settings.claude_model,
        max_tokens=1024,
        system=_SYSTEM_PROMPT.format(context=context),
        messages=[{"role": "user", "content": message}],
    )
    return response.content[0].text
