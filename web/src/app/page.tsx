'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const { lang, setLang, t } = useLanguage();

  const STEPS = [
    {
      title:       t('home.step1.title'),
      description: t('home.step1.desc'),
      href: '/call',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1">
          <rect x="2" y="3" width="20" height="14" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      title:       t('home.step2.title'),
      description: t('home.step2.desc'),
      href: '/phone',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1">
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="7" opacity="0.5" />
          <circle cx="12" cy="12" r="11" opacity="0.25" />
        </svg>
      ),
    },
    {
      title:       t('home.step3.title'),
      description: t('home.step3.desc'),
      href: '/handshake',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1">
          <path d="M12 2L3 7v5c0 5.25 3.83 10.15 9 11.25C17.17 22.15 21 17.25 21 12V7l-9-5z" />
        </svg>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-[#080808] text-white font-[Inter,sans-serif] antialiased">

      {/* ── Language toggle ── */}
      <button
        onClick={() => setLang(lang === 'en' ? 'de' : 'en')}
        style={{
          position: 'fixed',
          top: 20,
          right: 24,
          zIndex: 9999,
          fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.15em',
          padding: '6px 14px',
          background: 'rgba(6,6,8,0.85)',
          border: '1px solid #374151',
          color: '#d1d5db',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'color 0.2s ease, border-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.borderColor = '#2563eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#d1d5db';
          e.currentTarget.style.borderColor = '#374151';
        }}
      >
        {lang === 'en' ? 'DE' : 'EN'}
      </button>

      {/* ── Hero Section ── */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Sonar pulse ring */}
        <div
          className="absolute top-1/2 left-1/2 w-[800px] h-[800px] pointer-events-none"
          style={{
            border: '1px solid #2563EB',
            borderRadius: '50%',
            animation: 'sonarPulse 5s ease-out infinite',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <h1 className="text-[clamp(72px,12vw,160px)] font-[100] tracking-[0.25em] leading-none text-white uppercase select-none">
            PRESENCE
          </h1>
          <p className="mt-6 text-[clamp(14px,1.5vw,18px)] font-light tracking-[0.15em] text-[#6b7280] uppercase">
            {t('home.tagline')}
          </p>
        </div>
      </section>

      {/* ── Cards Section ── */}
      <section className="relative z-10 max-w-[1100px] mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#1a1a1a]">
          {STEPS.map(({ title, description, href, icon }) => (
            <div
              key={href}
              className="bg-[#0c0c0c] p-10 flex flex-col items-start gap-6 transition-colors duration-300 hover:bg-[#111111] group"
            >
              <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                {icon}
              </div>

              <div>
                <h3 className="text-[13px] font-medium tracking-[0.12em] text-white uppercase mb-1">
                  {title}
                </h3>
                <p className="text-[13px] font-light leading-relaxed text-[#6b7280]">
                  {description}
                </p>
              </div>

              <Link
                href={href}
                className="mt-auto inline-flex items-center gap-3 px-6 py-3 text-[11px] font-medium tracking-[0.15em] uppercase text-[#9ca3af] border border-[#1a1a1a] hover:border-[#2563EB] hover:text-[#2563EB] transition-all duration-200 no-underline"
              >
                {t('home.open')}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

        {/* ── Run Full Demo ── */}
        <div className="flex justify-center mt-20">
          <Link
            href="/demo"
            className="inline-flex items-center gap-3 px-12 py-4 text-[13px] font-medium tracking-[0.15em] uppercase text-white bg-[#2563EB] hover:bg-[#1d4ed8] transition-colors duration-200 no-underline"
          >
            {t('home.cta')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
