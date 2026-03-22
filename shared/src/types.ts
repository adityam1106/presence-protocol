// ─── Challenge-Response Types ────────────────────────────────────────────────

/** A 256-bit challenge token issued by the server. */
export interface ChallengeToken {
  /** Unique identifier for this challenge session. */
  sessionId: string;
  /** Hex-encoded 256-bit random token. */
  token: string;
  /** ISO-8601 timestamp when the challenge was issued. */
  issuedAt: string;
  /** ISO-8601 timestamp when the challenge expires. */
  expiresAt: string;
}

/** Request body sent by the phone to verify presence. */
export interface ChallengeResponse {
  /** The session ID from the original challenge. */
  sessionId: string;
  /** The token echoed back by the phone. */
  token: string;
}

/** Result returned after verifying a challenge response. */
export interface VerificationResult {
  /** Whether the presence was successfully verified. */
  verified: boolean;
  /** The session ID that was verified. */
  sessionId: string;
  /** Human-readable reason when verification fails. */
  reason?: string;
}

/** Internal session state tracked by the server. */
export interface VerificationSession {
  /** Unique session identifier. */
  sessionId: string;
  /** Hex-encoded 256-bit challenge token. */
  token: string;
  /** Unix timestamp (ms) when the challenge was created. */
  createdAt: number;
  /** Unix timestamp (ms) when the challenge expires. */
  expiresAt: number;
  /** Whether this session has already been consumed. */
  consumed: boolean;
}

// ─── API Envelope Types ─────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
