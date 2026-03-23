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

## `humanId` Format

- Pattern: `PRES-[A-Z0-9]{4}-[A-Z0-9]{4}` (e.g., `PRES-A3K9-7BXQ`)
- Generated in `challengeService.generateChallenge()` using `crypto.randomBytes`
- Stored on `VerificationSession` (internal) and returned in `ChallengeToken`
- Example entropy: 36^8 ≈ 2.8 trillion combinations — adequate for a demo session display ID

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

---

## Server Changes

### `server/src/index.ts`

1. Import `http` from Node and `Server` from `socket.io`
2. Create `const httpServer = http.createServer(app)`
3. Create `export const io = new Server(httpServer, { cors: { origin: CORS_ORIGIN } })`
4. Replace `app.listen(PORT, ...)` with `httpServer.listen(PORT, ...)`
5. Add `io.on('connection', socket => console.log(...))` for diagnostics

### `server/src/routes/challenge.ts`

- Import `io` from `../index.js`
- After `generateChallenge()` succeeds: `io.emit('challenge:broadcast', challenge)`
- After `verifyChallenge()` returns `verified: true`: `io.emit('presence:verified', { humanId: result.humanId, verifiedAt: new Date().toISOString() })`

> `result.humanId` requires either returning it from `verifyChallenge()` or looking it up from the session store. Preferred: `verifyChallenge()` returns `humanId` in its result when `verified: true`.

### `server/src/services/challengeService.ts`

- Add `generateHumanId()` private helper using `crypto`
- Call it inside `generateChallenge()` and store on the session
- Include `humanId` in the returned `ChallengeToken`
- Update `VerificationResult` to include `humanId?: string` when verified

---

## Frontend Changes

### `web/src/lib/socket.ts` — new file

A lazy singleton socket client. Exports `getSocket()` which creates the `socket.io-client` instance once and reuses it across pages.

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
**New flow (socket connected):** POST challenge → emit handled by server → wait for `presence:verified` → navigate to `/handshake?session=PRES-...&ts=...`
**Fallback (socket not connected):** unchanged current self-verify flow

Changes:
- Add `useEffect` to connect socket, listen for `presence:verified`
- On `presence:verified`: call `router.push(\`/handshake?session=${humanId}&ts=${verifiedAt}\`)`
- Skip the `POST /api/verify` self-call when socket is connected and in `broadcasting` state

### `/phone` page

**Current flow:** `runFlow()` auto-called on mount (fetches own challenge, self-verifies)
**New flow:** Stay in `awaiting` phase until `challenge:broadcast` received; then run sign+verify flow using received `sessionId` and `token`

Changes:
- Remove `useEffect(() => { runFlow(); }, [runFlow])`
- Add `useEffect` to connect socket, listen for `challenge:broadcast`
- On `challenge:broadcast`: call `runFlow(challengeData)` passing the received data
- `runFlow` accepts optional `ChallengeData` param; if provided, skips `POST /api/challenge` fetch and uses the received data directly

### `/handshake` page

**Current:** Hardcoded `SESSION_ID` and `VERIFICATION_TIME` constants
**New:** Read `session` and `ts` from `useSearchParams()`; fall back to hardcoded values if params absent (preserves direct-navigation behavior)

Changes:
- Replace `const SESSION_ID` and `const VERIFICATION_TIME` with `useSearchParams()` reads
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
| Both connected via socket | Waits for `presence:verified` | Waits for `challenge:broadcast` |
| Socket unavailable on `/call` | Self-verifies (current flow) | Stays in `awaiting` |
| `/demo` page | Never uses sockets | Never uses sockets |
| `/phone` opened alone | Stays in `awaiting` indefinitely | — |

---

## Out of Scope

- Rooms or per-session namespacing (single global broadcast is sufficient for a two-device demo)
- Socket authentication / handshake tokens
- Reconnection state persistence
- The `/demo` page scripted timeline
