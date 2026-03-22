'use client';

import { useEffect, useState, useRef } from 'react';
import NavBar from '../components/NavBar';

// ─── Constants ───────────────────────────────────────────────────────────────

const VERIFICATION_TIME = '2026-03-22T03:16:48.000Z';
const SESSION_ID = 'a7c3e9f1-4b2d-8e6a-0f5c-3d9b7e1a2c4f';

// ─── Component ───────────────────────────────────────────────────────────────

export default function HandshakePage() {
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

  // Shield stroke animation — 2.4 seconds
  useEffect(() => {
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const duration = 2400;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: cubic-bezier approximation — slow start, heavy finish
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setStrokeProgress(eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Shield fully drawn → vault lock phase
        setPhase('locking');

        // Flash effect — vault slams shut
        setTimeout(() => {
          setLockFlash(true);
          setTimeout(() => setLockFlash(false), 200);
          setPhase('revealed');
        }, 300);

        // Staggered reveals
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

  // Shield SVG path total length (measured)
  const SHIELD_PATH =
    'M60 8 L12 30 L12 60 C12 92 32 120 60 130 C88 120 108 92 108 60 L108 30 Z';
  const PATH_LENGTH = 340;

  // Checkmark inside shield
  const CHECK_PATH = 'M38 65 L52 80 L82 48';
  const CHECK_LENGTH = 70;

  return (
    <main style={styles.main}>
      <NavBar />
      {/* ── Font import ── */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Inter:wght@200;300;400&display=swap"
        rel="stylesheet"
      />

      {/* ── Lock flash overlay ── */}
      <div
        style={{
          ...styles.flashOverlay,
          opacity: lockFlash ? 1 : 0,
        }}
      />

      {/* ── Subtle grid background ── */}
      <div style={styles.gridBg} />

      {/* ── Scan line effect ── */}
      <div style={styles.scanLine} />

      {/* ── Center content ── */}
      <div style={styles.centerColumn}>
        {/* ── Shield icon ── */}
        <div style={styles.shieldContainer}>
          {/* Glow behind shield */}
          <div
            style={{
              ...styles.shieldGlow,
              opacity: phase === 'drawing' ? strokeProgress * 0.4 : 0.6,
              transform: lockFlash ? 'scale(1.8)' : 'scale(1)',
            }}
          />

          <svg
            width="120"
            height="138"
            viewBox="0 0 120 138"
            fill="none"
            style={{ position: 'relative', zIndex: 2 }}
          >
            {/* Shield outline — stroke draws in */}
            <path
              d={SHIELD_PATH}
              stroke="#00a8ff"
              strokeWidth="2.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
              style={{
                strokeDasharray: PATH_LENGTH,
                strokeDashoffset: PATH_LENGTH * (1 - strokeProgress),
                filter: 'drop-shadow(0 0 12px rgba(0,168,255,0.6))',
                transition: 'filter 0.3s ease',
              }}
            />

            {/* Shield fill — fades in after lock */}
            <path
              d={SHIELD_PATH}
              fill="rgba(0,168,255,0.04)"
              stroke="none"
              style={{
                opacity: phase === 'drawing' ? 0 : 1,
                transition: 'opacity 0.6s ease',
              }}
            />

            {/* Checkmark — draws after shield */}
            <path
              d={CHECK_PATH}
              stroke="#00a8ff"
              strokeWidth="3.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
              style={{
                strokeDasharray: CHECK_LENGTH,
                strokeDashoffset:
                  phase === 'drawing' || phase === 'locking'
                    ? CHECK_LENGTH
                    : 0,
                transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.15s',
                filter: 'drop-shadow(0 0 8px rgba(0,168,255,0.5))',
              }}
            />
          </svg>

          {/* Corner brackets — appear after lock */}
          <div
            style={{
              ...styles.cornerBrackets,
              opacity: showText ? 1 : 0,
            }}
          >
            <span style={{ ...styles.corner, top: -8, left: -8 }} />
            <span
              style={{
                ...styles.corner,
                top: -8,
                right: -8,
                borderLeft: 'none',
                borderRight: '1px solid rgba(0,168,255,0.3)',
              }}
            />
            <span
              style={{
                ...styles.corner,
                bottom: -8,
                left: -8,
                borderTop: 'none',
                borderBottom: '1px solid rgba(0,168,255,0.3)',
              }}
            />
            <span
              style={{
                ...styles.corner,
                bottom: -8,
                right: -8,
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: '1px solid rgba(0,168,255,0.3)',
                borderBottom: '1px solid rgba(0,168,255,0.3)',
              }}
            />
          </div>
        </div>

        {/* ── PRESENCE VERIFIED ── */}
        <h1
          style={{
            ...styles.title,
            opacity: showText ? 1 : 0,
            transform: showText ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          PRESENCE VERIFIED
        </h1>

        {/* ── Subtitle ── */}
        <p
          style={{
            ...styles.subtitle,
            opacity: showText ? 1 : 0,
            transform: showText ? 'translateY(0)' : 'translateY(12px)',
            transitionDelay: '0.15s',
          }}
        >
          Physical presence confirmed via ultrasonic handshake — Transaction
          authorised
        </p>

        {/* ── Divider ── */}
        <div
          style={{
            ...styles.divider,
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'scaleX(1)' : 'scaleX(0)',
          }}
        />

        {/* ── Timestamp ── */}
        <div
          style={{
            ...styles.detailRow,
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <span style={styles.detailLabel}>VERIFIED AT</span>
          <span style={styles.detailValue}>{formattedTime}</span>
        </div>

        {/* ── Session ID ── */}
        <div
          style={{
            ...styles.detailRow,
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'translateY(0)' : 'translateY(10px)',
            transitionDelay: '0.1s',
          }}
        >
          <span style={styles.detailLabel}>SESSION</span>
          <span style={styles.sessionId}>{SESSION_ID}</span>
        </div>

        {/* ── Anti-deepfake notice ── */}
        <p
          style={{
            ...styles.antiDeepfake,
            opacity: showFooter ? 1 : 0,
            transform: showFooter ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          This verification cannot be replicated by voice cloning or deepfake
          technology
        </p>
      </div>

      {/* ── Bottom protocol bar ── */}
      <footer
        style={{
          ...styles.footer,
          opacity: showFooter ? 1 : 0,
        }}
      >
        <div style={styles.footerLeft}>
          <div style={styles.footerDot} />
          <span style={styles.footerLabel}>PROTOCOL SEALED</span>
        </div>
        <span style={styles.footerRight}>
          PRESENCE PROTOCOL v1.0 — IMMUTABLE RECORD
        </span>
      </footer>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes scanMove {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </main>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  main: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    background: '#060608',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
  },

  // Flash overlay — vault slam
  flashOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(circle at center, rgba(0,168,255,0.15) 0%, transparent 70%)',
    pointerEvents: 'none' as const,
    zIndex: 100,
    transition: 'opacity 0.2s ease',
  },

  // Background grid
  gridBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(0,168,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,168,255,0.03) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
    pointerEvents: 'none' as const,
  },

  // Scan line
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(0,168,255,0.08), transparent)',
    animation: 'scanMove 8s linear infinite',
    pointerEvents: 'none' as const,
    zIndex: 10,
  },

  // Center column
  centerColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    zIndex: 20,
    padding: '0 24px',
    maxWidth: 600,
    width: '100%',
  },

  // Shield
  shieldContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 180,
    marginBottom: 48,
  },

  shieldGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    background: 'radial-gradient(circle, rgba(0,168,255,0.2) 0%, transparent 70%)',
    transition: 'opacity 0.6s ease, transform 0.3s ease',
    zIndex: 1,
  },

  // Corner brackets
  cornerBrackets: {
    position: 'absolute',
    inset: -12,
    transition: 'opacity 0.6s ease',
    pointerEvents: 'none' as const,
  },
  corner: {
    position: 'absolute' as const,
    width: 16,
    height: 16,
    borderTop: '1px solid rgba(0,168,255,0.3)',
    borderLeft: '1px solid rgba(0,168,255,0.3)',
  },

  // Title
  title: {
    fontSize: 32,
    fontWeight: 200,
    letterSpacing: '0.35em',
    color: '#ffffff',
    textTransform: 'uppercase' as const,
    fontFamily: "'Inter', sans-serif",
    marginBottom: 16,
    transition: 'opacity 0.8s ease, transform 0.8s ease',
    textAlign: 'center' as const,
  },

  // Subtitle
  subtitle: {
    fontSize: 13,
    fontWeight: 300,
    lineHeight: '1.8',
    color: '#6b7280',
    textAlign: 'center' as const,
    maxWidth: 480,
    marginBottom: 36,
    letterSpacing: '0.02em',
    transition: 'opacity 0.8s ease, transform 0.8s ease',
  },

  // Divider
  divider: {
    width: 120,
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(0,168,255,0.3), transparent)',
    marginBottom: 32,
    transition: 'opacity 0.6s ease, transform 0.6s ease',
    transformOrigin: 'center',
  },

  // Detail row
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    transition: 'opacity 0.6s ease, transform 0.6s ease',
  },

  detailLabel: {
    fontSize: 9,
    fontWeight: 500,
    letterSpacing: '0.2em',
    color: '#4b5563',
    fontFamily: "'IBM Plex Mono', monospace",
  },

  detailValue: {
    fontSize: 13,
    fontWeight: 300,
    color: '#9ca3af',
    letterSpacing: '0.05em',
    fontFamily: "'IBM Plex Mono', monospace",
  },

  // Session ID — electric blue monospace
  sessionId: {
    fontSize: 14,
    fontWeight: 500,
    color: '#00a8ff',
    letterSpacing: '0.06em',
    fontFamily: "'IBM Plex Mono', monospace",
    textShadow: '0 0 20px rgba(0,168,255,0.3)',
    animation: 'subtlePulse 3s ease-in-out infinite',
  },

  // Anti-deepfake footer text
  antiDeepfake: {
    fontSize: 10,
    fontWeight: 300,
    letterSpacing: '0.08em',
    color: '#374151',
    textAlign: 'center' as const,
    marginTop: 48,
    paddingTop: 24,
    borderTop: '1px solid #111318',
    maxWidth: 440,
    lineHeight: '1.6',
    transition: 'opacity 0.8s ease, transform 0.8s ease',
    fontFamily: "'IBM Plex Mono', monospace",
  },

  // Footer bar
  footer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    borderTop: '1px solid #0e0e14',
    background: '#060608',
    transition: 'opacity 0.8s ease',
    zIndex: 20,
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  footerDot: {
    width: 6,
    height: 6,
    background: '#00a8ff',
    boxShadow: '0 0 10px rgba(0,168,255,0.5)',
  },
  footerLabel: {
    fontSize: 10,
    letterSpacing: '0.12em',
    color: '#4b5563',
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 500,
  },
  footerRight: {
    fontSize: 9,
    letterSpacing: '0.1em',
    color: '#1f2937',
    fontFamily: "'IBM Plex Mono', monospace",
  },
};
