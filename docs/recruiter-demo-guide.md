# Recruiter demo guide — Travel Planner AI

A **10–15 minute walkthrough** to show AI engineering judgment: grounded retrieval, human-in-the-loop extraction, streaming chat with citations, and a clean mobile client over a typed FastAPI backend.

Use this script live in the browser (`http://localhost:8081`) or Expo Go on a phone. Have the backend running for the full AI story.

---

## What you are demonstrating (say this upfront)

> “This is a **local-first travel organizer** with a strict split: the mobile app only talks to a FastAPI API. All LLM calls, document parsing, retrieval, and business rules live on the backend. The client never calls Ollama or model providers directly.
>
> The AI patterns I care about here are: **RAG with citations**, **structured extraction from documents**, **explicit user confirmation** before AI output becomes truth, and **streaming SSE** for chat — not hidden chain-of-thought.”

**Architecture in one line:** Screen → TanStack Query hook → typed API module → FastAPI `/v1`.

---

## Before the demo (5 minutes)

### 1. Start the backend

```bash
cd travel-planner-api
pip install -e ".[dev]"
python scripts/seed_demo.py
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Check:

- http://localhost:8000/health → `status: ok`
- http://localhost:8000/docs → OpenAPI (mention contract-driven client)

### 2. Start the mobile app

```bash
cd travel-planner-mobile
npm install
npm run setup    # if .env missing
npm start
```

Open **http://localhost:8081** (web) or scan the QR code (phone).

`.env` for web/simulator:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/v1
```

### 3. Prepare the upload file

Use the bundled test PDF (hotel + flights + restaurant in one file):

```
travel-planner-mobile/test-notes/travel-test-documents.pdf
```

Regenerate if needed: `npm run test-notes:pdf`

### 4. Demo mode

| Mode | When to use |
|------|-------------|
| **OFF** | Full live demo (upload, chat, API) — **use this for recruiters** |
| **ON** | UI-only fallback if API is down; synthetic Buenos Aires + Bariloche data |

On **My Trips**, ensure **Demo mode** toggle is **OFF**.

---

## Demo script (~12 minutes)

### Act 1 — System health & architecture (1 min)

**Where:** Home screen (`/`)

**Click:** Open app → land on health screen

**Show:**

- Green backend health (`GET /health`)
- API root and `/v1` base URL (typed client, env-driven)

**Say:**

> “The first screen proves connectivity. Production would gate features on this; everything else goes through `/v1` with a consistent `{ data, request_id }` envelope.”

**Click:** **View trips**

---

### Act 2 — Trip context (1 min)

**Where:** **My Trips**

**Show:**

- List of trips (seeded **Buenos Aires + Bariloche**, Aug 2026)
- Material UI, dark theme, pull-to-refresh

**Click:** Open the seeded trip → **Overview** tab

**Show:**

- Trip dates, timezone, booking/plan counts
- Suggested next steps

**Say:**

> “Server state is TanStack Query; UI state like demo mode is Zustand. The app caches read models locally for offline *display*, but mutations always go to the API.”

---

### Act 3 — Preferences shape the planner (2 min)

**Where:** **More** tab → **Preferences** (or Overview → Set preferences)

**Input:**

| Field | Example value |
|-------|----------------|
| Budget | **Moderate** |
| Pace | **Relaxed** |
| Interests | `museums, food, wine` |
| Food | `steak, vegetarian options` |
| Max walking | **30 min** (slider) |
| Notes | `First time in Argentina` |

**Click:** **Save preferences**

**Say:**

> “These fields map to the API as comma-separated strings on the wire — the mobile mapper handles split/join. Preferences **influence** itinerary proposals; they never override confirmed bookings.”

---

### Act 4 — Document upload & human-in-the-loop extraction (4 min) ⭐

**Where:** **Documents** tab

**Click:** **Upload document**

**Input:** Select `test-notes/travel-test-documents.pdf`

The app automatically: **upload → process → extract** → navigates to review.

**Show on Review screen:**

- **“AI extracted”** badge (not auto-confirmed)
- Source excerpt from the PDF
- Confidence / uncertainty notes (if shown)
- Editable fields: title, provider, confirmation code, **date/time pickers**, timezone dropdown

**Say:**

> “This is the pattern I insist on: extraction status stays `extracted` until the user confirms. No silent promotion to confirmed bookings. The user can edit fields before commit.”

**Optional edit:** Change confirmation code or times using the form controls.

**Click:** **Confirm booking**

**Then:** **Timeline** tab

**Show:**

- New booking on the unified timeline alongside itinerary items
- Status badges: Confirmed vs AI extracted vs Suggested

**Say:**

