# LUNA - Portfolio AI Assistant

**L**earning **U**ser **N**avigation **A**ssistant

Not a demo — an AI experience meant to live permanently on my portfolio site, acting as a spokesperson and guide for visitors (especially recruiters ;) ). A RAG-based conversational agent that answers questions about my projects and background, with the long-term goal of speaking, navigating the site, and showing context while it talks.

---

## How it works

User sends a question → backend embeds it → retrieves relevant chunks from the shared content → injects them into Claude's system prompt → Claude (Haiku 4.5) responds as LUNA, with multi-turn memory and a switchable persona.

**Single source of truth:** project, about, and course content lives once in `frontend/src/content/` as JSON. Both the React portfolio pages and LUNA's retrieval pipeline read the exact same files — update a project once, and both the visible page and what LUNA says about it change together.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Backend | FastAPI + uvicorn |
| LLM | Claude Haiku 4.5 (Anthropic) |
| Embeddings | ChromaDB built-in ONNX embedder (`all-MiniLM-L6-v2`, no PyTorch) |
| Vector store | ChromaDB (in-memory) |
| Tool protocol | MCP (`mcp` Python SDK) |
| Package manager | uv (backend), npm (frontend) |
| Frontend | Vite + React + TypeScript + React Router |

---

## Roadmap

### Phase 1 — MVP (done)
- FastAPI `/chat` endpoint, RAG pipeline (ChromaDB's built-in ONNX embedder), Claude Haiku response
- Persona: LUNA, portfolio assistant

### Phase 2 — Extended prototype (in progress)
- [x] Multi-turn conversation (history capped at last 6 messages, client-held)
- [x] Persona switching: professional vs casual tone
- [x] MCP server wired into `/chat`, spawned as a subprocess and called by Claude as a real tool
- [x] React chat UI (Vite + TypeScript), now at its own `/chat` route, plus a floating widget on the portfolio
- [x] Real portfolio content migrated into the React app (`/`, `/projects`, `/projects/:slug`)
- [x] Backend deployed on Render: https://luna-kg96.onrender.com
- [ ] Frontend deployed on Vercel, CORS locked to the production domain

### Phase 3 — Full product
- Voice output via TTS
- Agent-controlled frontend navigation (LUNA scrolls/routes the portfolio while talking, synchronized with speech)
- Full MCP tool integration (navigation tools, not just data lookup)
- Advanced retrieval: chunking, reranking, summary-compressed history

---

## Project structure

```
├── backend/
│   ├── app/
│   │   ├── api/         # /chat route
│   │   ├── core/        # config, env vars
│   │   ├── mcp/         # MCP server + tools (project_metadata)
│   │   ├── models/      # pydantic schemas
│   │   └── services/    # ingestion, retrieval, llm
│   ├── pyproject.toml
│   └── main.py
├── frontend/
│   ├── public/assets/    # CV, certificates, icons
│   └── src/
│       ├── content/      # single source of truth: projects/*.json, about.json, courses.json
│       ├── portfolio/     # Header, Footer, HomePage, ProjectsPage, ProjectPage, ProjectCard
│       ├── components/    # chat UI: ChatWindow, ChatMessage, ChatInput, PersonaToggle
│       ├── hooks/         # useChat
│       ├── api/           # backend API client
│       └── ChatPage.tsx    # chat UI mounted at /chat
└── .env.example
```

---

## Getting started

**Backend:**
```bash
cd backend
uv sync
cp ../.env.example ../.env   # add your ANTHROPIC_API_KEY
uv run uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Portfolio: `http://localhost:5173/`. 
Chat: `http://localhost:5173/chat`.
