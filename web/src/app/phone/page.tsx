'use client';

import { useEffect, useState, useCallback } from 'react';
import NavBar from '../components/NavBar';

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = 'awaiting' | 'received' | 'signing' | 'transmitted' | 'failed';

interface ChallengeData {
  sessionId: string;
  token: string;
  issuedAt: string;
  expiresAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const PHASE_TEXT: Record<Phase, string> = {
  awaiting: 'AWAITING CHALLENGE…',
  received: 'CHALLENGE RECEIVED',
  signing: 'SIGNING WITH SECURE ENCLAVE…',
  transmitted: 'PRESENCE TRANSMITTED',
  failed: 'VERIFICATION FAILED',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PhonePage() {
  const [phase, setPhase] = useState<Phase>('awaiting');
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clock, setClock] = useState('');
  const [txTimestamp, setTxTimestamp] = useState<string | null>(null);

  // Live clock
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const runFlow = useCallback(async () => {
    try {
      setError(null);
      setChallenge(null);
      setTxTimestamp(null);

      // Phase 1: Awaiting
      setPhase('awaiting');
      await delay(1500);

      // Phase 2: Fetch challenge
      const res = await fetch(`${API}/api/challenge`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Challenge request failed');

      setChallenge(json.data);
      setPhase('received');
      await delay(1500);

      // Phase 3: Signing
      setPhase('signing');
      await delay(2000);

      // Phase 4: Verify
      const verifyRes = await fetch(`${API}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: json.data.sessionId,
          token: json.data.token,
        }),
      });
      const verifyJson = await verifyRes.json();
      setTxTimestamp(new Date().toISOString());

      if (verifyJson.success && verifyJson.data.verified) {
        setPhase('transmitted');
      } else {
        setError(verifyJson.data?.reason || 'Unknown error');
        setPhase('failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setTxTimestamp(new Date().toISOString());
      setPhase('failed');
    }
  }, []);

  useEffect(() => {
    runFlow();
  }, [runFlow]);

  const isActive = ['awaiting', 'received', 'signing'].includes(phase);
  const isTransmitted = phase === 'transmitted';
  const isFailed = phase === 'failed';

  // Ring color based on state
  const ringColor = isTransmitted
    ? 'rgba(34,197,94,0.3)'
    : isFailed
      ? 'rgba(239,68,68,0.3)'
      : 'rgba(37,99,235,0.35)';

  const accentColor = isTransmitted ? '#22c55e' : isFailed ? '#ef4444' : '#2563eb';

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center select-none pt-14"
      style={{
        background: '#080808',
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      }}
    >
      <NavBar />

      {/* Google Font */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ═══ PHONE FRAME ═══ */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: 390,
          maxWidth: '100vw',
          height: '100vh',
          maxHeight: 844,
          background: '#080808',
          border: '1px solid #1a1a1a',
        }}
      >
        {/* ── FAKE STATUS BAR ── */}
        <div
          className="flex items-center justify-between px-6 pt-3 pb-2 shrink-0"
          style={{ background: '#080808' }}
        >
          {/* Time */}
          <span
            className="text-sm font-semibold"
            style={{ color: '#e0e0e0', fontFamily: "'IBM Plex Mono', monospace", fontSize: '15px' }}
          >
            {clock}
          </span>

          {/* Right icons: signal + wifi + battery */}
          <div className="flex items-center gap-1.5">
            {/* Signal bars */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <rect x="0" y="8" width="3" height="4" fill="#e0e0e0" />
              <rect x="4" y="5" width="3" height="7" fill="#e0e0e0" />
              <rect x="8" y="2" width="3" height="10" fill="#e0e0e0" />
              <rect x="12" y="0" width="3" height="12" fill="#e0e0e0" opacity="0.3" />
            </svg>
            {/* WiFi */}
            <svg width="16" height="12" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="2">
              <path d="M1.42 9a16 16 0 0 1 21.16 0" opacity="0.3" />
              <path d="M5 12.55a11 11 0 0 1 14 0" opacity="0.6" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <circle cx="12" cy="20" r="1" fill="#e0e0e0" stroke="none" />
            </svg>
            {/* Battery */}
            <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
              <rect x="0" y="0" width="22" height="12" rx="2" stroke="#e0e0e0" strokeWidth="1" fill="none" />
              <rect x="2" y="2" width="16" height="8" fill="#22c55e" />
              <rect x="23" y="3" width="3" height="6" rx="1" fill="#e0e0e0" opacity="0.4" />
            </svg>
          </div>
        </div>

        {/* ── BANK APP HEADER ── */}
        <div
          className="flex items-center justify-center gap-2 py-3 border-b shrink-0"
          style={{ borderColor: '#1a1a1a', background: '#0a0a0a' }}
        >
          {/* Lock icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="0" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span
            className="text-xs font-semibold uppercase"
            style={{ color: '#c0c0c0', letterSpacing: '0.18em', fontSize: '11px' }}
          >
            FIRST NATIONAL BANK
          </span>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">

          {/* Sonar pulse animation */}
          <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
            {/* Concentric rings — always animate when active */}
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="absolute sonar-ring"
                style={{
                  width: '100%',
                  height: '100%',
                  border: `1px solid ${isActive ? ringColor : isTransmitted ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                  animationDelay: `${i * 0.5}s`,
                  animationPlayState: isActive ? 'running' : 'paused',
                  opacity: isActive ? 1 : 0.4,
                }}
              />
            ))}

            {/* Static fallback rings when not active */}
            {!isActive && [60, 90, 120].map((size) => (
              <span
                key={size}
                className="absolute"
                style={{
                  width: size,
                  height: size,
                  border: `1px solid ${isTransmitted ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}`,
                }}
              />
            ))}

            {/* Center shield icon */}
            <div
              className="relative z-10 flex items-center justify-center transition-all duration-700"
              style={{
                width: 72,
                height: 72,
                background: isTransmitted
                  ? 'rgba(34,197,94,0.08)'
                  : isFailed
                    ? 'rgba(239,68,68,0.08)'
                    : 'rgba(37,99,235,0.08)',
                border: `1px solid ${isTransmitted ? 'rgba(34,197,94,0.2)' : isFailed ? 'rgba(239,68,68,0.2)' : 'rgba(37,99,235,0.2)'}`,
                boxShadow: `0 0 40px ${isTransmitted ? 'rgba(34,197,94,0.15)' : isFailed ? 'rgba(239,68,68,0.15)' : 'rgba(37,99,235,0.15)'}`,
              }}
            >
              {isTransmitted ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <path strokeLinecap="square" d="M5 13l4 4L19 7" />
                </svg>
              ) : isFailed ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  className={isActive ? 'animate-pulse' : ''}
                >
                  <path d="M12 2L3 7v5c0 5.25 3.83 10.15 9 11.25C17.17 22.15 21 17.25 21 12V7l-9-5z" />
                </svg>
              )}
            </div>
          </div>

