'use client';

import NavBar from './components/NavBar';

// ─── Step Cards Data ─────────────────────────────────────────────────────────

const STEPS = [
  {
    step: '01',
    title: 'PHONE',
    subtitle: 'Presence Emitter',
    description:
      'The user\'s phone listens for an ultrasonic challenge and responds with a presence token — proving the authorised person is physically present.',
    href: '/phone',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00a8ff" strokeWidth="1.2">
        <rect x="5" y="1" width="14" height="22" rx="0" />
        <line x1="9" y1="19" x2="15" y2="19" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'BANK TERMINAL',
    subtitle: 'Challenge Broadcaster',
    description:
      'The bank operator initiates a verification — the system emits an ultrasonic challenge token and awaits physical presence confirmation.',
    href: '/call',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00a8ff" strokeWidth="1.2">
        <rect x="2" y="3" width="20" height="14" rx="0" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'HANDSHAKE',
    subtitle: 'Verification Sealed',
    description:
      'Both parties see the same confirmation screen — presence verified, transaction authorised, unforgeable proof that resists voice cloning and deepfakes.',
    href: '/handshake',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00a8ff" strokeWidth="1.2">
        <path d="M12 2L3 7v5c0 5.25 3.83 10.15 9 11.25C17.17 22.15 21 17.25 21 12V7l-9-5z" />
      </svg>
    ),
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const openAllDemo = () => {
    window.open('/phone', '_blank');
    setTimeout(() => window.open('/call', '_blank'), 300);
  };

  return (
    <main style={styles.main}>
      <NavBar />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Inter:wght@200;300;400;500&display=swap"
        rel="stylesheet"
      />

      {/* ── Background grid ── */}
      <div style={styles.gridBg} />

      {/* ── Hero section ── */}
      <section style={styles.hero}>
        <div style={styles.heroTag}>
          <span style={styles.heroTagDot} />
          ANTI-DEEPFAKE VERIFICATION SYSTEM
        </div>

        <h1 style={styles.heroTitle}>PRESENCE</h1>
        <h2 style={styles.heroSubtitle}>PROTOCOL</h2>

        <div style={styles.heroLines}>
          <p style={styles.heroLine}>
            Banks call you. Deepfakes answer. <span style={styles.heroAccent}>We prove you&apos;re really there.</span>
          </p>
          <p style={styles.heroLine}>
            Ultrasonic challenge–response between your phone and the bank terminal.
          </p>
          <p style={styles.heroLine}>
            Physical presence, cryptographically verified. No voice. No face. <span style={styles.heroAccent}>Just proximity.</span>
          </p>
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={styles.sectionDivider}>
        <span style={styles.dividerLine} />
        <span style={styles.dividerLabel}>HOW IT WORKS</span>
        <span style={styles.dividerLine} />
      </div>

      {/* ── Step panels ── */}
      <section style={styles.panels}>
        {STEPS.map(({ step, title, subtitle, description, href, icon }) => (
          <div key={step} style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.panelStep}>{step}</span>
              <span style={styles.panelHeaderLine} />
            </div>

            <div style={styles.panelIcon}>{icon}</div>

            <h3 style={styles.panelTitle}>{title}</h3>
            <p style={styles.panelSubtitle}>{subtitle}</p>
            <p style={styles.panelDesc}>{description}</p>

            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.panelBtn}
            >
              <span style={styles.panelBtnArrow}>→</span>
              OPEN
            </a>
          </div>
        ))}
      </section>

      {/* ── Run Full Demo ── */}
      <section style={styles.demoSection}>
        <button onClick={openAllDemo} style={styles.demoBtn}>
          <span style={styles.demoBtnPulse} />
          RUN FULL DEMO
        </button>
        <p style={styles.demoHint}>
          Opens the Phone and Bank Terminal side-by-side in new tabs
        </p>
      </section>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <div style={styles.footerLeft}>
          <div style={styles.footerDot} />
          <span style={styles.footerLabel}>PRESENCE PROTOCOL v1.0</span>
        </div>
        <span style={styles.footerRight}>
          PHYSICAL PROXIMITY VERIFICATION — DEMO BUILD
        </span>
      </footer>

      {/* ── Animations ── */}
      <style>{`
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(0,168,255,0.5); }
          50% { opacity: 0.6; box-shadow: 0 0 20px rgba(0,168,255,0.8); }
        }
        .panel-card:hover {
          border-color: rgba(0,168,255,0.2) !important;
          background: #0a0a10 !important;
        }
      `}</style>
    </main>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    background: '#060608',
    color: '#c8ccd0',
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 48, // navbar height
  },

  gridBg: {
    position: 'fixed',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(0,168,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,168,255,0.02) 1px, transparent 1px)',
    backgroundSize: '80px 80px',
    pointerEvents: 'none' as const,
    zIndex: 0,
  },

  // ── Hero ──
  hero: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center' as const,
    padding: '80px 24px 40px',
    maxWidth: 720,
  },
  heroTag: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 9,
    fontWeight: 500,
    letterSpacing: '0.2em',
    color: '#4b5563',
    marginBottom: 32,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  heroTagDot: {
    width: 5,
    height: 5,
    background: '#00a8ff',
    boxShadow: '0 0 8px rgba(0,168,255,0.5)',
    animation: 'pulseDot 2s ease-in-out infinite',
  },
  heroTitle: {
    fontSize: 72,
    fontWeight: 200,
    letterSpacing: '0.3em',
    color: '#ffffff',
    margin: 0,
    lineHeight: 1,
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: 300,
    letterSpacing: '0.5em',
    color: '#374151',
    marginTop: 8,
    marginBottom: 40,
  },
  heroLines: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxWidth: 560,
  },
  heroLine: {
    fontSize: 14,
    fontWeight: 300,
    lineHeight: '1.7',
    color: '#6b7280',
    margin: 0,
  },
  heroAccent: {
    color: '#00a8ff',
    fontWeight: 400,
  },

  // ── Section divider ──
  sectionDivider: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 900,
    margin: '48px 0 40px',
    padding: '0 24px',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: '#111318',
  },
  dividerLabel: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.2em',
    color: '#374151',
    fontFamily: "'IBM Plex Mono', monospace",
    flexShrink: 0,
  },

  // ── Panels ──
  panels: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 1,
    width: '100%',
    maxWidth: 960,
    padding: '0 24px',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center' as const,
    padding: '32px 28px',
    background: '#08080c',
    border: '1px solid #111318',
    transition: 'border-color 0.3s ease, background 0.3s ease',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginBottom: 28,
  },
  panelStep: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.15em',
    color: '#00a8ff',
    fontFamily: "'IBM Plex Mono', monospace",
    flexShrink: 0,
  },
  panelHeaderLine: {
    flex: 1,
    height: 1,
    background: 'linear-gradient(90deg, rgba(0,168,255,0.15), transparent)',
  },
  panelIcon: {
    marginBottom: 20,
    opacity: 0.7,
  },
  panelTitle: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.15em',
    color: '#e2e4e8',
    margin: '0 0 4px',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  panelSubtitle: {
    fontSize: 10,
    fontWeight: 400,
    letterSpacing: '0.1em',
    color: '#4b5563',
    margin: '0 0 16px',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  panelDesc: {
    fontSize: 12,
    fontWeight: 300,
    lineHeight: '1.7',
    color: '#6b7280',
    margin: '0 0 24px',
    flex: 1,
  },
  panelBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 24px',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.15em',
    color: '#9ca3af',
    background: 'transparent',
    border: '1px solid #1a1a22',
    textDecoration: 'none',
    fontFamily: "'IBM Plex Mono', monospace",
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  panelBtnArrow: {
    fontSize: 12,
    color: '#00a8ff',
  },

  // ── Demo button ──
  demoSection: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    margin: '56px 0 80px',
  },
  demoBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '18px 48px',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.15em',
    color: '#e2e4e8',
    background: 'linear-gradient(135deg, rgba(0,168,255,0.15) 0%, rgba(0,168,255,0.05) 100%)',
    border: '1px solid rgba(0,168,255,0.3)',
    cursor: 'pointer',
    fontFamily: "'IBM Plex Mono', monospace",
    transition: 'all 0.25s ease',
    overflow: 'hidden',
  },
  demoBtnPulse: {
    width: 8,
    height: 8,
    background: '#00a8ff',
    boxShadow: '0 0 12px rgba(0,168,255,0.6)',
    animation: 'pulseDot 2s ease-in-out infinite',
  },
  demoHint: {
    fontSize: 10,
    fontWeight: 300,
    color: '#374151',
    letterSpacing: '0.05em',
    fontFamily: "'IBM Plex Mono', monospace",
  },

  // ── Footer ──
  footer: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    borderTop: '1px solid #0e0e14',
    background: '#060608',
    marginTop: 'auto',
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
