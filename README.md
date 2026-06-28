# LUNA - Portfolio AI Assistant

**L**earning **U**ser **N**avigation **A**ssistant

Not a demo: an AI experience meant to live permanently on my portfolio site, acting as a spokesperson and guide for visitors (especially recruiters ;) ). A RAG-based conversational agent that answers questions about my projects and background. In Agent mode it speaks, navigates the site, and highlights the exact section or KPI it's talking about, synced to its own voice as it talks.

Live Portfolio: https://alejlr.vercel.app/

---

## How it works

User sends a question → backend embeds it → retrieves relevant chunks from the shared content → injects them into Claude's system prompt → Claude (Haiku 4.5) responds as LUNA, with multi-turn memory and a switchable persona.

**Single source of truth:** project, about, and course content lives once in `frontend/src/content/` as JSON. Both the React portfolio pages and LUNA's retrieval pipeline read the exact same files; update a project once, and both the visible page and what LUNA says about it change together.

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

### Phase 1: MVP (done)
- FastAPI `/chat` endpoint, RAG pipeline (ChromaDB's built-in ONNX embedder), Claude Haiku response
- Persona: LUNA, portfolio assistant

### Phase 2: Extended prototype (done)
-  Multi-turn conversation (history capped at last 6 messages, client-held)
-  Persona switching: professional vs casual tone
-  MCP server wired into `/chat`, spawned as a subprocess and called by Claude as a real tool
-  React chat UI (Vite + TypeScript), now at its own `/chat` route, plus a floating widget on the portfolio
-  Real portfolio content migrated into the React app (`/`, `/projects`, `/projects/:slug`)
-  Backend deployed on Render: https://luna-kg96.onrender.com
-  Frontend deployed on Vercel, CORS locked to the production domain: https://alejlr.vercel.app/

### Phase 3: Full product (in progress)

**Done:**
- Streaming responses (SSE): prerequisite for real-time voice + navigation, not just a nicer chat UX
- Chat/Agent mode picker: the chat bubble expands into a choice. Chat is unchanged Phase 2 behavior, Agent bundles voice + avatar + navigation
- Voice output via Google Cloud TTS: sentence-chunked so speech starts before the full reply has streamed in
- Avatar/expression system: Claude tags each spoken sentence ({explaining}/{happy}/{chill}/{skeptical}/{surprised}) to drive a live avatar, plus client-driven states (greeting/curious/thinking)
- Agent-controlled navigation and highlighting: Claude writes inline `[nav:slug]` / `[highlight:id]` / `[scroll:section]` directives next to each sentence's mood tag. These are parsed client-side and fired in sync with that sentence's *TTS playback*, not its generation, so a page jump or highlight always lands exactly as it's being talked about. Navigates as soon as a project becomes the topic; highlights every section/KPI a stated fact traces back to (e.g. challenge, then solution, then results, in order, as it explains)

**Remaining:**
- Advanced retrieval: chunking, reranking, summary-compressed history (low priority at current traffic/conversation length)

---

## Project structure

```
├── backend/
│   ├── app/
│   │   ├── api/         # /chat, /tts routes
│   │   ├── core/        # config, env vars
│   │   ├── mcp/         # MCP server + tools (project_metadata: the only real tool)
│   │   ├── models/      # pydantic schemas
│   │   └── services/    # ingestion, retrieval, llm, tts
│   ├── secrets/         # Google TTS service account key (gitignored, not committed)
│   ├── pyproject.toml
│   └── main.py
├── frontend/
│   ├── public/assets/avatar/  # LUNA's expression images (greeting/happy/chill/skeptical/explaining/...)
│   └── src/
│       ├── content/      # single source of truth: projects/*.json, about.json, courses.json
│       ├── portfolio/     # Header, Footer, HomePage, ProjectsPage, ProjectPage, ProjectCard
│       ├── components/    # ChatWidget, ChatWindow, ChatMessage, ChatInput, PersonaToggle, VoiceToggle, ModeSelect, AgentAvatar, Toast
│       ├── hooks/         # useChat: messages, voice, avatar state machine, page-action handling
│       ├── services/      # tts.ts: per-sentence TTS queue, avatar/page-action sync to playback
│       ├── utils/          # slugify.ts: DOM ids for highlightable sections/KPIs
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