          {/* ── STATUS TEXT ── */}
          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              {isActive && (
                <div
                  className="w-1.5 h-1.5 animate-pulse"
                  style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
                />
              )}
              <span
                className="text-xs font-medium uppercase transition-colors duration-500"
                style={{
                  color: accentColor,
                  letterSpacing: '0.12em',
                  fontSize: '11px',
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                {PHASE_TEXT[phase]}
              </span>
            </div>

            {/* Error detail */}
            {error && (
              <p
                className="text-center mt-1"
                style={{
                  color: '#f87171',
                  fontSize: '10px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  maxWidth: 280,
                }}
              >
                {error}
              </p>
            )}
          </div>

          {/* ── DATA CARD ── */}
          {challenge && (
            <div
              className="w-full mt-8 animate-fade-in"
              style={{
                border: '1px solid #1a1a1a',
                background: '#0a0a0a',
                maxWidth: 340,
              }}
            >
              {/* Card header */}
              <div
                className="px-4 py-2 border-b text-xs uppercase font-semibold"
                style={{
                  borderColor: '#1a1a1a',
                  color: '#444',
                  letterSpacing: '0.15em',
                  fontSize: '9px',
                  background: '#0c0c0c',
                }}
              >
                SECURE ENCLAVE DATA
              </div>

              {/* Token ID */}
              <div className="px-4 py-3 border-b" style={{ borderColor: '#141414' }}>
                <div
                  className="text-xs uppercase mb-1"
                  style={{ color: '#444', letterSpacing: '0.12em', fontSize: '9px' }}
                >
                  TOKEN ID
                </div>
                <div
                  className="text-xs font-medium break-all"
                  style={{
                    color: '#2563eb',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    textShadow: '0 0 8px rgba(37,99,235,0.3)',
                    letterSpacing: '0.04em',
                    lineHeight: '1.5',
                  }}
                >
                  {challenge.token.slice(0, 32)}…
                </div>
              </div>

              {/* Timestamp + Enclave Status row */}
              <div className="grid grid-cols-2" style={{ borderTop: 'none' }}>
                <div className="px-4 py-3" style={{ borderRight: '1px solid #141414' }}>
                  <div
                    className="text-xs uppercase mb-1"
                    style={{ color: '#444', letterSpacing: '0.12em', fontSize: '9px' }}
                  >
                    TIMESTAMP
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color: '#888',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '10px',
                    }}
                  >
                    {txTimestamp
                      ? new Date(txTimestamp).toLocaleTimeString('en-GB', { hour12: false })
                      : new Date(challenge.issuedAt).toLocaleTimeString('en-GB', { hour12: false })}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div
                    className="text-xs uppercase mb-1"
                    style={{ color: '#444', letterSpacing: '0.12em', fontSize: '9px' }}
                  >
                    ENCLAVE STATUS
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-1.5 h-1.5"
                      style={{
                        background: '#22c55e',
                        boxShadow: '0 0 6px rgba(34,197,94,0.5)',
                      }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: '#22c55e',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Retry */}
          {(isTransmitted || isFailed) && (
            <button
              onClick={() => {
                setPhase('awaiting');
                setChallenge(null);
                setError(null);
                runFlow();
              }}
              className="mt-6 px-6 py-2.5 text-xs uppercase cursor-pointer"
              style={{
                color: '#555',
                background: 'transparent',
                border: '1px solid #222',
                letterSpacing: '0.1em',
                fontSize: '10px',
                fontFamily: "'IBM Plex Mono', monospace",
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#444';
                e.currentTarget.style.color = '#888';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#222';
                e.currentTarget.style.color = '#555';
              }}
            >
              RUN AGAIN
            </button>
          )}
        </div>

        {/* ── BOTTOM TEXT ── */}
        <div
          className="flex items-center justify-center py-4 shrink-0"
          style={{ background: '#080808' }}
        >
          <span
            className="text-xs uppercase text-center"
            style={{
              color: '#333',
              letterSpacing: '0.1em',
              fontSize: '9px',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            ULTRASONIC PRESENCE TOKEN TRANSMITTED
          </span>
        </div>

        {/* ── PHONE HOME INDICATOR ── */}
        <div className="flex items-center justify-center pb-2 shrink-0" style={{ background: '#080808' }}>
          <div
            style={{
              width: 134,
              height: 5,
              background: '#333',
              borderRadius: 3,
            }}
          />
        </div>
      </div>

      {/* ── Keyframe animations ── */}
      <style>{`
        .sonar-ring {
          animation: sonarExpand 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes sonarExpand {
          0% {
            transform: scale(0.2);
            opacity: 0.6;
          }
          80% {
            opacity: 0.1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeInUp 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}
