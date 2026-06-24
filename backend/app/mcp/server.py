"""
LUNA MCP Server — exposes portfolio tools for Claude to call.

Phase 2: get_project_metadata (read-only knowledge base lookup)
Phase 3: navigate_to_section, scroll_to, show_image (frontend DOM control)

Run standalone from backend/:
    uv run python -m app.mcp.server
"""

from mcp.server.fastmcp import FastMCP

from app.mcp.tools import get_project_metadata

mcp = FastMCP("LUNA Portfolio Tools")


@mcp.tool()
def project_metadata(project_name: str) -> dict:
    """
    Get structured metadata about one of Alejandro's projects or background.
    Use this when the user asks about a specific project, skill set, or background detail.
    Valid inputs: dsv, pepadb, marketing, esg, ecosim, cv, skills.
    """
    return get_project_metadata(project_name)


if __name__ == "__main__":
    mcp.run(transport="sse")
