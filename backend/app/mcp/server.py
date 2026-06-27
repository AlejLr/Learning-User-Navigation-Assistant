"""
LUNA MCP Server: exposes portfolio tools for Claude to call.

get_project_metadata is the only real tool: a genuine data lookup whose
result Claude needs back before it can continue. Page navigation/highlight
deliberately are NOT tools, since a tool call is a synchronous round-trip
that happens *before* the text it relates to is generated, which would
fire it well ahead of the matching speech. Instead they're inline
[nav:slug]/[highlight:id]/[scroll:section] directives Claude writes directly
into its response text (see llm.py's voice-mode system prompt), parsed and
timed client-side to fire exactly when that sentence's audio starts playing.

Spawned automatically as a subprocess by the FastAPI app (see app/mcp/client.py).
Can also be run standalone for manual testing, from backend/:
    uv run python -m app.mcp.server
"""

from mcp.server.fastmcp import FastMCP

from app.mcp.tools import get_project_metadata

mcp = FastMCP("LUNA Portfolio Tools")


@mcp.tool()
def project_metadata(project_name: str) -> dict:
    """
    Get structured metadata about one of Alejandro's projects, including the
    section/KPI ids usable in inline [highlight:id] tags.
    Use this when the user asks about a specific project.
    Valid inputs: sdg, smanalyzer, routeguesser, stata, luna, pepadb, esg, ecosim.
    """
    return get_project_metadata(project_name)


if __name__ == "__main__":
    mcp.run(transport="stdio")
