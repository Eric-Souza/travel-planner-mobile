# Travel Planner Mobile

Expo/React Native client for a **local-first AI travel planner**. This app handles presentation, interaction, cached read models, and typed API calls only — all AI, retrieval, and business rules live in the companion backend [`travel-planner-api`](https://github.com/Eric-Souza/travel-planner-api).

## Tech stack

| Area | Technology | Version (approx.) | Role |
|------|------------|-------------------|------|
| Framework | [Expo](https://expo.dev) | SDK 56 | Build, dev server, native APIs |
| UI | [React Native](https://reactnative.dev) | 0.85 | Cross-platform mobile UI |
| Language | [TypeScript](https://www.typescriptlang.org) | 6.x (strict) | Type-safe app code |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) | 56 | File-based routes under `app/` |
| Server state | [TanStack Query](https://tanstack.com/query) | 5.x | Fetching, caching, mutations |
| UI state | [Zustand](https://zustand.docs.pmnd.rs) | 5.x | Tabs, modals, filters, demo mode |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | 7.x / 4.x | Client-side validation |
| HTTP client | Custom `src/api/client.ts` | — | Typed REST + error envelope |
| API types | [openapi-typescript](https://github.com/drwpow/openapi-typescript) | 7.x | Generated from FastAPI OpenAPI |
| Offline cache | [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) | 3.x | Read-only trip/document cache |
| Maps | [react-native-webview](https://github.com/react-native-webview/react-native-webview) + Leaflet/OSM | 14.x | Presentation-only map pins |
| Bottom sheets | [@gorhom/bottom-sheet](https://gorhom.dev/react-native-bottom-sheet/) | 5.x | Source citation drawer |
| File upload | [expo-document-picker](https://docs.expo.dev/versions/latest/sdk/document-picker/) | 56 | PDF / TXT / EML selection |
| Network | [expo-network](https://docs.expo.dev/versions/latest/sdk/network/) | 56 | Offline detection |
| Icons | [@expo/vector-icons](https://icons.expo.fyi) | 15.x | Tab and UI icons |
| Gestures / animation | react-native-gesture-handler, react-native-reanimated | 3.x / 4.x | Navigation and sheets |
| Testing | [Jest](https://jestjs.io) + [ts-jest](https://kulshekhar.github.io/ts-jest/) | 29.x | Unit tests (SSE, dates, timeline) |
| Package manager | npm | — | `npm install`, `npm start` |

**Backend (separate repo):** FastAPI, SQLite/PostgreSQL, mock or Ollama LLM — consumed only via `EXPO_PUBLIC_API_BASE_URL`.

## Prerequisites

- Node.js 20+
- npm
- [Expo Go](https://expo.dev/go) on a physical device, or Android emulator / iOS simulator
- Running [`travel-planner-api`](https://github.com/Eric-Souza/travel-planner-api) for live data (optional — use **Demo mode** without backend)

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your machine's LAN IP (see below)
npm start
```

## API URL and physical devices

On a **physical phone**, `localhost` refers to the phone itself, not your computer. Set:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LAN_IP:8000/v1
```

| Target | URL |
|--------|-----|
| Physical phone | `http://192.168.x.x:8000/v1` (your PC's LAN IP) |
| Android emulator | `http://10.0.2.2:8000/v1` |
| iOS simulator / web | `http://localhost:8000/v1` |

Your phone and computer must be on the same Wi‑Fi. The backend must bind to `0.0.0.0` and include your Expo dev URL in `CORS_ORIGINS`.

The health screen calls `GET /health` at the API root (without `/v1`).

## Generate API types

When the FastAPI backend is running:

```bash
npm run api:generate
```

Fetches `openapi.json` and writes `src/api/generated/api-types.generated.ts`. Regenerate after every backend schema change.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Open on Android emulator |
| `npm run ios` | Open on iOS simulator (macOS) |
| `npm run web` | Run in web browser |
| `npm run api:generate` | Regenerate TypeScript types from OpenAPI |
| `npm test` | Run unit tests |

## Project structure

```
app/                    Expo Router screens
src/
  api/                  Typed API client, modules, mappers, generated types
  components/           Shared UI primitives
  features/             Feature-specific components and demo data
  hooks/                TanStack Query hooks, SSE chat, query keys
  store/                Zustand UI state
  cache/                AsyncStorage read cache
  utils/                Dates, errors, timeline grouping
  theme/                Colors and typography
  types/                Shared TypeScript types
scripts/                api:generate script
.cursor/rules/          Cursor rules (backend integration)
```

**Data flow:** `Screen → hook → API module → client → FastAPI /v1`

Never: `Screen → fetch → Ollama / provider / database`

## Working with Cursor

Paste the contents of [`CURSOR_PROMPT.md`](CURSOR_PROMPT.md) into a new Cursor chat, or rely on [`AGENTS.md`](AGENTS.md) which Cursor loads automatically. For API contract details see [`.cursor/rules/backend-integration.md`](.cursor/rules/backend-integration.md).

## Demo mode

Enable **Demo mode** on the trips list to explore synthetic Buenos Aires + Bariloche sample data without a backend.

## Demo checklist (portfolio)

1. Start backend + mobile; confirm health screen shows green status
2. Create a trip (or use demo mode)
3. Set preferences
4. Upload a hotel PDF → review AI extraction → confirm
5. View confirmed booking on timeline
6. Ask “What time is check-in?” in chat — streamed answer with citation
7. Generate itinerary proposal → review → explicitly apply
8. Toggle offline — cached data visible, uploads/AI disabled

## Architecture rules

- Never call Ollama, PostgreSQL, or external provider APIs from this repo
- Never auto-confirm AI extractions or auto-apply itinerary proposals
- Label AI-extracted bookings until user confirms
- Show citations and status chips in chat, not chain-of-thought
