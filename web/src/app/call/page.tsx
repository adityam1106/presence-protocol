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

// ─── Helper ──────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Split a hex token into a grid of 2-char pairs */
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

      // Phase 1: Request challenge
      setStatus('challenging');
      const res = await fetch(`${API}/api/challenge`, { method: 'POST' });
      const json = await res.json();

      if (!json.success) throw new Error(json.error || 'Challenge request failed');

      setChallenge(json.data);
      setStatus('broadcasting');

      // Phase 2: Simulate broadcast — wait 3 seconds
      await delay(3000);

      // Phase 3: Verify
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
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0a0c',
        color: '#c8ccd0',
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 48,
      }}
    >
      <NavBar />
      {/* ── Google Font import ── */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ── Top nav bar ── */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerDot} />
          <span style={styles.headerLabel}>MERIDIAN BANK</span>
          <span style={styles.headerDivider}>|</span>
          <span style={styles.headerSub}>TRANSACTION SECURITY DESK</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.headerTime}>
            {new Date().toLocaleTimeString('en-GB', { hour12: false })}
          </span>
          <span style={styles.headerDivider}>|</span>
          <span style={styles.headerAgent}>AGENT: TXN-0042</span>
        </div>
      </header>

      {/* ── Main content ── */}
      <div style={styles.content}>
        {/* ── Left: Transaction Details ── */}
        <section style={styles.txCard}>
          <div style={styles.txCardHeader}>
            <span style={styles.txCardHeaderDot} />
            TRANSACTION DETAILS
          </div>

          <div style={styles.txCardBody}>
            <div style={styles.txRow}>
              <span style={styles.txLabel}>Type</span>
              <span style={styles.txValue}>WIRE TRANSFER — HIGH VALUE</span>
            </div>
            <div style={styles.txDivider} />
            <div style={styles.txRow}>
              <span style={styles.txLabel}>Amount</span>
              <span style={{ ...styles.txValue, color: '#f0f0f0', fontSize: 18, fontWeight: 700 }}>
                €50,000.00
              </span>
            </div>
            <div style={styles.txDivider} />
            <div style={styles.txRow}>
              <span style={styles.txLabel}>Recipient IBAN</span>
              <span style={{ ...styles.txValue, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em' }}>
                DE89 3704 0044 0532 0130 00
              </span>
            </div>
            <div style={styles.txDivider} />
            <div style={styles.txRow}>
              <span style={styles.txLabel}>Recipient</span>
              <span style={styles.txValue}>SCHMIDT INDUSTRIES GMBH</span>
            </div>
            <div style={styles.txDivider} />
            <div style={styles.txRow}>
              <span style={styles.txLabel}>Reference</span>
              <span style={styles.txValue}>INV-2026-03847</span>
            </div>
            <div style={styles.txDivider} />
            <div style={styles.txRow}>
              <span style={styles.txLabel}>Risk Level</span>
              <span style={styles.txRiskBadge}>HIGH</span>
            </div>
          </div>

          {/* ── Regulation notice ── */}
          <div style={styles.regNotice}>
            <span style={styles.regIcon}>⚠</span>
            Per EU PSD3 Art. 97 — transactions exceeding €10,000 require physical
            presence verification of the authorizing party.
          </div>
        </section>

        {/* ── Right: Verification Panel ── */}
        <section style={styles.verifyPanel}>
          <div style={styles.verifyHeader}>
            <span style={styles.txCardHeaderDot} />
            PRESENCE VERIFICATION
          </div>

          <div style={styles.verifyBody}>
            {/* ── Idle state ── */}
            {status === 'idle' && (
              <div style={styles.idleContainer}>
                <div style={styles.shieldIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
                    <path d="M12 2L3 7v5c0 5.25 3.83 10.15 9 11.25C17.17 22.15 21 17.25 21 12V7l-9-5z" />
                  </svg>
                </div>
                <p style={styles.idleText}>
                  Initiate physical presence verification to authorize this transaction.
                  The system will broadcast an ultrasonic challenge token.
                </p>
                <button onClick={initiateVerification} style={styles.initiateBtn}>
                  <span style={styles.initiateBtnIcon}>▶</span>
                  INITIATE PRESENCE VERIFICATION
                </button>
              </div>
            )}

            {/* ── Processing states ── */}
            {isProcessing && challenge && (
              <div style={styles.processingContainer}>
                {/* Status line */}
                <div style={styles.statusRow}>
                  <div style={styles.pulsingDot} />
                  <span style={styles.statusText}>
                    {status === 'challenging' && 'Requesting challenge token…'}
                    {status === 'broadcasting' && 'Broadcasting presence challenge…'}
                    {status === 'verifying' && 'Verifying presence response…'}
                  </span>
                </div>

                {/* Token grid */}
                <div style={styles.tokenSection}>
                  <div style={styles.tokenLabel}>CHALLENGE TOKEN</div>
                  <div style={styles.tokenGrid}>
                    {tokenToGrid(challenge.token).map((hex, i) => (
                      <span
                        key={i}
                        style={{
                          ...styles.tokenCell,
                          animationDelay: `${i * 30}ms`,
                        }}
                      >
                        {hex}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Session info */}
                <div style={styles.sessionRow}>
                  <span style={styles.sessionLabel}>SESSION</span>
                  <span style={styles.sessionValue}>{challenge.sessionId}</span>
                </div>
              </div>
            )}

            {isProcessing && !challenge && (
              <div style={styles.processingContainer}>
                <div style={styles.statusRow}>
                  <div style={styles.pulsingDot} />
                  <span style={styles.statusText}>Requesting challenge token…</span>
                </div>
              </div>
            )}

            {/* ── Approved ── */}
            {isApproved && (
              <div style={styles.resultContainer}>
                <div style={styles.resultIconWrapApproved}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div style={styles.resultTitleApproved}>
                  Physical Presence Confirmed — Transaction Approved
                </div>
                <div style={styles.resultMeta}>
                  <span>Session: {challenge?.sessionId.slice(0, 12)}…</span>
                  <span>Verified at: {timestamp}</span>
                </div>
                <div style={{ fontSize: 10, color: '#4b5563', letterSpacing: '0.1em', marginTop: 4 }}>
                  Redirecting to handshake confirmation…
                </div>
                <button onClick={() => { setStatus('idle'); setChallenge(null); }} style={styles.resetBtn}>
                  NEW VERIFICATION
                </button>
              </div>
            )}

            {/* ── Blocked ── */}
            {isBlocked && (
              <div style={styles.resultContainer}>
                <div style={styles.resultIconWrapBlocked}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div style={styles.resultTitleBlocked}>
                  Presence Verification Failed — Transaction Blocked
                </div>
                {error && (
                  <div style={styles.errorDetail}>
                    {error}
                  </div>
                )}
                <div style={styles.resultMeta}>
                  <span>Attempted at: {timestamp}</span>
                </div>
                <button onClick={() => { setStatus('idle'); setChallenge(null); setError(null); }} style={styles.resetBtn}>
                  RETRY VERIFICATION
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Bottom status bar ── */}
      <footer style={styles.footer}>
        <div style={styles.footerLeft}>
          <div
            style={{
              ...styles.footerDot,
              background: isApproved ? '#22c55e' : isBlocked ? '#ef4444' : isProcessing ? '#3b82f6' : '#4b5563',
              boxShadow: isApproved
                ? '0 0 8px #22c55e'
                : isBlocked
                  ? '0 0 8px #ef4444'
                  : isProcessing
                    ? '0 0 8px #3b82f6'
                    : 'none',
            }}
          />
          <span style={styles.footerLabel}>
            {status === 'idle' && 'SYSTEM READY'}
            {status === 'challenging' && 'GENERATING CHALLENGE…'}
            {status === 'broadcasting' && 'ULTRASONIC BROADCAST ACTIVE'}
            {status === 'verifying' && 'AWAITING PRESENCE RESPONSE…'}
            {status === 'approved' && 'TRANSACTION AUTHORIZED'}
            {status === 'blocked' && 'TRANSACTION BLOCKED'}
          </span>
        </div>
        <span style={styles.footerRight}>PRESENCE PROTOCOL v1.0 — SECURE CHANNEL</span>
      </footer>

      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes fadeInCell {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .token-cell {
          animation: fadeInCell 0.3s ease-out both;
        }
      `}</style>
    </main>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    borderBottom: '1px solid #1a1a1f',
    background: '#0c0c10',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  headerDot: {
    width: 8,
    height: 8,
    background: '#3b82f6',
    boxShadow: '0 0 10px rgba(59,130,246,0.5)',
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: '#e2e4e8',
  },
  headerDivider: {
    color: '#2a2a32',
    fontSize: 14,
  },
  headerSub: {
    fontSize: 10,
    letterSpacing: '0.12em',
    color: '#6b7280',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  headerTime: {
    fontSize: 11,
    color: '#6b7280',
    letterSpacing: '0.05em',
  },
  headerAgent: {
    fontSize: 10,
    color: '#4b5563',
    letterSpacing: '0.1em',
  },

  // Content
  content: {
    flex: 1,
    display: 'flex',
    gap: 0,
    overflow: 'hidden',
  },

  // Transaction Card
  txCard: {
    width: '40%',
    borderRight: '1px solid #1a1a1f',
    display: 'flex',
    flexDirection: 'column',
  },
  txCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 24px',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.12em',
    color: '#9ca3af',
    borderBottom: '1px solid #1a1a1f',
    background: '#0e0e12',
  },
  txCardHeaderDot: {
    display: 'inline-block',
    width: 6,
    height: 6,
    background: '#3b82f6',
  },
  txCardBody: {
    flex: 1,
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    overflowY: 'auto',
  },
  txRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
  },
  txLabel: {
    fontSize: 10,
    letterSpacing: '0.1em',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    flexShrink: 0,
  },
  txValue: {
    fontSize: 13,
    color: '#d1d5db',
    textAlign: 'right' as const,
  },
  txDivider: {
    height: 1,
    background: '#1a1a1f',
  },
  txRiskBadge: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: '#fbbf24',
    padding: '4px 12px',
    border: '1px solid rgba(251,191,36,0.3)',
    background: 'rgba(251,191,36,0.08)',
  },
  regNotice: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '16px 24px',
    fontSize: 10,
    lineHeight: '1.6',
    color: '#6b7280',
    borderTop: '1px solid #1a1a1f',
    background: '#0c0c0f',
  },
  regIcon: {
    fontSize: 14,
    color: '#f59e0b',
    flexShrink: 0,
    marginTop: -1,
  },

  // Verify panel
  verifyPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  verifyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 24px',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.12em',
    color: '#9ca3af',
    borderBottom: '1px solid #1a1a1f',
    background: '#0e0e12',
  },
  verifyBody: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },

  // Idle state
  idleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    maxWidth: 400,
    textAlign: 'center' as const,
  },
  shieldIcon: {
    opacity: 0.5,
  },
  idleText: {
    fontSize: 12,
    lineHeight: '1.7',
    color: '#6b7280',
  },
  initiateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 32px',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.12em',
    color: '#e2e4e8',
    background: '#3b82f6',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'IBM Plex Mono', monospace",
    transition: 'all 0.15s ease',
  },
  initiateBtnIcon: {
    fontSize: 10,
  },

  // Processing state
  processingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 28,
    width: '100%',
    maxWidth: 480,
    animation: 'fadeInUp 0.4s ease-out',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    background: '#3b82f6',
    boxShadow: '0 0 12px rgba(59,130,246,0.6)',
    animation: 'pulse-dot 1.2s ease-in-out infinite',
  },
  statusText: {
    fontSize: 12,
    letterSpacing: '0.08em',
    color: '#60a5fa',
    fontWeight: 500,
  },
  tokenSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  tokenLabel: {
    fontSize: 9,
    letterSpacing: '0.2em',
    color: '#4b5563',
  },
  tokenGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: 3,
    padding: 16,
    background: '#06060a',
    border: '1px solid #1a1a2e',
    width: '100%',
  },
  tokenCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: '#3b82f6',
    padding: '8px 0',
    background: 'rgba(59,130,246,0.04)',
    border: '1px solid rgba(59,130,246,0.1)',
    fontFamily: "'IBM Plex Mono', monospace",
    textTransform: 'uppercase' as const,
    textShadow: '0 0 8px rgba(59,130,246,0.4)',
    animation: 'fadeInCell 0.3s ease-out both',
  },
  sessionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  sessionLabel: {
    fontSize: 9,
    letterSpacing: '0.15em',
    color: '#4b5563',
  },
  sessionValue: {
    fontSize: 10,
    color: '#6b7280',
    fontFamily: "'IBM Plex Mono', monospace",
  },

  // Results
  resultContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    maxWidth: 440,
    textAlign: 'center' as const,
    animation: 'fadeInUp 0.5s ease-out',
  },
  resultIconWrapApproved: {
    width: 72,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(34,197,94,0.3)',
    background: 'rgba(34,197,94,0.06)',
    boxShadow: '0 0 40px rgba(34,197,94,0.15)',
  },
  resultIconWrapBlocked: {
    width: 72,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(239,68,68,0.3)',
    background: 'rgba(239,68,68,0.06)',
    boxShadow: '0 0 40px rgba(239,68,68,0.15)',
  },
  resultTitleApproved: {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: '#22c55e',
    lineHeight: '1.5',
  },
  resultTitleBlocked: {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: '#ef4444',
    lineHeight: '1.5',
  },
  resultMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 10,
    color: '#4b5563',
  },
  errorDetail: {
    fontSize: 11,
    color: '#f87171',
    padding: '8px 16px',
    border: '1px solid rgba(239,68,68,0.2)',
    background: 'rgba(239,68,68,0.05)',
  },
  resetBtn: {
    marginTop: 8,
    padding: '10px 24px',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: '#9ca3af',
    background: 'transparent',
    border: '1px solid #2a2a32',
    cursor: 'pointer',
    fontFamily: "'IBM Plex Mono', monospace",
    transition: 'all 0.15s ease',
  },

  // Footer
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 24px',
    borderTop: '1px solid #1a1a1f',
    background: '#0c0c10',
    flexShrink: 0,
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  footerDot: {
    width: 6,
    height: 6,
  },
  footerLabel: {
    fontSize: 10,
    letterSpacing: '0.12em',
    color: '#6b7280',
  },
  footerRight: {
    fontSize: 9,
    letterSpacing: '0.1em',
    color: '#374151',
  },
};
