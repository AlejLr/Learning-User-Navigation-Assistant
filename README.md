# LUNA - Portfolio AI Assistant

**L**earning **U**ser **N**avigation **A**ssistant

A RAG-based conversational agent that answers questions about Alejandro's projects and background, embedded in his portfolio website.

---

## How it works

User sends a question → backend embeds it → retrieves relevant chunks from the knowledge base → injects them into Claude's system prompt → Claude responds as LUNA

---

## Tech Stack

| Layer | Tool |
|---|---|
| Backend | FastAPI + uvicorn |
| LLM | Claude Haiku 4.5 (Anthropic) |
| Embeddings | sentence-transformers (`all-MiniLM-L6-v2`) |
| Vector store | ChromaDB |
| Package manager | uv |
| Frontend | Vite + React + TypeScript (Phase 2) |

---

## Roadmap

### Phase 1 - MVP (current)
- FastAPI `/chat` endpoint (single-turn, returns JSON)
- Knowledge base: markdown files describing my projects and CV
- RAG pipeline: embed query → ChromaDB similarity search → inject top-k chunks → Claude Haiku response
- Persona: LUNA, professional portfolio assistant

### Phase 2 - Extended prototype
- Multi-turn conversation support
- Persona switching: professional vs casual tone
- MCP server skeleton with a placeholder tool (`get_project_metadata`)
- React chat UI (Vite + TypeScript)
- Deploy: backend on Render, frontend on Vercel

### Phase 3 - Full product
- Voice output via TTS
- Agent-controlled frontend navigation (LUNA decides which portfolio page to show)
- Full MCP tool integration
- Advanced retrieval: chunking, reranking

---

## Project structure

```
├── backend/
│   ├── app/
│   │   ├── api/         # route definitions
│   │   ├── core/        # config, env vars
│   │   ├── models/      # pydantic schemas
│   │   └── services/    # retrieval, llm, ingestion logic
│   ├── pyproject.toml
│   └── main.py
├── frontend/
│   └── src/             # React app (Phase 2)
├── knowledge_base/      # markdown files (the RAG source)
└── .env.example
```

---

## Getting started

```bash
# install dependencies
uv sync

# set up environment
cp .env.example .env
# add your ANTHROPIC_API_KEY to .env

# run the server
uv run uvicorn backend.app.main:app --reload

# POST /chat
# { "message": "What is the DSV project about?" }
```
