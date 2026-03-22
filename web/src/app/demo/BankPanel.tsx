'use client';

import type { TranslationKey } from '@/lib/i18n';

type BankStage = 'idle' | 'processing' | 'approved';

const DEMO_TOKEN = 'a3f7e2b8c1d94e6f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4';

function tokenToGrid(token: string): string[] {
  const pairs: string[] = [];
  for (let i = 0; i < token.length; i += 2) pairs.push(token.slice(i, i + 2));
  return pairs;
}

export default function BankPanel({ stage, t }: { stage: BankStage; t: (key: TranslationKey) => string }) {
  const isProcessing = stage === 'processing';
  const isApproved = stage === 'approved';

  return (
    <div
      className="flex flex-col h-full"
      style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace", background: '#080808' }}
    >
      {/* ── Header bar ── */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b shrink-0"
        style={{ borderColor: '#1a1a1a', background: '#0a0a0a' }}
      >
        <div className="w-1.5 h-1.5 shrink-0" style={{ background: '#2563eb', boxShadow: '0 0 6px #2563eb' }} />
        <span
          className="font-semibold uppercase truncate"
          style={{ letterSpacing: '0.16em', color: '#888', fontSize: '8px' }}
        >
          {t('demo.bank_name')}
        </span>
      </div>

      {/* ── Transaction record section header ── */}
      <div
        className="flex items-center gap-2 px-4 py-2 border-b shrink-0"
        style={{ letterSpacing: '0.15em', color: '#555', borderColor: '#1a1a1a', background: '#0a0a0a', fontSize: '8px' }}
      >
        <span className="inline-block w-1 h-1 shrink-0" style={{ background: '#2563eb' }} />
        <span className="uppercase font-semibold">{t('demo.tx_record')}</span>
      </div>

      {/* ── Transaction data ── */}
      <div className="shrink-0 px-4 pt-3 pb-3" style={{ background: '#080808' }}>
        <div style={{ border: '1px solid #1a1a1a' }}>
          {[
            { label: 'AMOUNT',      value: '€50,000.00',                bold: true  },
            { label: 'BENEFICIARY', value: 'SCHMIDT INDUSTRIES GMBH',   bold: false },
            { label: 'TYPE',        value: 'WIRE TRANSFER — HIGH VALUE', bold: false },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className="flex justify-between items-center px-3 py-2"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid #141414' : 'none' }}
            >
              <span style={{ color: '#555', fontSize: '8px', letterSpacing: '0.12em' }}>{row.label}</span>
              <span
                className={row.bold ? 'font-bold' : ''}
                style={{ color: row.bold ? '#f0f0f0' : '#aaa', fontSize: row.bold ? '13px' : '9px' }}
              >
                {row.value}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center px-3 py-2">
            <span style={{ color: '#555', fontSize: '8px', letterSpacing: '0.12em' }}>RISK</span>
            <span
              className="font-bold px-2 py-0.5"
              style={{
                color: '#fbbf24',
                fontSize: '8px',
                letterSpacing: '0.15em',
                border: '1px solid rgba(251,191,36,0.25)',
                background: 'rgba(251,191,36,0.06)',
              }}
            >
              ■ HIGH
            </span>
          </div>
        </div>
      </div>

      {/* ── Verification module section header ── */}
      <div
        className="flex items-center gap-2 px-4 py-2 border-t border-b shrink-0"
        style={{ letterSpacing: '0.15em', color: '#555', borderColor: '#1a1a1a', background: '#0a0a0a', fontSize: '8px' }}
      >
        <span className="inline-block w-1 h-1 shrink-0" style={{ background: '#2563eb' }} />
        <span className="uppercase font-semibold">PRESENCE VERIFICATION MODULE</span>
      </div>

      {/* ── Verification content ── */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden" style={{ background: '#080808' }}>

        {/* IDLE */}
        {stage === 'idle' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.2" style={{ opacity: 0.3 }}>
              <path d="M12 2L3 7v5c0 5.25 3.83 10.15 9 11.25C17.17 22.15 21 17.25 21 12V7l-9-5z" />
            </svg>
            <p style={{ color: '#555', letterSpacing: '0.08em', fontSize: '9px', lineHeight: '1.8' }}>
              INITIATE PHYSICAL PRESENCE<br />VERIFICATION TO AUTHORIZE
            </p>
            <div
              className="flex items-center gap-2 px-5 py-2.5"
              style={{ background: '#2563eb', color: '#e0e0e0', letterSpacing: '0.12em', fontSize: '8px' }}
            >
              <span style={{ fontSize: '7px' }}>▶</span>
              INITIATE PRESENCE VERIFICATION
            </div>
          </div>
        )}

        {/* PROCESSING */}
        {isProcessing && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 animate-pulse shrink-0"
                style={{ background: '#2563eb', boxShadow: '0 0 8px rgba(37,99,235,0.6)' }}
              />
              <span style={{ color: '#60a5fa', letterSpacing: '0.08em', fontSize: '8px' }}>
                {t('demo.broadcasting')}
              </span>
            </div>
            <div className="w-full" style={{ border: '1px solid #1a1a1a', background: '#060606' }}>
              <div
                className="px-3 py-1.5 border-b"
                style={{
                  borderColor: '#1a1a1a',
                  background: '#0a0a0a',
                  color: '#2563eb',
                  letterSpacing: '0.18em',
                  fontSize: '7px',
                }}
              >
                {t('demo.broadcast_label')}
              </div>
              <div className="grid grid-cols-8 gap-px p-2" style={{ background: '#060606' }}>
                {tokenToGrid(DEMO_TOKEN).map((hex, i) => (
                  <span
                    key={i}
                    className="flex items-center justify-center py-1 font-semibold uppercase"
                    style={{
                      color: '#2563eb',
                      fontSize: '9px',
                      textShadow: '0 0 8px rgba(37,99,235,0.5)',
                      background: 'rgba(37,99,235,0.03)',
                      border: '1px solid rgba(37,99,235,0.08)',
                      animation: `fadeInCell 0.3s ease-out ${i * 25}ms both`,
                    }}
                  >
                    {hex}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* APPROVED */}
        {isApproved && (
          <div className="flex flex-col items-center w-full">
            <div
              className="w-full flex flex-col items-center justify-center py-8 px-6"
              style={{
                background: 'rgba(34,197,94,0.06)',
                borderTop: '2px solid #22c55e',
                borderBottom: '2px solid #22c55e',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="mb-3">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
              </svg>
              <div
                className="text-center font-bold uppercase mb-2"
                style={{
                  color: '#22c55e',
                  letterSpacing: '0.15em',
                  fontSize: '14px',
                  textShadow: '0 0 20px rgba(34,197,94,0.3)',
                }}
              >
                {t('demo.approved_title')}
              </div>
              <div style={{ color: '#22c55e', letterSpacing: '0.1em', fontSize: '8px', opacity: 0.6 }}>
                {t('demo.approved_sub')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer status bar ── */}
      <div
        className="flex items-center gap-2 px-4 py-2 border-t shrink-0"
        style={{ borderColor: '#1a1a1a', background: '#0a0a0a' }}
      >
        <div
          className="w-1.5 h-1.5 shrink-0"
          style={{
            background: isApproved ? '#22c55e' : isProcessing ? '#2563eb' : '#333',
            boxShadow: isApproved ? '0 0 6px #22c55e' : isProcessing ? '0 0 6px #2563eb' : 'none',
          }}
        />
        <span style={{ color: '#555', letterSpacing: '0.1em', fontSize: '8px' }}>
          {stage === 'idle'       && t('demo.status_ready')}
          {stage === 'processing' && t('demo.status_broadcasting')}
          {stage === 'approved'   && t('demo.status_approved')}
        </span>
      </div>

      <style>{`
        @keyframes fadeInCell {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
