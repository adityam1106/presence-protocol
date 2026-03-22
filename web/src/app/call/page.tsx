'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../components/NavBar';

// ─── Types ───────────────────────────────────────────────────────────────────

type Status =
  | 'idle'
  | 'challenging'
  | 'broadcasting'
  | 'verifying'
  | 'approved'
  | 'blocked';

interface ChallengeData {
  sessionId: string;
  token: string;
  issuedAt: string;
  expiresAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tokenToGrid(token: string): string[] {
  const pairs: string[] = [];
  for (let i = 0; i < token.length; i += 2) {
    pairs.push(token.slice(i, i + 2));
  }
  return pairs;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CallPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [clock, setClock] = useState('');

  // Live clock
  useEffect(() => {
    const tick = () =>
      setClock(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-redirect to /handshake 2s after approval
  useEffect(() => {
    if (status === 'approved') {
      const timer = setTimeout(() => {
        router.push('/handshake');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  const initiateVerification = useCallback(async () => {
    try {
      setError(null);
      setChallenge(null);
      setTimestamp(null);

      setStatus('challenging');
      const res = await fetch(`${API}/api/challenge`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Challenge request failed');

      setChallenge(json.data);
      setStatus('broadcasting');
      await delay(3000);

      setStatus('verifying');
      const verifyRes = await fetch(`${API}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: json.data.sessionId,
          token: json.data.token,
        }),
      });
      const verifyJson = await verifyRes.json();
      setTimestamp(new Date().toISOString());

      if (verifyJson.success && verifyJson.data.verified) {
        setStatus('approved');
      } else {
        setError(verifyJson.data?.reason || 'Presence could not be verified');
        setStatus('blocked');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setTimestamp(new Date().toISOString());
      setStatus('blocked');
    }
  }, []);

  const isProcessing = ['challenging', 'broadcasting', 'verifying'].includes(status);
  const isApproved = status === 'approved';
  const isBlocked = status === 'blocked';

  return (
    <main className="min-h-screen flex flex-col pt-12" style={{ background: '#080808' }}>
      <NavBar />

      {/* Google Font import for IBM Plex Mono */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ═══ HEADER BAR ═══ */}
      <header
        className="flex items-center justify-between px-6 py-3 border-b shrink-0"
        style={{
          background: '#0a0a0a',
          borderColor: '#1a1a1a',
          fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-2 h-2" style={{ background: '#2563eb', boxShadow: '0 0 8px #2563eb' }} />
          <span
            className="text-xs font-semibold uppercase"
            style={{ letterSpacing: '0.2em', color: '#c0c0c0' }}
          >
            FIRST NATIONAL BANK — SECURE TRANSACTION TERMINAL
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: '#555', letterSpacing: '0.08em', fontFamily: "'IBM Plex Mono', monospace" }}>
            {clock}
          </span>
          <span style={{ color: '#222' }}>│</span>
          <span className="text-xs" style={{ color: '#444', letterSpacing: '0.1em', fontFamily: "'IBM Plex Mono', monospace" }}>
            OPERATOR: TXN-0042
          </span>
          <span style={{ color: '#222' }}>│</span>
          <span className="text-xs" style={{ color: '#333', letterSpacing: '0.1em', fontFamily: "'IBM Plex Mono', monospace" }}>
            CLEARANCE: LEVEL 4
          </span>
        </div>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex flex-1 overflow-hidden" style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}>

        {/* ── LEFT: TRANSACTION DETAILS ── */}
        <section className="flex flex-col shrink-0" style={{ width: '44%', borderRight: '1px solid #1a1a1a' }}>
          {/* Section header */}
          <div
            className="flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase border-b"
            style={{ letterSpacing: '0.15em', color: '#666', borderColor: '#1a1a1a', background: '#0a0a0a' }}
          >
            <span className="inline-block w-1.5 h-1.5" style={{ background: '#2563eb' }} />
            TRANSACTION RECORD
          </div>

          {/* Grid data fields */}
          <div className="flex-1 p-6 overflow-y-auto" style={{ background: '#080808' }}>
            {/* 3-col grid: IBAN, Amount, TxID */}
            <div className="grid grid-cols-3 gap-0 mb-6" style={{ border: '1px solid #1a1a1a' }}>
              {/* IBAN */}
              <div className="p-4" style={{ borderRight: '1px solid #1a1a1a' }}>
                <div className="text-xs uppercase mb-2" style={{ color: '#555', letterSpacing: '0.15em', fontSize: '9px' }}>
                  RECIPIENT IBAN
                </div>
                <div className="text-sm font-medium" style={{ color: '#d0d0d0', letterSpacing: '0.06em', fontSize: '13px' }}>
                  DE89 3704 0044 0532 0130 00
                </div>
              </div>
              {/* Amount */}
              <div className="p-4" style={{ borderRight: '1px solid #1a1a1a' }}>
                <div className="text-xs uppercase mb-2" style={{ color: '#555', letterSpacing: '0.15em', fontSize: '9px' }}>
                  AMOUNT
                </div>
                <div className="text-lg font-bold" style={{ color: '#f0f0f0', letterSpacing: '0.02em' }}>
                  €50,000.00
                </div>
              </div>
              {/* Transaction ID */}
              <div className="p-4">
                <div className="text-xs uppercase mb-2" style={{ color: '#555', letterSpacing: '0.15em', fontSize: '9px' }}>
                  TRANSACTION ID
                </div>
                <div className="text-sm font-medium" style={{ color: '#d0d0d0', letterSpacing: '0.04em', fontSize: '13px' }}>
                  TXN-2026-03847
                </div>
              </div>
            </div>

            {/* Detail rows */}
            <div style={{ border: '1px solid #1a1a1a' }}>
              {[
                { label: 'TYPE', value: 'WIRE TRANSFER — HIGH VALUE' },
                { label: 'ORIGINATOR', value: 'OPERATIONS DESK / AUTH-7' },
                { label: 'BENEFICIARY', value: 'SCHMIDT INDUSTRIES GMBH' },
                { label: 'BIC / SWIFT', value: 'COBADEFFXXX' },
                { label: 'REFERENCE', value: 'INV-2026-03847' },
                { label: 'CURRENCY', value: 'EUR' },
                { label: 'VALUE DATE', value: '2026-03-22' },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center px-4 py-3"
                  style={{
                    borderBottom: i < arr.length - 1 ? '1px solid #141414' : 'none',
                  }}
                >
                  <span className="text-xs uppercase" style={{ color: '#555', letterSpacing: '0.12em', fontSize: '10px' }}>
                    {row.label}
                  </span>
                  <span className="text-xs" style={{ color: '#aaa', fontSize: '12px' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Risk indicator */}
            <div
              className="flex items-center justify-between px-4 py-3 mt-4"
              style={{ border: '1px solid #1a1a1a', background: 'rgba(251,191,36,0.03)' }}
            >
              <span className="text-xs uppercase" style={{ color: '#555', letterSpacing: '0.12em', fontSize: '10px' }}>
                RISK ASSESSMENT
              </span>
              <span
                className="text-xs font-bold uppercase px-3 py-1"
                style={{
                  color: '#fbbf24',
                  letterSpacing: '0.15em',
                  fontSize: '10px',
                  border: '1px solid rgba(251,191,36,0.25)',
                  background: 'rgba(251,191,36,0.06)',
                }}
              >
                ■ HIGH
              </span>
            </div>

            {/* Regulation notice */}
            <div
              className="flex items-start gap-3 px-4 py-3 mt-4"
              style={{
                border: '1px solid #1a1a1a',
                background: '#0a0a0a',
                fontSize: '10px',
                lineHeight: '1.7',
                color: '#555',
              }}
            >
              <span style={{ color: '#f59e0b', fontSize: '12px', flexShrink: 0 }}>⚠</span>
              <span>
                PER EU PSD3 ART. 97 — TRANSACTIONS EXCEEDING €10,000 REQUIRE PHYSICAL
                PRESENCE VERIFICATION OF THE AUTHORIZING PARTY BEFORE SETTLEMENT.
              </span>
            </div>
          </div>
        </section>

        {/* ── RIGHT: VERIFICATION PANEL ── */}
        <section className="flex flex-col flex-1">
          <div
            className="flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase border-b"
            style={{ letterSpacing: '0.15em', color: '#666', borderColor: '#1a1a1a', background: '#0a0a0a' }}
          >
            <span className="inline-block w-1.5 h-1.5" style={{ background: '#2563eb' }} />
            PRESENCE VERIFICATION MODULE
          </div>

          <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#080808' }}>

            {/* ── IDLE ── */}
            {status === 'idle' && (
              <div className="flex flex-col items-center gap-6 max-w-md text-center">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.2" style={{ opacity: 0.4 }}>
                  <path d="M12 2L3 7v5c0 5.25 3.83 10.15 9 11.25C17.17 22.15 21 17.25 21 12V7l-9-5z" />
                </svg>
                <p className="text-xs uppercase" style={{ color: '#555', letterSpacing: '0.1em', lineHeight: '1.8', fontSize: '11px' }}>
                  INITIATE PHYSICAL PRESENCE VERIFICATION TO AUTHORIZE THIS TRANSACTION.
                  THE SYSTEM WILL BROADCAST AN ULTRASONIC CHALLENGE TOKEN TO THE CLIENT DEVICE.
                </p>
                <button
                  onClick={initiateVerification}
                  className="flex items-center gap-3 px-8 py-4 text-xs font-semibold uppercase cursor-pointer border-none"
                  style={{
                    background: '#2563eb',
                    color: '#e0e0e0',
                    letterSpacing: '0.12em',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
                >
                  <span style={{ fontSize: '8px' }}>▶</span>
                  INITIATE PRESENCE VERIFICATION
                </button>
              </div>
            )}

            {/* ── PROCESSING ── */}
            {isProcessing && challenge && (
              <div className="flex flex-col items-center gap-8 w-full max-w-lg animate-fade-in">
                {/* Status message */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 animate-pulse"
                    style={{ background: '#2563eb', boxShadow: '0 0 12px rgba(37,99,235,0.6)' }}
                  />
                  <span className="text-xs uppercase font-medium" style={{ color: '#60a5fa', letterSpacing: '0.1em', fontSize: '11px' }}>
                    {status === 'challenging' && 'REQUESTING CHALLENGE TOKEN…'}
                    {status === 'broadcasting' && 'BROADCASTING PRESENCE CHALLENGE…'}
                    {status === 'verifying' && 'VERIFYING PRESENCE RESPONSE…'}
                  </span>
                </div>

                {/* Token grid container */}
                <div className="w-full" style={{ border: '1px solid #1a1a1a', background: '#060606' }}>
                  {/* Container label */}
                  <div
                    className="px-4 py-2 text-xs uppercase font-semibold border-b"
                    style={{
                      letterSpacing: '0.2em',
                      fontSize: '9px',
                      color: '#2563eb',
                      borderColor: '#1a1a1a',
                      background: '#0a0a0a',
                    }}
                  >
                    ULTRASONIC CHALLENGE BROADCAST
                  </div>
                  {/* Hex grid */}
                  <div className="grid grid-cols-8 gap-px p-4" style={{ background: '#060606' }}>
                    {tokenToGrid(challenge.token).map((hex, i) => (
                      <span
                        key={i}
                        className="flex items-center justify-center py-2 text-sm font-semibold uppercase"
                        style={{
                          color: '#2563eb',
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: '13px',
                          textShadow: '0 0 10px rgba(37,99,235,0.5)',
                          background: 'rgba(37,99,235,0.03)',
                          border: '1px solid rgba(37,99,235,0.08)',
                          animation: `fadeInCell 0.3s ease-out ${i * 30}ms both`,
                        }}
                      >
                        {hex}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Session row */}
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase" style={{ color: '#444', letterSpacing: '0.15em', fontSize: '9px' }}>SESSION</span>
                  <span className="text-xs" style={{ color: '#666', fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px' }}>
                    {challenge.sessionId}
                  </span>
                </div>
              </div>
            )}

            {isProcessing && !challenge && (
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 animate-pulse"
                  style={{ background: '#2563eb', boxShadow: '0 0 12px rgba(37,99,235,0.6)' }}
                />
                <span className="text-xs uppercase font-medium" style={{ color: '#60a5fa', letterSpacing: '0.1em', fontSize: '11px' }}>
                  REQUESTING CHALLENGE TOKEN…
                </span>
              </div>
            )}

            {/* ── APPROVED ── */}
            {isApproved && (
              <div className="flex flex-col items-center w-full animate-fade-in">
                {/* Full-width green banner */}
                <div
                  className="w-full flex flex-col items-center justify-center py-12 px-8"
                  style={{
                    background: 'rgba(34,197,94,0.06)',
                    borderTop: '2px solid #22c55e',
                    borderBottom: '2px solid #22c55e',
                  }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="mb-6">
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                  </svg>
                  <div
                    className="text-2xl font-bold uppercase text-center mb-4"
                    style={{
                      color: '#22c55e',
                      letterSpacing: '0.15em',
                      fontFamily: "'IBM Plex Mono', monospace",
                      textShadow: '0 0 30px rgba(34,197,94,0.3)',
                    }}
                  >
                    TRANSACTION AUTHORISED
                  </div>
                  <div
                    className="text-xs uppercase text-center"
                    style={{ color: '#22c55e', letterSpacing: '0.1em', opacity: 0.6, fontSize: '10px' }}
                  >
                    PHYSICAL PRESENCE CONFIRMED — SETTLEMENT APPROVED
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex flex-col items-center gap-2 mt-6">
                  <div className="flex items-center gap-6">
                    <span className="text-xs" style={{ color: '#444', fontSize: '10px', letterSpacing: '0.08em' }}>
                      SESSION: {challenge?.sessionId.slice(0, 16)}…
                    </span>
                    <span className="text-xs" style={{ color: '#444', fontSize: '10px', letterSpacing: '0.08em' }}>
                      VERIFIED: {timestamp}
                    </span>
                  </div>
                  <div className="text-xs uppercase mt-1" style={{ color: '#333', letterSpacing: '0.1em', fontSize: '9px' }}>
                    REDIRECTING TO HANDSHAKE CONFIRMATION…
                  </div>
                </div>

                <button
                  onClick={() => { setStatus('idle'); setChallenge(null); }}
                  className="mt-6 px-6 py-3 text-xs font-medium uppercase cursor-pointer"
                  style={{
                    color: '#666',
                    background: 'transparent',
                    border: '1px solid #222',
                    letterSpacing: '0.1em',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '10px',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#444')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#222')}
                >
                  NEW VERIFICATION
                </button>
              </div>
            )}

            {/* ── BLOCKED ── */}
            {isBlocked && (
              <div className="flex flex-col items-center w-full animate-fade-in">
                {/* Full-width red banner */}
                <div
                  className="w-full flex flex-col items-center justify-center py-12 px-8"
                  style={{
                    background: 'rgba(239,68,68,0.06)',
                    borderTop: '2px solid #ef4444',
                    borderBottom: '2px solid #ef4444',
                  }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="mb-6">
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div
                    className="text-2xl font-bold uppercase text-center mb-4"
                    style={{
                      color: '#ef4444',
                      letterSpacing: '0.15em',
                      fontFamily: "'IBM Plex Mono', monospace",
                      textShadow: '0 0 30px rgba(239,68,68,0.3)',
                    }}
                  >
                    TRANSACTION BLOCKED
                  </div>
                  <div
                    className="text-xs uppercase text-center"
                    style={{ color: '#ef4444', letterSpacing: '0.1em', opacity: 0.6, fontSize: '10px' }}
                  >
                    PRESENCE VERIFICATION FAILED — SETTLEMENT DENIED
                  </div>
                </div>

                {/* Error detail */}
                {error && (
                  <div
                    className="mt-6 px-4 py-3 text-xs text-center"
                    style={{
                      color: '#f87171',
                      border: '1px solid rgba(239,68,68,0.2)',
                      background: 'rgba(239,68,68,0.04)',
                      fontSize: '11px',
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-6 mt-4">
                  <span className="text-xs" style={{ color: '#444', fontSize: '10px', letterSpacing: '0.08em' }}>
                    ATTEMPTED: {timestamp}
                  </span>
                </div>

                <button
                  onClick={() => { setStatus('idle'); setChallenge(null); setError(null); }}
                  className="mt-6 px-6 py-3 text-xs font-medium uppercase cursor-pointer"
                  style={{
                    color: '#666',
                    background: 'transparent',
                    border: '1px solid #222',
                    letterSpacing: '0.1em',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '10px',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#444')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#222')}
                >
                  RETRY VERIFICATION
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ═══ BOTTOM STATUS BAR ═══ */}
      <footer
        className="flex items-center justify-between px-6 py-2.5 border-t shrink-0"
        style={{
          borderColor: '#1a1a1a',
          background: '#0a0a0a',
          fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5"
            style={{
              background: isApproved ? '#22c55e' : isBlocked ? '#ef4444' : isProcessing ? '#2563eb' : '#444',
              boxShadow: isApproved
                ? '0 0 8px #22c55e'
                : isBlocked
                  ? '0 0 8px #ef4444'
                  : isProcessing
                    ? '0 0 8px #2563eb'
                    : 'none',
            }}
          />
          <span className="text-xs uppercase" style={{ color: '#555', letterSpacing: '0.12em', fontSize: '10px' }}>
            {status === 'idle' && 'SYSTEM READY — AWAITING OPERATOR INPUT'}
            {status === 'challenging' && 'GENERATING CHALLENGE TOKEN…'}
            {status === 'broadcasting' && 'ULTRASONIC BROADCAST ACTIVE'}
            {status === 'verifying' && 'AWAITING PRESENCE RESPONSE…'}
            {status === 'approved' && 'TRANSACTION AUTHORISED — SETTLEMENT CLEARED'}
            {status === 'blocked' && 'TRANSACTION BLOCKED — ALERT LOGGED'}
          </span>
        </div>
        <span className="text-xs" style={{ color: '#2a2a2a', letterSpacing: '0.1em', fontSize: '9px' }}>
          PRESENCE PROTOCOL v1.0 ── ENCRYPTED CHANNEL ── AES-256-GCM
        </span>
      </footer>

      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes fadeInCell {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>
    </main>
  );
}
