import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ChallengeResponse, ApiResponse, ChallengeToken, VerificationResult } from '@presence/shared';
import { generateChallenge, verifyChallenge } from '../services/challengeService.js';

const router = Router();

/**
 * POST /api/challenge
 * Generate a new 256-bit challenge token.
 * Returns the challenge payload with session ID, token, and expiry.
 */
router.post('/challenge', (_req: Request, res: Response<ApiResponse<ChallengeToken>>) => {
  try {
    const challenge = generateChallenge();

    res.status(201).json({
      success: true,
      data: challenge,
    });
  } catch (err) {
    console.error('Failed to generate challenge:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error while generating challenge.',
    });
  }
});

/**
 * POST /api/verify
 * Verify a challenge response from the phone.
 * Body: { sessionId: string, token: string }
 * Returns whether the presence was verified.
 */
router.post('/verify', (req: Request<{}, ApiResponse<VerificationResult>, ChallengeResponse>, res: Response<ApiResponse<VerificationResult>>) => {
  try {
    const { sessionId, token } = req.body;

    // Validate request body
    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing or invalid "sessionId" in request body.',
      });
      return;
    }

    if (!token || typeof token !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing or invalid "token" in request body.',
      });
      return;
    }

    // Validate token format (should be 64 hex characters = 256 bits)
    if (!/^[0-9a-f]{64}$/i.test(token)) {
      res.status(400).json({
        success: false,
        error: 'Token must be a 64-character hex string (256 bits).',
      });
      return;
    }

    const result = verifyChallenge(sessionId, token);

    const statusCode = result.verified ? 200 : 401;
    res.status(statusCode).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('Failed to verify challenge:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error while verifying challenge.',
    });
  }
});

export default router;
