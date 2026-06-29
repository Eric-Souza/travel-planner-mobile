# Travel Planner Mobile — Agent Instructions

You are working on the **Expo/React Native frontend** for a local-first AI travel planner. Read this file and `.cursor/rules/backend-integration.md` before making changes.

## What this repo is

A mobile client that talks **only** to the FastAPI backend (`travel-planner-api`). It does **not** contain LLM prompts, database code, RAG, or third-party API keys.

**Companion backend:** https://github.com/Eric-Souza/travel-planner-api

## Tech stack

- Expo SDK 56 + React Native 0.85 + TypeScript strict
- Expo Router (`app/`) — file-based navigation
- TanStack Query — all server state
- Zustand — UI-only state (tabs, modals, filters, demo mode)
- React Hook Form + Zod — forms
- Custom typed API client (`src/api/client.ts`) + modules per domain
- openapi-typescript — regenerate with `npm run api:generate`
- AsyncStorage — offline read cache
- WebView + Leaflet — map presentation only
- Jest + ts-jest — unit tests in `src/__tests__/`

## Non-negotiable rules

1. **Data flow:** `Screen → hook (src/hooks/) → API module (src/api/) → client.ts → FastAPI /v1`
2. **No raw `fetch` in screens** — use hooks and API modules
3. **Never** call Ollama, PostgreSQL, weather APIs, or providers directly from mobile
4. **Never auto-confirm** AI-extracted bookings or **auto-apply** itinerary proposals
5. Label extractions **"AI extracted"** until the user taps Confirm
6. Chat: show status chips + citations — never chain-of-thought
7. After backend schema changes: `npm run api:generate` and fix compile errors
8. Use `src/api/mappers.ts` for backend ↔ mobile type differences (preferences strings, SSE tool cards, etc.)
9. Invalidate TanStack Query keys from `src/hooks/queryKeys.ts` after mutations

## Key paths

| Purpose | Path |
|---------|------|
| Screens | `app/` |
| API client | `src/api/client.ts` |
| API modules | `src/api/trips.ts`, `bookings.ts`, `documents.ts`, `chat.ts`, … |
| DTO mappers | `src/api/mappers.ts` |
| Generated types | `src/api/generated/api-types.generated.ts` |
| Hooks | `src/hooks/` |
| Query keys | `src/hooks/queryKeys.ts` |
| Backend integration doc | `.cursor/rules/backend-integration.md` |
| Env | `EXPO_PUBLIC_API_BASE_URL` (must end with `/v1`) |

## Before implementing a feature

1. Check `.cursor/rules/backend-integration.md` for endpoint contracts and known mismatches
2. Add or extend an API module — do not duplicate DTOs manually if OpenAPI generation covers them
3. Add a hook with TanStack Query — screens consume hooks only
4. Match existing patterns in neighboring files
5. Run `npx tsc --noEmit` and `npm test`

## Local dev

```bash
# Terminal 1 — backend
cd travel-planner-api && pip install -e ".[dev]"
python scripts/seed_demo.py
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — mobile
cd travel-planner-mobile && npm install && cp .env.example .env
npm start
```

Physical devices need LAN IP in `.env`, not `localhost`.
