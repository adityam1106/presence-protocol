import crypto from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import type { VerificationSession, ChallengeToken, VerificationResult } from '@presence/shared';

// Re-export types for convenience
export type { ChallengeToken, VerificationResult };

// ─── Configuration ───────────────────────────────────────────────────────────

const CHALLENGE_TTL_MS = parseInt(process.env.CHALLENGE_TTL_MS || '30000', 10);

// ─── In-Memory Store ─────────────────────────────────────────────────────────

const sessions = new Map<string, VerificationSession>();

/** Purge expired sessions to prevent memory leaks. */
function purgeExpired(): void {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (session.expiresAt <= now) {
      sessions.delete(id);
    }
  }
}

// Run cleanup every 60 seconds
setInterval(purgeExpired, 60_000);

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate a new 256-bit challenge token and store it with a TTL.
 * Returns the challenge payload to be sent to the client.
 */
export function generateChallenge(): ChallengeToken {
  const sessionId = uuidv4();
  const token = crypto.randomBytes(32).toString('hex'); // 256 bits

  const now = Date.now();
  const expiresAt = now + CHALLENGE_TTL_MS;

  // Store session
  sessions.set(sessionId, {
    sessionId,
    token,
    createdAt: now,
    expiresAt,
    consumed: false,
  });

  return {
    sessionId,
    token,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

/**
 * Verify a challenge response from the phone.
 * Checks that the session exists, hasn't expired, hasn't been consumed,
 * and that the token matches.
 */
export function verifyChallenge(sessionId: string, token: string): VerificationResult {
  const session = sessions.get(sessionId);

  // Session not found
  if (!session) {
    return { verified: false, sessionId, reason: 'Session not found or already expired.' };
  }

  // Session expired
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return { verified: false, sessionId, reason: 'Challenge has expired.' };
  }

  // Already consumed (replay protection)
  if (session.consumed) {
    return { verified: false, sessionId, reason: 'Challenge has already been used.' };
  }

  // Token mismatch
  if (!crypto.timingSafeEqual(Buffer.from(session.token, 'hex'), Buffer.from(token, 'hex'))) {
    return { verified: false, sessionId, reason: 'Token mismatch.' };
  }

  // ✅ Valid — mark consumed
  session.consumed = true;

  return { verified: true, sessionId };
}

/**
 * Get the current count of active (non-expired) sessions. Useful for health checks.
 */
export function getActiveSessionCount(): number {
  purgeExpired();
  return sessions.size;
}
