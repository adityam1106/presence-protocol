'use client';

import { useEffect, useState, useRef } from 'react';

const SHIELD_PATH =
  'M60 8 L12 30 L12 60 C12 92 32 120 60 130 C88 120 108 92 108 60 L108 30 Z';
const PATH_LENGTH  = 340;
const CHECK_PATH   = 'M38 65 L52 80 L82 48';
const CHECK_LENGTH = 70;

export default function HandshakePanel({ active }: { active: boolean }) {
  const [phase, setPhase] = useState<'idle' | 'drawing' | 'locking' | 'revealed' | 'complete'>('idle');
  const [strokeProgress, setStrokeProgress] = useState(0);
  const [showText,    setShowText]    = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [lockFlash,   setLockFlash]   = useState(false);
  const rafRef   = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    setPhase('drawing');
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed  = now - startRef.current;
      const duration = 2000;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic-bezier easing — heavy slam finish
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
        setTimeout(() => {
          setShowDetails(true);
          setPhase('complete');
        }, 1200);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  const isIdle = phase === 'idle';

  return (
    <div
      className="relative flex flex-col items-center justify-center h-full overflow-hidden"
      style={{ background: '#080808', fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(37,99,235,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Lock-flash overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-200"
        style={{
          background: 'radial-gradient(circle at center, rgba(37,99,235,0.15) 0%, transparent 70%)',
          opacity: lockFlash ? 1 : 0,
        }}
      />

      {/* Content */}
      <div className="flex flex-col items-center z-20 px-4 w-full" style={{ maxWidth: 380 }}>

        {/* Shield SVG */}
        <div className="relative flex items-center justify-center mb-8" style={{ width: 120, height: 138 }}>
          {/* Glow halo */}
          <div
            className="absolute"
            style={{
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
              opacity: isIdle ? 0 : phase === 'drawing' ? strokeProgress * 0.5 : 0.7,
              transition: 'opacity 0.6s ease',
              transform: lockFlash ? 'scale(2)' : 'scale(1)',
            }}
          />

          <svg width="120" height="138" viewBox="0 0 120 138" fill="none" className="relative z-10">
            {/* Shield outline — strokes in via dashoffset */}
            <path
              d={SHIELD_PATH}
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
              style={{
                strokeDasharray:  PATH_LENGTH,
                strokeDashoffset: isIdle ? PATH_LENGTH : PATH_LENGTH * (1 - strokeProgress),
                filter: 'drop-shadow(0 0 12px rgba(37,99,235,0.5))',
              }}
            />
            {/* Shield fill — appears after lock */}
            <path
              d={SHIELD_PATH}
              fill="rgba(37,99,235,0.03)"
              stroke="none"
              style={{
                opacity: isIdle || phase === 'drawing' ? 0 : 1,
                transition: 'opacity 0.6s ease',
              }}
            />
            {/* Checkmark */}
            <path
              d={CHECK_PATH}
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
              style={{
                strokeDasharray:  CHECK_LENGTH,
                strokeDashoffset:
                  isIdle || phase === 'drawing' || phase === 'locking'
                    ? CHECK_LENGTH
                    : 0,
                transition: 'stroke-dashoffset 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s',
                filter: 'drop-shadow(0 0 8px rgba(37,99,235,0.6))',
              }}
            />
          </svg>
        </div>

        {/* Idle placeholder */}
        {isIdle && (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-1.5 h-1.5" style={{ background: '#2a2a2a' }} />
            <span style={{ color: '#2a2a2a', letterSpacing: '0.15em', fontSize: '9px' }}>
              AWAITING VERIFICATION SIGNAL
            </span>
          </div>
        )}

        {/* PRESENCE VERIFIED heading */}
        <h2
          className="text-center mb-3"
          style={{
            fontSize: 'clamp(14px, 2vw, 22px)',
            fontWeight: 100,
            letterSpacing: '0.3em',
            color: '#ffffff',
            fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
            opacity: showText ? 1 : 0,
            transform: showText ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
        >
          PRESENCE VERIFIED
        </h2>

        <p
          className="text-center mb-6"
          style={{
            fontSize: '9px',
            color: '#555',
            letterSpacing: '0.04em',
            lineHeight: '1.8',
            maxWidth: 300,
            opacity: showText ? 1 : 0,
            transform: showText ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s',
          }}
        >
          Physical presence confirmed via ultrasonic handshake
        </p>

        {/* Session detail */}
        {showDetails && (
          <div className="flex flex-col items-center gap-1.5 mb-3">
            <span style={{ fontSize: '7px', letterSpacing: '0.2em', color: '#444' }}>SESSION</span>
            <span
              className="font-medium"
              style={{
                fontSize: '11px',
                color: '#2563eb',
                letterSpacing: '0.06em',
                textShadow: '0 0 16px rgba(37,99,235,0.3)',
              }}
            >
              a7c3e9f1-4b2d-8e6a…
            </span>
          </div>
        )}

        {showDetails && (
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5"
              style={{ background: '#2563eb', boxShadow: '0 0 8px rgba(37,99,235,0.5)' }}
            />
            <span style={{ fontSize: '8px', color: '#444', letterSpacing: '0.1em' }}>
              PROTOCOL SEALED
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
