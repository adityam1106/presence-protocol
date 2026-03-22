'use client';

import { useEffect, useState, useRef } from 'react';
import NavBar from '../components/NavBar';
import { useLanguage } from '@/context/LanguageContext';

// ─── Constants ───────────────────────────────────────────────────────────────

const VERIFICATION_TIME = new Date().toISOString();
const SESSION_ID = 'a7c3e9f1-4b2d-8e6a-0f5c-3d9b7e1a2c4f';

// Shield SVG geometry
const SHIELD_PATH =
  'M60 8 L12 30 L12 60 C12 92 32 120 60 130 C88 120 108 92 108 60 L108 30 Z';
const PATH_LENGTH = 340;
const CHECK_PATH = 'M38 65 L52 80 L82 48';
const CHECK_LENGTH = 70;

// ─── Component ───────────────────────────────────────────────────────────────

export default function HandshakePage() {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<
    'drawing' | 'locking' | 'revealed' | 'complete'
  >('drawing');
  const [strokeProgress, setStrokeProgress] = useState(0);
  const [showText, setShowText] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [lockFlash, setLockFlash] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  // Shield stroke animation — 2 seconds with heavy cubic-bezier easing
  useEffect(() => {
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const duration = 2000;
      const progress = Math.min(elapsed / duration, 1);

      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setStrokeProgress(eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setPhase('locking');

        setTimeout(() => {
          setLockFlash(true);
          setTimeout(() => setLockFlash(false), 200);
          setPhase('revealed');
        }, 300);

        setTimeout(() => setShowText(true), 700);
        setTimeout(() => setShowDetails(true), 1200);
        setTimeout(() => {
          setShowFooter(true);
          setPhase('complete');
        }, 1800);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const formattedTime = new Date(VERIFICATION_TIME).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <main
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background: '#080808',
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      }}
    >
      <NavBar />

      {/* Font import */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Inter:wght@100;200;300;400&display=swap"
        rel="stylesheet"
      />

      {/* ── Lock flash ── */}
      <div
        className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-200"
        style={{
          background: 'radial-gradient(circle at center, rgba(37,99,235,0.15) 0%, transparent 70%)',
          opacity: lockFlash ? 1 : 0,
        }}
      />

      {/* ── Subtle grid background ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(37,99,235,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Scan line ── */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-10"
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.06), transparent)',
          animation: 'scanMove 8s linear infinite',
        }}
      />

      {/* ═══ CENTER CONTENT ═══ */}
      <div className="flex flex-col items-center z-20 px-6 w-full" style={{ maxWidth: 600 }}>

        {/* ── SHIELD SVG ── */}
        <div className="relative flex items-center justify-center mb-12" style={{ width: 160, height: 180 }}>
          <div
            className="absolute transition-all duration-600"
            style={{
              width: 220,
              height: 220,
              background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
              opacity: phase === 'drawing' ? strokeProgress * 0.5 : 0.7,
              transform: lockFlash ? 'scale(2)' : 'scale(1)',
              transition: 'opacity 0.6s ease, transform 0.3s ease',
              zIndex: 1,
            }}
          />

          <svg
            width="120"
            height="138"
            viewBox="0 0 120 138"
            fill="none"
            className="relative z-10"
          >
            <path
              d={SHIELD_PATH}
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
              style={{
                strokeDasharray: PATH_LENGTH,
                strokeDashoffset: PATH_LENGTH * (1 - strokeProgress),
                filter: 'drop-shadow(0 0 14px rgba(37,99,235,0.5))',
              }}
            />
            <path
              d={SHIELD_PATH}
              fill="rgba(37,99,235,0.03)"
              stroke="none"
              className="transition-opacity duration-600"
              style={{ opacity: phase === 'drawing' ? 0 : 1 }}
            />
            <path
              d={CHECK_PATH}
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
              style={{
                strokeDasharray: CHECK_LENGTH,
                strokeDashoffset:
                  phase === 'drawing' || phase === 'locking'
                    ? CHECK_LENGTH
                    : 0,
                transition: 'stroke-dashoffset 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s',
                filter: 'drop-shadow(0 0 10px rgba(37,99,235,0.6))',
              }}
            />
          </svg>

          {/* Corner brackets */}
          <div
            className="absolute pointer-events-none transition-opacity duration-600"
            style={{ inset: -12, opacity: showText ? 1 : 0 }}
          >
            <span className="absolute" style={{ top: -8, left: -8, width: 16, height: 16, borderTop: '1px solid rgba(37,99,235,0.25)', borderLeft: '1px solid rgba(37,99,235,0.25)' }} />
            <span className="absolute" style={{ top: -8, right: -8, width: 16, height: 16, borderTop: '1px solid rgba(37,99,235,0.25)', borderRight: '1px solid rgba(37,99,235,0.25)' }} />
            <span className="absolute" style={{ bottom: -8, left: -8, width: 16, height: 16, borderBottom: '1px solid rgba(37,99,235,0.25)', borderLeft: '1px solid rgba(37,99,235,0.25)' }} />
            <span className="absolute" style={{ bottom: -8, right: -8, width: 16, height: 16, borderBottom: '1px solid rgba(37,99,235,0.25)', borderRight: '1px solid rgba(37,99,235,0.25)' }} />
          </div>
        </div>

        {/* ── PRESENCE VERIFIED ── */}
        <h1
          className="text-center mb-5 transition-all duration-800"
          style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 100,
            letterSpacing: '0.35em',
            color: '#ffffff',
            textTransform: 'uppercase',
            fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
            opacity: showText ? 1 : 0,
            transform: showText ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {t('handshake.title')}
        </h1>

        <p
          className="text-center mb-10 transition-all duration-800"
          style={{
            fontSize: '12px',
            color: '#555',
            letterSpacing: '0.04em',
            lineHeight: '1.8',
            maxWidth: 480,
            fontFamily: "'IBM Plex Mono', monospace",
            opacity: showText ? 1 : 0,
            transform: showText ? 'translateY(0)' : 'translateY(14px)',
            transitionDelay: '0.15s',
          }}
        >
          {t('handshake.subtitle')}
        </p>

        {/* ── Divider ── */}
        <div
          className="mb-8 transition-all duration-600"
          style={{
            width: 120,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.3), transparent)',
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'center',
          }}
        />

        {/* ── Session ID ── */}
        <div
          className="flex flex-col items-center gap-1.5 mb-5 transition-all duration-600"
          style={{
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <span
            className="text-xs uppercase font-medium"
            style={{ fontSize: '9px', letterSpacing: '0.2em', color: '#444', fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {t('handshake.session')}
          </span>
          <span
            className="font-medium session-glow"
            style={{
              fontSize: '14px',
              color: '#2563eb',
              letterSpacing: '0.06em',
              fontFamily: "'IBM Plex Mono', monospace",
              textShadow: '0 0 20px rgba(37,99,235,0.3)',
            }}
          >
            {SESSION_ID}
          </span>
        </div>

        {/* ── Timestamp ── */}
        <div
          className="flex flex-col items-center gap-1.5 mb-5 transition-all duration-600"
          style={{
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'translateY(0)' : 'translateY(10px)',
            transitionDelay: '0.1s',
          }}
        >
          <span
            className="text-xs uppercase font-medium"
            style={{ fontSize: '9px', letterSpacing: '0.2em', color: '#444', fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {t('handshake.verified_at')}
          </span>
          <span
            className="font-light"
            style={{ fontSize: '13px', color: '#777', letterSpacing: '0.05em', fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {formattedTime}
          </span>
        </div>

        {/* ── Anti-deepfake notice ── */}
        <p
          className="text-center transition-all duration-800"
          style={{
            fontSize: '10px',
            letterSpacing: '0.08em',
            color: '#333',
            maxWidth: 440,
            lineHeight: '1.7',
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid #151515',
            fontFamily: "'IBM Plex Mono', monospace",
            opacity: showFooter ? 1 : 0,
            transform: showFooter ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          {t('handshake.antideepfake')}
        </p>
      </div>

      {/* ═══ BOTTOM PROTOCOL BAR ═══ */}
      <footer
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3 border-t z-20 transition-opacity duration-800"
        style={{
          borderColor: '#141414',
          background: '#080808',
          opacity: showFooter ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5" style={{ background: '#2563eb', boxShadow: '0 0 10px rgba(37,99,235,0.5)' }} />
          <span
            className="text-xs uppercase font-medium"
            style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#444', fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {t('handshake.protocol_sealed')}
          </span>
        </div>
        <span
          className="text-xs"
          style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#222', fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {t('handshake.footer')}
        </span>
      </footer>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes scanMove {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .session-glow {
          animation: subtlePulse 3s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
