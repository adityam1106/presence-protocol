# WebSocket Real-Time Communication — Design Spec

**Date:** 2026-03-23
**Status:** Approved
**Scope:** Add Socket.io to the Express server and connect `/call`, `/phone`, and `/handshake` pages for a live two-device presence verification flow.

---

## Goal

Open `/call` on a laptop, open `/phone` on a real phone (same WiFi), click Initiate on the laptop — the phone reacts in real time, signs the challenge, and both devices resolve to the `/handshake` screen, all without any manual interaction on the phone.

---

## Architecture

```
/call (laptop)          Server (port 4000)         /phone (phone)
      │                        │                         │
      │  POST /api/challenge   │                         │
      │ ──────────────────────▶│                         │
      │                        │ io.emit('challenge:broadcast')
      │                        │ ──────────────────────▶ │
      │  status → broadcasting │                         │ phase → received
      │                        │                         │    → signing
      │                        │   POST /api/verify      │
      │                        │ ◀────────────────────── │
      │                        │ io.emit('presence:verified')
      │ ◀────────────────────────────────────────────── │
      │  status → approved     │                         │ phase → transmitted
      │  router.push('/handshake?session=PRES-...&ts=…') │
```

### What is NOT in scope

- `/demo` page — untouched; keeps its existing scripted REST-based timeline
- `/api/challenge` and `/api/verify` REST contracts — unchanged; REST fallback preserved
- Authentication, rooms, or namespaces — single global broadcast is correct for this demo

---

## Socket Events

### `challenge:broadcast` — server → all clients

Emitted by the server immediately after a successful `POST /api/challenge`.

```ts
interface ChallengeBroadcast {
  sessionId: string;   // UUID — used by /phone to call POST /api/verify
  token: string;       // 256-bit hex — used by /phone to call POST /api/verify
  issuedAt: string;    // ISO-8601
  expiresAt: string;   // ISO-8601
  humanId: string;     // PRES-XXXX-XXXX — display identifier only
}
```

**Note:** `token` travels over the local socket so `/phone` can call `POST /api/verify`. It is never displayed in any UI. `humanId` is the only value shown on screen or passed in URLs.

### `presence:verified` — server → all clients

Emitted by the server immediately after a successful `POST /api/verify` (i.e., `result.verified === true`).

```ts
interface PresenceVerified {
  humanId: string;     // PRES-XXXX-XXXX — matches the original challenge:broadcast
  verifiedAt: string;  // ISO-8601 timestamp of verification
}
```

---

## `humanId` Format and Generation Algorithm

- Pattern: `PRES-[A-Z0-9]{4}-[A-Z0-9]{4}` (e.g., `PRES-A3K9-7BXQ`)
- Stored on `VerificationSession` (internal) and returned in `ChallengeToken`
- Example entropy: 36^8 ≈ 2.8 trillion combinations — adequate for a demo session display ID

**Exact generation algorithm** for `generateHumanId()` in `challengeService.ts`:

```ts
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // 36 chars

function generateHumanId(): string {
  const bytes = crypto.randomBytes(8); // 8 bytes → 2 segments of 4 chars
  const segment = (offset: number) =>
    Array.from({ length: 4 }, (_, i) => CHARS[bytes[offset + i] % CHARS.length]).join('');
  return `PRES-${segment(0)}-${segment(4)}`;
}
```

Each byte maps to one character via modulo 36. Slight modulo bias (256 % 36 = 4) is negligible for a display ID.

---

## Data Model Changes (`@presence/shared`)

### `ChallengeToken` — add `humanId`

```ts
export interface ChallengeToken {
  sessionId: string;
  token: string;
  issuedAt: string;
  expiresAt: string;
  humanId: string;   // ← new
}
```

### `VerificationSession` — add `humanId`

```ts
export interface VerificationSession {
  sessionId: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  consumed: boolean;
  humanId: string;   // ← new
}
```

### `VerificationResult` — add `humanId?`

```ts
export interface VerificationResult {
  verified: boolean;
  sessionId: string;
  reason?: string;
  humanId?: string;  // ← new; present only when verified: true
}
```

