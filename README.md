# AI CRM HCP Module

## Quickstart
```bash
# 1) Copy and set env (add your GROQ_API_KEY)
cp .env.template .env
# Edit .env and set GROQ_API_KEY=...

# 2) Run all services
docker compose up --build -d

# 3) Open UI
open http://localhost:3000
# Backend docs: http://localhost:8000/docs
```

## Requirements Covered
- React + Redux frontend with Inter font
- FastAPI backend with MySQL 8
- LangGraph agent using Groq gemma2-9b-it
- Log Interaction Screen (structured form + chat)
- 5 LangGraph tools: get_hcp_profile, list_recent_interactions, log_interaction, generate_followup_suggestions, edit_interaction
- Tool-trace persistence and UI visibility
- Docker Compose runnable with one command

## Tech Stack
- Frontend: React 18, Redux Toolkit, MUI, Vite, nginx
- Backend: FastAPI, SQLAlchemy, MySQL 8, LangGraph, Groq
- Database: MySQL 8 (Docker)

## UI
- Single page: /log-interaction
- Left: structured form matching assignment screenshot
- Right: AI Assistant chat panel + tool trace + edit interaction

## LangGraph Tools
1. get_hcp_profile
2. list_recent_interactions
3. log_interaction
4. generate_followup_suggestions
5. edit_interaction

## API Endpoints
- GET /health
- GET /health/db
- GET /hcps
- GET /interactions
- POST /interactions
- POST /agent/chat
- POST /agent/edit
- GET /agent/tool-runs

## Verification
```bash
curl http://localhost:8000/health
curl http://localhost:8000/hcps
curl -X POST http://localhost:8000/agent/chat -H 'Content-Type: application/json' -d '{"message":"Test","hcp_id":1}'
```

## 10–15 Minute Demo Script (Evaluator-Friendly)
1. Show repo structure and .env setup (GROQ_API_KEY)
2. `docker compose up --build -d`
3. Open http://localhost:3000/log-interaction
4. Show HCP autocomplete and structured form fields
5. Fill form and click **Log** → show success
6. Chat: “Met Dr. Alice Johnson to discuss Product X efficacy. Positive sentiment. Shared brochure. Follow-up in 2 weeks.” → click **Log**
7. Show **Tool Trace (demo proof)** area populating tools
8. Demonstrate **Edit Interaction** tool:
   - Use the “Edit Interaction” section (patch topics/outcomes/follow-ups)
   - Click **Run Edit Tool**
   - Show tool trace updated
9. Show DB-backed traces:
   - `GET /agent/tool-runs`
10. Explain architecture/code flow briefly:
    - React/Redux → FastAPI → LangGraph tools → MySQL
