'use client';

import Link from 'next/link';

/* ─── Step Cards Data ───────────────────────────────────────────────────────── */

const STEPS = [
  {
    title: 'Bank Terminal',
    description: 'Initiate a high-value transaction verification call.',
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
    title: 'Device Detection',
    description: 'Emit an ultrasonic presence token from the authorised device.',
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
    title: 'Presence Confirmed',
    description: 'Physical proximity verified — transaction authorised.',
    href: '/handshake',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1">
        <path d="M12 2L3 7v5c0 5.25 3.83 10.15 9 11.25C17.17 22.15 21 17.25 21 12V7l-9-5z" />
      </svg>
    ),
  },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#080808] text-white font-[Inter,sans-serif] antialiased">

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
            Trust beyond the voice
          </p>
        </div>
      </section>

      {/* ── Cards Section ── */}
      <section className="relative z-10 max-w-[1100px] mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#1a1a1a]">
          {STEPS.map(({ title, description, href, icon }) => (
            <div
              key={title}
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
                Open
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
            href="/call"
            className="inline-flex items-center gap-3 px-12 py-4 text-[13px] font-medium tracking-[0.15em] uppercase text-white bg-[#2563EB] hover:bg-[#1d4ed8] transition-colors duration-200 no-underline"
          >
            Run Full Demo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
