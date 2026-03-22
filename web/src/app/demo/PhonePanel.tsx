'use client';

type PhonePhase = 'inactive' | 'received' | 'signing' | 'transmitted';

const PHASE_TEXT: Record<Exclude<PhonePhase, 'inactive'>, string> = {
  received:    'CHALLENGE RECEIVED',
  signing:     'SIGNING WITH SECURE ENCLAVE…',
  transmitted: 'PRESENCE TRANSMITTED',
};

const DEMO_TOKEN = 'a3f7e2b8c1d94e6f0a1b2c3d4e5f6a7b';

export default function PhonePanel({ phase }: { phase: PhonePhase }) {
  const isInactive    = phase === 'inactive';
  const isActive      = phase === 'received' || phase === 'signing';
  const isTransmitted = phase === 'transmitted';

  const ringColor   = isTransmitted ? 'rgba(34,197,94,0.3)'  : 'rgba(37,99,235,0.35)';
  const accentColor = isTransmitted ? '#22c55e' : '#2563eb';
  const showCard    = phase === 'received' || phase === 'signing' || phase === 'transmitted';

  return (
    <div
      className="flex flex-col h-full items-center justify-center"
      style={{ background: '#080808', fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}
    >
      {/* Phone frame */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: 300,
          maxWidth: '95%',
          height: '88%',
          maxHeight: 620,
          background: '#080808',
          border: '1px solid #1a1a1a',
          opacity: isInactive ? 0.15 : 1,
          transition: 'opacity 0.8s ease',
        }}
      >
        {/* Fake status bar */}
        <div
          className="flex items-center justify-between px-5 pt-2.5 pb-2 shrink-0"
          style={{ background: '#080808' }}
        >
          <span className="font-semibold" style={{ color: '#e0e0e0', fontSize: '13px' }}>
            14:32
          </span>
          <div className="flex items-center gap-1.5">
            {/* Signal bars */}
            <svg width="14" height="10" viewBox="0 0 16 12" fill="none">
              <rect x="0" y="8" width="3" height="4"  fill="#e0e0e0" />
              <rect x="4" y="5" width="3" height="7"  fill="#e0e0e0" />
              <rect x="8" y="2" width="3" height="10" fill="#e0e0e0" />
              <rect x="12" y="0" width="3" height="12" fill="#e0e0e0" opacity="0.3" />
            </svg>
            {/* Battery */}
            <svg width="22" height="10" viewBox="0 0 26 12" fill="none">
              <rect x="0" y="0" width="22" height="12" rx="2" stroke="#e0e0e0" strokeWidth="1" fill="none" />
              <rect x="2" y="2" width="16" height="8" fill="#22c55e" />
              <rect x="23" y="3" width="3" height="6" rx="1" fill="#e0e0e0" opacity="0.4" />
            </svg>
          </div>
        </div>

        {/* Bank app header */}
        <div
          className="flex items-center justify-center gap-2 py-2.5 border-b shrink-0"
          style={{ borderColor: '#1a1a1a', background: '#0a0a0a' }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span
            className="font-semibold uppercase"
            style={{ color: '#c0c0c0', letterSpacing: '0.18em', fontSize: '10px' }}
          >
            FIRST NATIONAL BANK
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 relative overflow-hidden">

          {/* Sonar rings */}
          <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="absolute sonar-ring-demo"
                style={{
                  width: '100%',
                  height: '100%',
                  border: `1px solid ${
                    isActive
                      ? ringColor
                      : isTransmitted
                        ? 'rgba(34,197,94,0.15)'
                        : 'rgba(37,99,235,0.04)'
                  }`,
                  animationDelay: `${i * 0.5}s`,
                  animationPlayState: isActive ? 'running' : 'paused',
                  opacity: isActive ? 1 : 0.3,
                }}
              />
            ))}

            {/* Center icon */}
            <div
              className="relative z-10 flex items-center justify-center transition-all duration-700"
              style={{
                width: 52,
                height: 52,
                background:  isTransmitted ? 'rgba(34,197,94,0.08)' : 'rgba(37,99,235,0.08)',
                border:      `1px solid ${isTransmitted ? 'rgba(34,197,94,0.2)' : 'rgba(37,99,235,0.2)'}`,
                boxShadow:   `0 0 30px ${isTransmitted ? 'rgba(34,197,94,0.15)' : 'rgba(37,99,235,0.15)'}`,
              }}
            >
              {isTransmitted ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <path strokeLinecap="square" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg
                  width="22"
                  height="22"
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

          {/* Status text */}
          {!isInactive && (
            <div className="mt-5 flex items-center gap-2">
              {isActive && (
                <div
                  className="w-1 h-1 animate-pulse shrink-0"
                  style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
                />
              )}
              <span
                className="font-medium uppercase transition-colors duration-500"
                style={{ color: accentColor, letterSpacing: '0.1em', fontSize: '9px' }}
              >
                {PHASE_TEXT[phase as Exclude<PhonePhase, 'inactive'>]}
              </span>
            </div>
          )}

          {/* Token card */}
          {showCard && (
            <div
              className="w-full mt-4"
              style={{ border: '1px solid #1a1a1a', background: '#0a0a0a', maxWidth: 260 }}
            >
              <div
                className="px-3 py-1.5 border-b"
                style={{
                  borderColor: '#1a1a1a',
                  color: '#444',
                  letterSpacing: '0.15em',
                  fontSize: '7px',
                  background: '#0c0c0c',
                }}
              >
                SECURE ENCLAVE DATA
              </div>
              <div className="px-3 py-2.5">
                <div style={{ color: '#444', fontSize: '7px', letterSpacing: '0.12em', marginBottom: 4 }}>
                  TOKEN ID
                </div>
                <div
                  className="font-medium break-all"
                  style={{
                    color: '#2563eb',
                    fontSize: '9px',
                    textShadow: '0 0 8px rgba(37,99,235,0.3)',
                    letterSpacing: '0.04em',
                    lineHeight: '1.5',
                  }}
                >
                  {DEMO_TOKEN}…
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom label */}
        <div className="flex items-center justify-center py-3 shrink-0" style={{ background: '#080808' }}>
          <span className="uppercase text-center" style={{ color: '#2a2a2a', letterSpacing: '0.1em', fontSize: '7px' }}>
            ULTRASONIC PRESENCE TOKEN
          </span>
        </div>

        {/* Home indicator */}
        <div className="flex items-center justify-center pb-2 shrink-0" style={{ background: '#080808' }}>
          <div style={{ width: 90, height: 4, background: '#222', borderRadius: 2 }} />
        </div>
      </div>

      <style>{`
        .sonar-ring-demo {
          animation: sonarExpandDemo 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes sonarExpandDemo {
          0%   { transform: scale(0.2); opacity: 0.6; }
          80%  { opacity: 0.1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
