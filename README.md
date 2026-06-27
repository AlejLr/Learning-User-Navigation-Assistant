# LUNA - Portfolio AI Assistant

**L**earning **U**ser **N**avigation **A**ssistant

Not a demo — an AI experience meant to live permanently on my portfolio site, acting as a spokesperson and guide for visitors (especially recruiters ;) ). A RAG-based conversational agent that answers questions about my projects and background, with the long-term goal of speaking, navigating the site, and showing context while it talks.

Live Portfolio: https://alejlr.vercel.app/

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
| Voice | Google Cloud Text-to-Speech (Neural2) |
| Package manager | uv (backend), npm (frontend) |
| Frontend | Vite + React + TypeScript + React Router |

---

## Roadmap

### Phase 1 — MVP (done)
- FastAPI `/chat` endpoint, RAG pipeline (ChromaDB's built-in ONNX embedder), Claude Haiku response
- Persona: LUNA, portfolio assistant

### Phase 2 — Extended prototype (done)
-  Multi-turn conversation (history capped at last 6 messages, client-held)
-  Persona switching: professional vs casual tone
-  MCP server wired into `/chat`, spawned as a subprocess and called by Claude as a real tool
-  React chat UI (Vite + TypeScript), now at its own `/chat` route, plus a floating widget on the portfolio
-  Real portfolio content migrated into the React app (`/`, `/projects`, `/projects/:slug`)
-  Backend deployed on Render: https://luna-kg96.onrender.com
-  Frontend deployed on Vercel, CORS locked to the production domain: https://alejlr.vercel.app/

### Phase 3 — Full product (in progress)
- Streaming responses (SSE) — done, needed as a prerequisite for real-time voice + navigation, not just a nicer chat UX
- Voice output via Google Cloud TTS — done, opt-in toggle, sentence-chunked so speech starts before the full reply has streamed in
- Agent-controlled frontend navigation: new MCP tools (e.g. `navigate_to(slug)`, `scroll_to(section)`) that the frontend executes when called, not just data-lookup tools
- Speech/navigation sync: define whether actions fire as the response streams in or after a full response is generated and sequenced
- Advanced retrieval: chunking, reranking, summary-compressed history
- Fallback UX for TTS/autoplay failures (notably mobile autoplay restrictions)

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
# voice requires a Google Cloud service account key at backend/secrets/google-tts-credentials.json (gitignored, not committed)
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
