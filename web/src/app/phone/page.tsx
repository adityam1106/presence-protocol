'use client';

import { useEffect, useState, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Status =
  | 'idle'
  | 'listening'
  | 'received'
  | 'transmitting'
  | 'verified'
  | 'failed';

interface ChallengeData {
  sessionId: string;
  token: string;
  issuedAt: string;
  expiresAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const STATUS_TEXT: Record<Status, string> = {
  idle: 'Initializing secure channel…',
  listening: 'Listening for challenge…',
  received: 'Challenge received',
  transmitting: 'Transmitting presence token…',
  verified: 'Presence Verified ✓',
  failed: 'Verification Failed',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function PhonePage() {
  const [status, setStatus] = useState<Status>('idle');
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runFlow = useCallback(async () => {
    try {
      // Phase 1: Listening
      setStatus('listening');
      await delay(1200);

      // Phase 2: Fetch challenge
      const res = await fetch(`${API}/api/challenge`, { method: 'POST' });
      const json = await res.json();

      if (!json.success) throw new Error(json.error || 'Challenge request failed');

      setChallenge(json.data);
      setStatus('received');
      await delay(1500);

      // Phase 3: Transmit (verify)
      setStatus('transmitting');
      await delay(2000);

      const verifyRes = await fetch(`${API}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: json.data.sessionId,
          token: json.data.token,
        }),
      });
      const verifyJson = await verifyRes.json();

      // Phase 4: Result
      if (verifyJson.success && verifyJson.data.verified) {
        setStatus('verified');
      } else {
        setError(verifyJson.data?.reason || 'Unknown error');
        setStatus('failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setStatus('failed');
    }
  }, []);

  useEffect(() => {
    runFlow();
  }, [runFlow]);

  const isActive = ['listening', 'received', 'transmitting'].includes(status);
  const isVerified = status === 'verified';
  const isFailed = status === 'failed';

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white select-none">
      {/* ── Background grid pattern ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Top bar ── */}
      <header className="absolute top-0 right-0 left-0 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          <span className="font-mono text-[11px] tracking-widest text-cyan-400/70 uppercase">
            Presence Protocol
          </span>
        </div>
        <span className="font-mono text-[10px] text-white/30">
          {new Date().toLocaleTimeString()}
        </span>
      </header>

      {/* ── Sonar pulse ── */}
      <div className="relative flex h-56 w-56 items-center justify-center">
        {/* Ripple rings */}
        {isActive && (
          <>
            <span className="sonar-ring absolute inset-0 rounded-full border border-cyan-400/40" style={{ animationDelay: '0s' }} />
            <span className="sonar-ring absolute inset-0 rounded-full border border-cyan-400/30" style={{ animationDelay: '0.6s' }} />
            <span className="sonar-ring absolute inset-0 rounded-full border border-cyan-400/20" style={{ animationDelay: '1.2s' }} />
          </>
        )}

        {/* Center orb */}
        <div
          className={`
            relative z-10 flex h-24 w-24 items-center justify-center rounded-full
            transition-all duration-700 ease-out
            ${isVerified
              ? 'bg-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.4)]'
              : isFailed
                ? 'bg-red-500/20 shadow-[0_0_60px_rgba(239,68,68,0.4)]'
                : 'bg-cyan-500/10 shadow-[0_0_60px_rgba(6,182,212,0.3)]'
            }
          `}
        >
          <div
            className={`
              h-12 w-12 rounded-full transition-all duration-700
              ${isVerified
                ? 'bg-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.8)]'
                : isFailed
                  ? 'bg-red-400 shadow-[0_0_30px_rgba(248,113,113,0.8)]'
                  : 'bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.8)]'
              }
              ${isActive ? 'animate-pulse' : ''}
            `}
          />
        </div>

        {/* Verified checkmark overlay */}
        {isVerified && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <svg className="h-14 w-14 animate-[scaleIn_0.4s_ease-out] text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* Failed X overlay */}
        {isFailed && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <svg className="h-14 w-14 animate-[scaleIn_0.4s_ease-out] text-red-300 drop-shadow-[0_0_12px_rgba(248,113,113,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>

      {/* ── Status text ── */}
      <div className="mt-10 flex flex-col items-center gap-3">
        <p
          className={`
            font-mono text-lg font-medium tracking-wide transition-colors duration-500
            ${isVerified ? 'text-emerald-400' : isFailed ? 'text-red-400' : 'text-cyan-300'}
          `}
        >
          {STATUS_TEXT[status]}
        </p>

        {/* Token preview */}
        {challenge && status !== 'idle' && (
          <div className="mt-2 flex flex-col items-center gap-1">
            <span className="text-[10px] tracking-[0.2em] text-white/30 uppercase">
              Session
            </span>
            <code className="font-mono text-[11px] text-white/40">
              {challenge.sessionId.slice(0, 8)}…{challenge.sessionId.slice(-4)}
            </code>
          </div>
        )}

        {/* Error detail */}
        {error && (
          <p className="mt-1 max-w-xs text-center font-mono text-xs text-red-400/70">
            {error}
          </p>
        )}
      </div>

      {/* ── Retry button ── */}
      {(isVerified || isFailed) && (
        <button
          onClick={() => {
            setStatus('idle');
            setChallenge(null);
            setError(null);
            runFlow();
          }}
          className="mt-10 rounded-full border border-white/10 bg-white/5 px-8 py-3 font-mono text-xs tracking-widest text-white/60 uppercase backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-cyan-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] active:scale-95"
        >
          Run Again
        </button>
      )}

      {/* ── Bottom bar ── */}
      <footer className="absolute bottom-0 right-0 left-0 flex items-center justify-center px-6 py-5">
        <div className="flex items-center gap-4">
          <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'animate-pulse bg-cyan-400' : isVerified ? 'bg-emerald-400' : isFailed ? 'bg-red-400' : 'bg-white/20'}`} />
          <span className="font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase">
            Secure Physical Presence Verification
          </span>
        </div>
      </footer>

      {/* ── Inline styles for sonar keyframes ── */}
      <style jsx>{`
        .sonar-ring {
          animation: sonarPulse 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes sonarPulse {
          0% {
            transform: scale(0.5);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
