"""
MCP client: connects the FastAPI app to the LUNA MCP server.

On startup, spawns `app/mcp/server.py` as a subprocess and talks to it over
stdio (its stdin/stdout, piped), using the MCP protocol. This is the same
pattern Claude Desktop uses to talk to local MCP servers. The session stays
open for the lifetime of the app and is reused across every /chat request.
"""

import sys
from contextlib import AsyncExitStack

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

_exit_stack: AsyncExitStack | None = None
_session: ClientSession | None = None
_tools_cache: list[dict] | None = None


async def connect() -> None:
    global _exit_stack, _session

    _exit_stack = AsyncExitStack()
    server_params = StdioServerParameters(
        command=sys.executable,
        args=["-m", "app.mcp.server"],
    )
    read, write = await _exit_stack.enter_async_context(stdio_client(server_params))
    _session = await _exit_stack.enter_async_context(ClientSession(read, write))
    await _session.initialize()


async def disconnect() -> None:
    if _exit_stack:
        await _exit_stack.aclose()


async def list_tools() -> list[dict]:
    """Return tool definitions in the shape Claude's `tools` API parameter expects."""
    global _tools_cache
    if _tools_cache is None:
        result = await _session.list_tools()
        _tools_cache = [
            {"name": t.name, "description": t.description, "input_schema": t.inputSchema}
            for t in result.tools
        ]
    return _tools_cache


async def call_tool(name: str, arguments: dict) -> str:
    """Invoke a tool on the MCP server and return its result as plain text."""
    result = await _session.call_tool(name, arguments)
    return "\n".join(block.text for block in result.content if hasattr(block, "text"))
