'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function NavBar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();

  const NAV_LINKS = [
    { href: '/',          label: t('nav.demo')      },
    { href: '/phone',     label: t('nav.phone')     },
    { href: '/call',      label: t('nav.bank')      },
    { href: '/handshake', label: t('nav.handshake') },
  ];

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <nav style={styles.nav}>
        <Link href="/" style={styles.logoLink}>
          <div style={styles.logoDot} />
          <span style={styles.logoText}>PRESENCE</span>
          <span style={styles.logoSub}>PROTOCOL</span>
        </Link>

        <div style={styles.links}>
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  ...styles.link,
                  color: isActive ? '#00a8ff' : '#4b5563',
                  borderBottom: isActive
                    ? '1px solid rgba(0,168,255,0.4)'
                    : '1px solid transparent',
                }}
              >
                {label}
              </Link>
            );
          })}

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'de' : 'en')}
            style={styles.langBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#2563eb';
              e.currentTarget.style.borderColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#555';
              e.currentTarget.style.borderColor = '#222';
            }}
          >
            {lang === 'en' ? 'DE' : 'EN'}
          </button>
        </div>
      </nav>
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: 48,
    background: 'rgba(6,6,8,0.92)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #111318',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
  },
  logoDot: {
    width: 7,
    height: 7,
    background: '#00a8ff',
    boxShadow: '0 0 10px rgba(0,168,255,0.5)',
    flexShrink: 0,
  },
  logoText: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.18em',
    color: '#e2e4e8',
  },
  logoSub: {
    fontSize: 9,
    fontWeight: 400,
    letterSpacing: '0.12em',
    color: '#374151',
    marginLeft: -2,
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  link: {
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '0.12em',
    padding: '14px 14px',
    textDecoration: 'none',
    transition: 'color 0.2s ease, border-color 0.2s ease',
  },
  langBtn: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.15em',
    padding: '5px 10px',
    background: 'transparent',
    border: '1px solid #222',
    color: '#555',
    cursor: 'pointer',
    fontFamily: "'IBM Plex Mono', monospace",
    transition: 'color 0.2s ease, border-color 0.2s ease',
    marginLeft: 8,
  },
};
