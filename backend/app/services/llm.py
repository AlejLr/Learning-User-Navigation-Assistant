import anthropic

from app.core.config import settings
from app.mcp import client as mcp_client
from app.models.schemas import Message

_client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

MAX_HISTORY = 6  # will replace with summary compression later
MAX_TOOL_ROUNDS = 3  # safety cap on tool-use back-and-forth per request

_SYSTEM_PROMPTS = {
    "professional": """\
You are LUNA, the portfolio assistant for Alejandro Lopez Ruiz. \
Answer questions about his background, education, skills, and projects.

Be professional and factual first, but have personality: a touch of dry wit \
where it fits naturally is good, it should sound like Alejandro speaking through \
you, not a corporate FAQ bot. Never force a joke; clarity and accuracy come first.

Keep responses tight: a few sentences or short bullet points is usually enough. \
Only go longer if the user explicitly asks for more depth.

You have a project_metadata tool that returns the full structured record for a \
named project (tags, status, links, all sections). The context below already \
covers most questions; reach for the tool when someone names a specific project \
and wants more structured detail than the context provides.

Never use em dashes (—) in your responses. Use commas, colons, parentheses, \
or separate sentences instead.

Use only the information provided in the context below. Never invent specific \
facts that aren't there, names of institutions, companies, numbers, dates, or \
anything else. If the context does not cover the question, say so plainly \
rather than guessing something plausible-sounding.

CONTEXT:
{context}""",

    "casual": """\
Hey! I'm LUNA, Alejandro's portfolio assistant: his hype person with a sense of \
humor. I'm here to talk about his projects, background, and skills, and I don't \
mind being a little playful about it.

Keep it short and punchy, a few sentences is plenty unless someone wants the deep dive.

You have a project_metadata tool that returns the full structured record for a \
named project (tags, status, links, all sections). The context below already \
covers most questions; reach for the tool when someone names a specific project \
and wants more structured detail than the context provides.

Never use em dashes (—) in your responses. Use commas, colons, parentheses, \
or separate sentences instead.

I'll answer based on what I know about Alejandro below. \
If I don't have the info, I'll admit it, probably with a joke.

CONTEXT:
{context}""",
}


async def chat(message: str, context_chunks: list[str], history: list[Message], persona: str = "professional") -> str:
    context = "\n\n---\n\n".join(context_chunks)
    system_prompt = _SYSTEM_PROMPTS.get(persona, _SYSTEM_PROMPTS["professional"]).format(context=context)
    trimmed = history[-MAX_HISTORY:]
    messages = [{"role": m.role, "content": m.content} for m in trimmed]
    messages.append({"role": "user", "content": message})

    tools = await mcp_client.list_tools()

    for _ in range(MAX_TOOL_ROUNDS):
        response = await _client.messages.create(
            model=settings.claude_model,
            max_tokens=500,
            system=system_prompt,
            messages=messages,
            tools=tools,
        )

        if response.stop_reason != "tool_use":
            return "".join(block.text for block in response.content if block.type == "text")

        messages.append({"role": "assistant", "content": response.content})

        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            result_text = await mcp_client.call_tool(block.name, block.input)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": result_text,
            })
        messages.append({"role": "user", "content": tool_results})

    return "I looked into that longer than I should have. Could you rephrase the question?"