---

## Server Changes

### `server/src/lib/socket.ts` — new file (avoids circular ESM import)

Create a dedicated module that owns the Socket.io instance. **Do not export `io` from `index.ts`** — ESM circular imports cause `io` to be `undefined` at route-handler evaluation time, even though they appear to work at request time. The safe pattern is a separate module:

```ts
// server/src/lib/socket.ts
import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

let io: Server;

export function initSocket(httpServer: HttpServer, corsOrigin: string): Server {
  io = new Server(httpServer, { cors: { origin: corsOrigin } });
  return io;
}

export function getIo(): Server {
  if (!io) throw new Error('Socket.io not initialised');
  return io;
}
```

### `server/src/index.ts`

1. Import `http` from Node
2. Import `initSocket` from `./lib/socket.js`
3. Create `const httpServer = http.createServer(app)`
4. Call `initSocket(httpServer, CORS_ORIGIN)` **before** the routes are registered (to avoid the `getIo()` guard throwing on first request)
5. Replace `app.listen(PORT, ...)` with `httpServer.listen(PORT, ...)`
6. Add `io.on('connection', socket => console.log(...))` for diagnostics

### `server/src/routes/challenge.ts`

- Import `getIo` from `../lib/socket.js`
- After `generateChallenge()` succeeds: `getIo().emit('challenge:broadcast', challenge)`
- After `verifyChallenge()` returns `verified: true`: `getIo().emit('presence:verified', { humanId: result.humanId, verifiedAt: new Date().toISOString() })`

### `server/src/services/challengeService.ts`

- Add `generateHumanId()` private helper using `crypto.randomBytes` mapped to `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`
- Call it inside `generateChallenge()` and store on the session
- Include `humanId` in the returned `ChallengeToken`
- Return `humanId` from `verifyChallenge()` in `VerificationResult` when `verified: true` (look it up from `session.humanId`)

### Late-join handling (race condition mitigation)

`io.emit()` broadcasts only to sockets connected at the instant of the call. If `/phone` is still completing its WebSocket handshake when `/call` clicks Initiate, it misses the event.

Mitigation: when a socket connects, the server checks whether any non-expired, non-consumed challenge exists in the session store. If one does, it emits `challenge:broadcast` directly to that socket:

```ts
io.on('connection', (socket) => {
  const pending = getActivePendingChallenge(); // new export from challengeService
  if (pending) socket.emit('challenge:broadcast', pending);
});
```

Add `getActivePendingChallenge(): ChallengeToken | null` to `challengeService.ts`. It returns the most recently created non-expired, non-consumed session's token data, or `null` if none exist.

**Note:** The server cannot distinguish a `/phone` socket from a `/call` socket — `challenge:broadcast` may be re-delivered to `/call` on reconnect. This is harmless (the `/call` page does not handle `challenge:broadcast`), but `/phone` must guard against duplicates: if it receives `challenge:broadcast` with a `sessionId` it is already processing (i.e., `phase !== 'awaiting'`), it must ignore the event.

---

## Frontend Changes

### `web/src/lib/socket.ts` — new file

A lazy singleton socket client. `getSocket()` is safe to call in `useEffect` only — never at module level or render time (SSR safety).

```ts
// Pseudo-code
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, { autoConnect: false });
  }
  return socket;
}
```

Each page calls `socket.connect()` in `useEffect` and `socket.disconnect()` on cleanup.

### `/call` page

**Current flow:** POST challenge → wait 3s → POST verify (self) → approved/blocked
**New flow (socket connected):** POST challenge → emit handled by server → wait for `presence:verified` → navigate to `/handshake`
**Fallback (socket not connected):** unchanged current self-verify flow

