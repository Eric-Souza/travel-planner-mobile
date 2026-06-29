# Cursor prompt — copy everything below this line into a new chat

You are building and maintaining **travel-planner-mobile**, the Expo/React Native frontend for a local-first AI travel planner.

## Repository role

This is the **presentation and interaction layer only**. All AI, RAG, embeddings, business rules, and persistence live in the separate backend repo **travel-planner-api** (FastAPI). The mobile app never calls Ollama, PostgreSQL, or external provider APIs directly.

## Tech stack in this repo

- **Expo SDK 56** + **React Native 0.85** + **TypeScript** (strict)
- **Expo Router** — screens in `app/`
- **TanStack Query** — server state, caching, mutations
- **Zustand** — local UI state only (tabs, modals, demo mode)
- **React Hook Form + Zod** — form validation
- **Typed REST client** — `src/api/client.ts` unwraps `{ data, request_id }` / throws `ApiError`
- **openapi-typescript** — run `npm run api:generate` when backend OpenAPI changes
- **AsyncStorage** — offline read cache (`src/cache/`)
- **SSE chat** — `src/api/chat.ts` + `useChatStream` hook
- **WebView + Leaflet** — map pins only (`src/features/shared/FeatureComponents.tsx`)
- **Jest** — `npm test`

## Architecture (mandatory)

```
Screen → hook (src/hooks/) → API module (src/api/) → client.ts → FastAPI /v1
```

**Never:** `Screen → fetch → Ollama / database / weather API`

**Env:** `EXPO_PUBLIC_API_BASE_URL=http://HOST:8000/v1`  
Health check uses root `GET /health` (not under `/v1`).

## Rules you must follow

1. Do not put prompts, LLM logic, or provider keys in this repo
2. Do not auto-confirm AI-extracted bookings — user must tap Confirm
3. Do not auto-apply itinerary proposals — user must tap Apply
4. Show "AI extracted" badge until booking is confirmed
5. Chat shows status chips and citations — never chain-of-thought
6. Use `src/api/mappers.ts` for backend DTO differences (e.g. preferences as comma-separated strings, SSE `tool_result` shape)
7. Invalidate query keys from `src/hooks/queryKeys.ts` after every mutation
8. Read `.cursor/rules/backend-integration.md` for full endpoint map and integration notes
9. Read `AGENTS.md` in the repo root for file layout and workflow

## Project layout

```
app/                 # Expo Router screens (trips, timeline, documents, chat, …)
src/api/             # client.ts, mappers.ts, trips.ts, bookings.ts, documents.ts, chat.ts, …
src/hooks/           # useTrips, useBookings, useChatStream, queryKeys.ts, …
src/components/      # Loading, empty, error, cards
src/features/        # Timeline cards, demo data, map
src/cache/           # AsyncStorage helpers
src/types/api.ts     # Hand-maintained types aligned with backend
```

## When implementing a feature

1. Check backend endpoint in `.cursor/rules/backend-integration.md`
2. Add or update API module in `src/api/` (use mappers if response shape differs)
3. Add TanStack Query hook in `src/hooks/`
4. Build screen in `app/` that calls the hook only
5. Run `npx tsc --noEmit` and `npm test`

## Backend local setup (for integration testing)

```bash
cd travel-planner-api
pip install -e ".[dev]"
python scripts/seed_demo.py
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

```bash
cd travel-planner-mobile
npm install && cp .env.example .env
npm run api:generate   # backend must be running
npm start
```

On a physical phone, set `EXPO_PUBLIC_API_BASE_URL` to your computer's LAN IP, not `localhost`.

## Demo without backend

Trips list → toggle **Demo mode** for synthetic Buenos Aires + Bariloche fixtures.

---

When I ask you to implement something, follow the architecture above, match existing code style, and keep changes focused on the requested feature.