> “Ingestion is PDF/TXT → parse → chunk/embed on backend → structured extraction via LLM schema. Mobile only orchestrates the workflow.”

**Recruiter deep-dive (if asked):**

- Default API uses `USE_MOCK_LLM=true` (deterministic mock extraction for demos without Ollama)
- Set `USE_MOCK_LLM=false` + Ollama for real content-driven extraction

---

### Act 5 — Grounded chat with citations (3 min) ⭐

**Where:** **Chat** tab

**Input (suggested prompts or type):**

```
What time is my check-in?
```

```
Do I have a flight to Bariloche?
```

```
What's on my timeline for August 5?
```

**Show:**

- Streaming tokens (SSE)
- Status chips (“Searching trip documents…”)
- **Citation list** under the answer
- Tap a citation → **bottom sheet** with excerpt and page

**Say:**

> “Chat is retrieval-augmented: the backend searches trip documents and bookings, streams the answer, and returns source citations the user can verify. We don’t show chain-of-thought — only status and citations.”

**If chat is empty / errors:** Confirm demo mode is OFF and backend is up; seed data includes bookings after confirm.

---

### Act 6 — Itinerary proposals (2 min, optional)

**Where:** **More** → **Itinerary**

**Click:** Generate proposal (wording may vary)

**Show:**

- Proposed day plan vs current items
- Warnings / outdoor notes if present

**Click:** **Apply** (explicit action)

**Say:**

> “Same human-in-the-loop rule: proposals are never auto-applied. User must confirm apply — mirrors the booking confirm flow.”

---

### Act 7 — Places & map (1 min, optional)

**Where:** **More** → **Places**

**Input:** Search `San Telmo` or `Llao Llao`

**Show:**

- Search results, save place, map pins (Leaflet in WebView)

**Say:**

> “Map is presentation-only; geocoding and persistence are API concerns.”

---

## Quick reference — tabs

| Tab | Best for showing |
|-----|------------------|
| **Overview** | Trip summary, next steps |
| **Timeline** | Unified bookings + plan items |
| **Documents** | Upload → extract → review pipeline |
| **Chat** | RAG + SSE + citations |
| **More** | Bookings, Preferences, Itinerary, Places |

---

## Talking points — AI engineering (pick 3–4)

1. **Separation of concerns** — LLM, parsers, and DB only on backend; mobile is typed client + UX.
2. **Human-in-the-loop** — `extracted` → user review → `confirmed`; itinerary apply is explicit POST.
3. **Grounded answers** — Chat cites `source_excerpt` / document chunks; user can open citations.
4. **Structured outputs** — Booking extraction uses Pydantic/JSON schema on backend, not free-form JSON in the client.
5. **Contract-first** — OpenAPI → `openapi-typescript`; mappers handle API quirks (comma lists, JSON string arrays).
6. **Streaming UX** — SSE events: `status`, `token`, `sources`, `tool_result`, `done`; parsed in `useChatStream`.
7. **Eval mindset** — Backend has fixtures/evals; mobile has unit tests for mappers, SSE parser, integration smoke tests.
8. **Untrusted documents** — Upload text treated as data in prompts, not instructions (backend rule).

---

## Troubleshooting during the live demo

| Problem | Fix |
|---------|-----|
| Health screen red | Start API on port 8000; check `.env` URL |
| Upload 422 on **web** | Hard-refresh browser (web needs real `File` in FormData) |
| Upload fails on phone | Use LAN IP in `.env`, not `localhost`; check CORS in API `.env` |
| Empty trips | Run `python scripts/seed_demo.py` in API repo |
| Chat / upload disabled | Demo mode OFF; check network banner |
| Extraction always “Mock Hotel” | Expected with `USE_MOCK_LLM=true`; mention Ollama path for real extraction |

---

## Fallback demo (no backend)

1. Turn **Demo mode ON** on My Trips.
2. Open trip → Overview, Timeline (synthetic Buenos Aires + Bariloche).
3. Documents → **Review sample extraction** (static demo flow).
4. Explain architecture using README + `http://localhost:8000/docs` if API can run on laptop without phone.

---

## Files to have open (optional)

| Resource | Purpose |
|----------|---------|
| `test-notes/travel-test-documents.pdf` | Upload demo |
| http://localhost:8000/docs | API contract |
| GitHub: `travel-planner-mobile` + `travel-planner-api` | Repos |
| `.cursor/rules/backend-integration.md` | Integration rules you wrote for agents |

---

## One-sentence close

> “I built a mobile client that treats AI as **propose-and-verify**: documents become candidates, chat answers cite sources, and nothing hits the canonical timeline until the user confirms — all through a typed, testable API boundary.”
