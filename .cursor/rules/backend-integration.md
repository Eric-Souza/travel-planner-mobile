# Backend integration — travel-planner-api

This mobile app talks **only** to the FastAPI backend at `travel-planner-api`. Never call Ollama, PostgreSQL, weather APIs, or other providers from this repo.

**Backend path:** sibling repo `travel-planner-api` (or clone from https://github.com/Eric-Souza/travel-planner-api)  
**Base URL env:** `EXPO_PUBLIC_API_BASE_URL` (must end with `/v1`)

---

## Architecture rules

1. **Data flow:** Screen → hook (`src/hooks/`) → API module (`src/api/`) → `client.ts` → FastAPI `/v1`
2. **No raw `fetch` in screens** — use hooks and API modules only
3. **TanStack Query** for server state; invalidate related query keys after every mutation
4. **Zustand** for UI-only state (tabs, modals, filters) — not server data
5. **Never auto-confirm** AI-extracted bookings or **auto-apply** itinerary proposals
6. Label AI extraction as **"AI extracted"** until user taps Confirm
7. Chat shows **status chips and citations** — never chain-of-thought or hidden reasoning
8. Regenerate OpenAPI types after backend schema changes: `npm run api:generate`

---

## Local setup

### Start backend (terminal 1)

```bash
cd travel-planner-api
pip install -e ".[dev]"
python scripts/seed_demo.py
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify: http://localhost:8000/health and http://localhost:8000/docs

Default backend uses SQLite + mock LLM (`USE_MOCK_LLM=true`) — no Docker/Ollama required for dev.

### Start mobile (terminal 2)

```bash
cd travel-planner-mobile
npm install
cp .env.example .env
npm start
```

### `.env` — API URL by target

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LAN_IP:8000/v1
```

| Target | URL |
|--------|-----|
| Physical phone | `http://192.168.x.x:8000/v1` (PC LAN IP — **not** localhost) |
| Android emulator | `http://10.0.2.2:8000/v1` |
| iOS simulator / web | `http://localhost:8000/v1` |

### Backend CORS

In `travel-planner-api/.env`, include every Expo origin:

```env
CORS_ORIGINS=http://localhost:8081,http://127.0.0.1:8081,http://YOUR_LAN_IP:8081
```

Restart the API after changing CORS.

---

## API contract

### Success (all `/v1` REST endpoints)

```json
{ "data": { ... }, "request_id": "req_..." }
```

`apiRequest<T>()` in `src/api/client.ts` unwraps `data` automatically.

### Errors

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "details": [{ "field": "end_at", "message": "..." }]
  },
  "request_id": "req_..."
}
```

Thrown as `ApiError` with `.code`, `.message`, `.details`, `.status`.

### Health (root — not under `/v1`)

Use `src/api/health.ts` → `apiRequestRoot('/health')` → `http://HOST:8000/health`

---

## Endpoint map → mobile modules

| Flow | Backend | Mobile file |
|------|---------|-------------|
| Health | `GET /health` | `src/api/health.ts` |
| Trips | `GET/POST /v1/trips`, `GET/PATCH /v1/trips/{id}` | `src/api/trips.ts` |
| Preferences | `GET/PATCH /v1/trips/{id}/preferences` | `src/api/preferences.ts` |
| Bookings | `GET/POST /v1/trips/{id}/bookings`, `PATCH /v1/bookings/{id}` | `src/api/bookings.ts` |
| Confirm/reject | `POST /v1/bookings/{id}/confirm`, `.../reject` | `src/api/bookings.ts` |
| Upload | `POST /v1/trips/{id}/documents` (multipart `file`) | `src/api/documents.ts` |
| Process | `POST /v1/documents/{id}/process` | `src/api/documents.ts` |
| Poll status | `GET /v1/documents/{id}/processing-status` | `src/api/documents.ts` |
| Extract | `POST /v1/documents/{id}/extract-booking` | `src/api/documents.ts` |
| Review candidate | `GET /v1/documents/{id}/booking-candidate` | `src/api/bookings.ts` |
| Embed (RAG) | `POST /v1/documents/{id}/embed` | add to `documents.ts` if needed |
| Search docs | `POST /v1/trips/{id}/search` | add `retrieval.ts` if needed |
| Ask document | `POST /v1/trips/{id}/ask-document-question` | add `retrieval.ts` if needed |
| Chat SSE | `POST /v1/trips/{id}/chat/stream` | `src/api/chat.ts` |
| Conversations | `GET /v1/trips/{id}/conversations` | `src/api/chat.ts` |
| Messages | `GET /v1/conversations/{id}/messages` | `src/api/chat.ts` |
| Proposal | `POST /v1/trips/{id}/itinerary-proposals` | `src/api/itinerary.ts` |
| Get proposal | `GET /v1/itinerary-proposals/{id}` | `src/api/itinerary.ts` |
| Apply | `POST /v1/itinerary-proposals/{id}/apply` | `src/api/itinerary.ts` |
| Active itinerary | `GET /v1/trips/{id}/itineraries` | `src/api/itinerary.ts` |
| Places | `GET/POST /v1/trips/{id}/places`, `DELETE .../{placeId}` | `src/api/places.ts` |
| Place search | `POST /v1/trips/{id}/places/search` | `src/api/places.ts` |

---

## User flows

### A — Trips and manual bookings

```
POST /v1/trips
GET  /v1/trips/{tripId}
PATCH /v1/trips/{tripId}/preferences
POST /v1/trips/{tripId}/bookings   # status: "confirmed" for manual entry
GET  /v1/trips/{tripId}/bookings
```

