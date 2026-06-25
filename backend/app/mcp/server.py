"""
LUNA MCP Server: exposes portfolio tools for Claude to call.

Phase 2: get_project_metadata (read-only knowledge base lookup)
Phase 3: navigate_to_section, scroll_to, show_image (frontend DOM control)

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
    Get structured metadata about one of Alejandro's projects.
    Use this when the user asks about a specific project.
    Valid inputs: sdg, smanalyzer, routeguesser, stata, luna, pepadb, esg, ecosim.
    """
    return get_project_metadata(project_name)


if __name__ == "__main__":
    mcp.run(transport="stdio")
