'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import BankPanel from './BankPanel';
import PhonePanel from './PhonePanel';
import HandshakePanel from './HandshakePanel';

type BankStage = 'idle' | 'processing' | 'approved';
type PhonePhase = 'inactive' | 'received' | 'signing' | 'transmitted';

const DEMO_DURATION = 8000;

const PANEL_LABELS = ['BANK TERMINAL', 'MOBILE DEVICE', 'VERIFICATION SYSTEM'] as const;

export default function DemoPage() {
  const [bankStage,       setBankStage]       = useState<BankStage>('idle');
  const [phonePhase,      setPhonePhase]      = useState<PhonePhase>('inactive');
  const [handshakeActive, setHandshakeActive] = useState(false);
  const [progressKey,     setProgressKey]     = useState(0);
  const [handshakeKey,    setHandshakeKey]    = useState(0);
  const [isRunning,       setIsRunning]       = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const startDemo = useCallback(() => {
    clearAllTimeouts();

    // Reset all panel state
    setBankStage('idle');
    setPhonePhase('inactive');
    setHandshakeActive(false);
    setIsRunning(true);
    setProgressKey((k) => k + 1);
    setHandshakeKey((k) => k + 1);

    const t = (ms: number, fn: () => void) => {
      const id = setTimeout(fn, ms);
      timeoutsRef.current.push(id);
    };

    // T+0s — bank terminal activates, starts broadcasting
    t(0, () => setBankStage('processing'));

    // T+2s — phone panel activates, challenge received
    t(2000, () => setPhonePhase('received'));

    // T+4s — phone: signing with secure enclave
    t(4000, () => setPhonePhase('signing'));

    // T+6s — phone: presence transmitted; handshake shield begins drawing
    t(6000, () => {
      setPhonePhase('transmitted');
      setHandshakeActive(true);
    });

    // T+8s — bank shows TRANSACTION AUTHORISED; all panels in final state
    t(8000, () => {
      setBankStage('approved');
      setIsRunning(false);
    });
  }, [clearAllTimeouts]);

  // Auto-start on first mount
  useEffect(() => {
    startDemo();
    return clearAllTimeouts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: '#080808', fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Inter:wght@100;200;300;400&display=swap"
        rel="stylesheet"
      />

      {/* ══ Progress bar ══ */}
      <div className="w-full shrink-0" style={{ height: 2, background: '#111' }}>
        <div
          key={progressKey}
          style={{
            height: '100%',
            width: '0%',
            background: '#2563eb',
            boxShadow: '0 0 8px rgba(37,99,235,0.7)',
            animation: isRunning
              ? `demoProgress ${DEMO_DURATION}ms linear forwards`
              : undefined,
          }}
        />
      </div>

      {/* ══ Header ══ */}
      <header
        className="flex items-center justify-between px-6 py-3 border-b shrink-0"
        style={{ borderColor: '#1a1a1a', background: '#080808' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-1.5 h-1.5 shrink-0"
            style={{ background: '#2563eb', boxShadow: '0 0 8px rgba(37,99,235,0.8)' }}
          />
          <span
            className="font-semibold uppercase"
            style={{ color: '#2563eb', letterSpacing: '0.2em', fontSize: '11px' }}
          >
            PRESENCE PROTOCOL — LIVE SYSTEM DEMONSTRATION
          </span>
        </div>
        <Link
          href="/"
          style={{
            color: '#444',
            letterSpacing: '0.12em',
            fontSize: '9px',
            textDecoration: 'none',
          }}
        >
          ← BACK
        </Link>
      </header>

      {/* ══ Panel area ══ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Label row */}
        <div className="grid grid-cols-3 shrink-0 border-b" style={{ borderColor: '#1a1a1a' }}>
          {PANEL_LABELS.map((label, i) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2"
              style={{ borderRight: i < 2 ? '1px solid #1a1a1a' : 'none' }}
            >
              <div className="w-1 h-1 shrink-0" style={{ background: '#2563eb', opacity: 0.4 }} />
              <span style={{ color: '#555', letterSpacing: '0.18em', fontSize: '8px' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Three-panel grid */}
        <div className="flex-1 grid grid-cols-3 overflow-hidden">
          <div className="overflow-hidden" style={{ borderRight: '1px solid #2563eb' }}>
            <BankPanel stage={bankStage} />
          </div>
          <div className="overflow-hidden" style={{ borderRight: '1px solid #2563eb' }}>
            <PhonePanel phase={phonePhase} />
          </div>
          <div className="overflow-hidden">
            <HandshakePanel key={handshakeKey} active={handshakeActive} />
          </div>
        </div>
      </div>

      {/* ══ Footer ══ */}
      <div
        className="flex flex-col items-center gap-3 px-6 py-6 border-t shrink-0"
        style={{ borderColor: '#1a1a1a', background: '#080808' }}
      >
        <button
          onClick={startDemo}
          className="flex items-center gap-3 px-10 py-3 cursor-pointer border-none"
          style={{
            background: '#2563eb',
            color: '#e0e0e0',
            letterSpacing: '0.15em',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            fontWeight: 600,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
        >
          <span style={{ fontSize: '8px' }}>▶</span>
          REPLAY DEMONSTRATION
        </button>
        <p
          style={{
            color: '#333',
            fontSize: '9px',
            letterSpacing: '0.06em',
            textAlign: 'center',
            lineHeight: '1.7',
          }}
        >
          Simulation demonstrates cryptographic challenge-response flow. Ultrasonic transport layer simulated in software.
        </p>
      </div>

      <style>{`
        @keyframes demoProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </main>
  );
}