Trip dates are ISO datetimes. Booking `end_at` must be after `start_at` and within trip range.

### B — Document upload → extract → review → confirm

```
POST /v1/trips/{tripId}/documents
POST /v1/documents/{documentId}/process
GET  /v1/documents/{documentId}/processing-status   # poll until parsed
POST /v1/documents/{documentId}/extract-booking
GET  /v1/documents/{documentId}/booking-candidate
POST /v1/bookings/{bookingId}/confirm   # or /reject — user action only
```

**Processing statuses:** `uploaded` → `parsing` → `parsed` → `extracting` → `extracted` → `embedding` → `ready` | `failed`

**Supported uploads:** `.pdf`, `.txt`, `.eml` (max 10 MB). Multipart field name: `file`.

After confirm/reject, invalidate: `['trips', tripId, 'bookings']`, timeline queries.

### C — Chat (SSE)

`POST /v1/trips/{tripId}/chat/stream`

Request:

```json
{ "message": "What is booked for Tuesday?", "conversation_id": "optional-uuid" }
```

SSE events (parse in `src/api/chat.ts`, consume via `useChatStream`):

| Event | UI |
|-------|-----|
| `status` | Status chip ("Searching confirmed bookings") |
| `sources` | Citation cards under answer |
| `token` | Append `data.text` to assistant message |
| `tool_result` | Weather/currency/route card |
| `error` | Stop stream, show retry |
| `done` | Finalize `message_id`, persist sources |

Backend routing (do not reimplement in mobile):

- Structured booking facts → SQL
- Policy/details in documents → RAG + citations
- Weather/currency → backend tool adapters

Pass `conversation_id` from prior `done` or `listConversations()` for thread continuity.

### D — Itinerary proposal

```
POST /v1/trips/{tripId}/itinerary-proposals
GET  /v1/itinerary-proposals/{proposalId}
POST /v1/itinerary-proposals/{proposalId}/apply   # explicit user tap only
GET  /v1/trips/{tripId}/itineraries
```

Generate body: `{ "mode": "standard" }` or `{ "mode": "rainy_day", "target_date": "2026-08-06T00:00:00Z" }`

Show `warnings`, `before_items` vs `items` for rainy-day comparison. Locked/confirmed items must not be editable.

### E — Places

Backend owns search (Nominatim). Mobile only displays results and saved places.

---

## TanStack Query keys

```typescript
['trips']
['trips', tripId]
['trips', tripId, 'preferences']
['trips', tripId, 'bookings']
['documents', documentId, 'status']
['trips', tripId, 'itineraries']
['trips', tripId, 'conversations']
['conversations', conversationId, 'messages']
['trips', tripId, 'places']
```

Invalidate related keys after every successful mutation.

---

## OpenAPI type generation

Backend must be running:

```bash
npm run api:generate
```

Writes `src/api/generated/api-types.generated.ts` from `http://localhost:8000/openapi.json`.

Override host: `API_SCHEMA_URL=http://192.168.1.10:8000 npm run api:generate`

Hand-maintained types live in `src/types/api.ts` — align with generated types after regen.

---

## Known backend ↔ mobile mismatches (fix when integrating)

| Issue | Mobile | Backend | Action |
|-------|--------|---------|--------|
| List documents | `listDocuments()` calls missing route | No `GET /trips/{id}/documents` | Track uploads locally or add backend route |
| Extract return type | `TravelDocument` | `Booking` | Fix `extractBooking()` return type in `documents.ts` |
| List itineraries | `ItineraryVersion[]` | single object or `null` | Fix `listItineraries()` return type |
| Apply proposal body | `{ item_ids }` | empty POST | Send POST with no body |
| Preferences `interests` | `string[]` in types | `string` in API | Split/join in hook mapper |
| Booking `uncertainty_notes` | `string[]` | may be JSON string | Parse in mapper if needed |
| `tool_result` SSE | `ToolResultCard` shape | `{ tool, result }` | Map in `useChatStream` |
| Booking candidate | expects nested `booking` only | also returns `extraction`, `is_duplicate` | Align `BookingCandidateResponse` type |

---

## Offline

When offline (`useNetworkStatus`):

- Show cached trips/bookings/itinerary from `src/cache/`
- Disable uploads, chat, extraction, proposal generation
- Label data as last-synced

---

## Demo data

```bash
# In travel-planner-api
python scripts/seed_demo.py
```

Creates Buenos Aires + Bariloche trip with confirmed hotel + flight. Mobile demo mode uses local fixtures when backend is unavailable.

---

## Verification checklist

1. Health screen green (`GET /health`)
2. Create trip → list refreshes
3. Preferences save and reload
4. Manual booking on timeline
5. Upload txt/pdf → process → extract → review ("AI extracted") → confirm → timeline
6. Chat streams answer with citations
7. Generate itinerary → review → explicit apply
8. Offline shows cache, disables live/AI actions

---

## Cursor implementation prompt template

```
Implement [FEATURE] in travel-planner-mobile.

Backend: FastAPI at EXPO_PUBLIC_API_BASE_URL (/v1).
Follow .cursor/rules/backend-integration.md.

Use: Screen → hook → src/api/* → client.ts.
TanStack Query for server state; invalidate on mutations.
Never auto-confirm bookings or auto-apply proposals.
Match existing patterns in src/hooks/ and src/api/.
OpenAPI: http://localhost:8000/docs
```