Changes:
- Add `useEffect` to connect socket, listen for `presence:verified`
- On `presence:verified` event `{ humanId, verifiedAt }`: call exactly `router.push(\`/handshake?session=${encodeURIComponent(humanId)}&ts=${encodeURIComponent(verifiedAt)}\`)` — `session` carries the PRES-XXXX-XXXX humanId; `ts` carries the ISO-8601 verifiedAt timestamp
- In `initiateVerification`: after entering `broadcasting` state, if `socket.connected`, skip the `POST /api/verify` self-call and set a deadline timer instead (see below)
- If `presence:verified` not received by `expiresAt` (the ISO-8601 field from the challenge response): clear the timer, set `error` to a timeout message, set `status` to `blocked`

**Timeout guard:** After POST /api/challenge succeeds and socket is connected, schedule a timer firing at `new Date(challenge.expiresAt).getTime() - Date.now()` ms. If it fires before `presence:verified` arrives, treat it as a blocked verification with message "Challenge expired — no phone responded."

### `/phone` page

**Current flow:** `runFlow()` auto-called on mount (fetches own challenge, self-verifies)
**New flow:** Stay in `awaiting` phase until `challenge:broadcast` received; then run sign+verify flow using received `sessionId` and `token`

Changes:
- Remove `useEffect(() => { runFlow(); }, [runFlow])`
- Add `useEffect` to connect socket, listen for `challenge:broadcast`
- On `challenge:broadcast`: call `runFlow(challengeData)` passing the received data
- `runFlow` accepts an optional `ChallengeData` param; if provided, skips `POST /api/challenge` fetch and uses the received data directly
- **"Run Again" button:** change behavior to reset `phase` to `awaiting` and re-register the socket listener (i.e., reset state and wait for the next `challenge:broadcast`). Do **not** self-fetch a new challenge.

### `/handshake` page

**Current:** Hardcoded `SESSION_ID` and `VERIFICATION_TIME` constants
**New:** Read `session` and `ts` from `useSearchParams()`; fall back to hardcoded values if params absent (preserves direct-navigation behavior)

**Suspense requirement:** `useSearchParams()` in Next.js 13+ requires a `<Suspense>` boundary. Extract the params-reading and display logic into a `HandshakeDetails` child component; wrap it with `<Suspense fallback={null}>` (or a minimal placeholder) in the default `HandshakePage` export. The animation (shield draw) can live in the outer page component and play regardless.

Changes:
- Extract `HandshakeDetails` component that calls `useSearchParams()` and reads `session` (→ `SESSION_ID` equivalent, the PRES-XXXX-XXXX humanId) and `ts` (→ `VERIFICATION_TIME` equivalent, ISO-8601 verifiedAt)
- Decode with `decodeURIComponent(searchParams.get('session') ?? '')` and `decodeURIComponent(searchParams.get('ts') ?? '')`; fall back to the existing hardcoded constants if either param is absent/empty
- Wrap `<HandshakeDetails />` in `<Suspense fallback={null}>` in the page export
- The shield animation and outer layout remain in the parent `HandshakePage` component (no Suspense needed there)
- No socket connection needed on this page

---

## Packages to Install

| Package | Location | Purpose |
|---|---|---|
| `socket.io` | `server/` | WebSocket server |
| `socket.io-client` | `web/` | WebSocket client |

No `@types` packages needed — both ship their own TypeScript declarations.

---

## Fallback Behavior Summary

| Scenario | `/call` | `/phone` |
|---|---|---|
| Both connected via socket | Waits for `presence:verified`; expires at challenge TTL | Waits for `challenge:broadcast` |
| Socket unavailable on `/call` | Self-verifies (current flow) | Stays in `awaiting` |
| `/call` initiated but no phone connected | Times out at `expiresAt`, shows blocked + "no phone responded" | — |
| `/phone` connects after challenge already broadcast | Server re-emits on connect if session still valid | Receives challenge immediately |
| `/phone` opened alone, no challenge pending | Stays in `awaiting` indefinitely | — |
| `/demo` page | Never uses sockets | Never uses sockets |

---

## Out of Scope

- Rooms or per-session namespacing (single global broadcast is sufficient for a two-device demo)
- Socket authentication / handshake tokens
- Reconnection state persistence
- The `/demo` page scripted timeline
