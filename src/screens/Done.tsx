import { useState } from 'react'
import type { Ctx } from '../state'
import { DOCS, TIMELINE } from '../data'
import { Button, Icon } from '../ui'
import { summary } from '../lib'

export default function Done({ s, go }: Ctx) {
  const [copied, setCopied] = useState<'ref' | 'all' | null>(null)
  const start = s.submittedAt ? new Date(s.submittedAt) : new Date()
  const later = DOCS.filter((d) => (!d.showIf || d.showIf(s.triage)) && s.docs[d.id] !== 'have')
  const date = (n: number) => new Date(start.getTime() + n * 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const copyText = async (text: string, flag: 'ref' | 'all') => {
    try { await navigator.clipboard.writeText(text); setCopied(flag); setTimeout(() => setCopied(null), 1800) } catch { /* clipboard blocked */ }
  }
  const receipt = () => [
    `ClearForm receipt ${s.ref}`, summary(s.answers, s.triage), '',
    ...TIMELINE.map((t, i) => `${i === 0 ? 'Today' : 'By ' + date(t.days)}: ${t.title}`),
    ...(later.length ? ['', 'Still to bring: ' + later.map((d) => d.label).join(', ')] : []),
  ].join('\n')
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rise text-center">
        <svg className="mx-auto mb-6 h-24 w-24" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle cx="48" cy="48" r="44" stroke="var(--color-ink)" strokeWidth="3" pathLength="100" className="draw" />
          <path d="M30 49l13 13 24-27" stroke="var(--color-ink)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength="100" className="draw" style={{ animationDelay: '.5s' }} />
        </svg>
        <h1 data-focus tabIndex={-1} className="m-0 font-display text-4xl font-semibold leading-tight outline-none sm:text-6xl">You’re done. That’s it.</h1>
        <p className="mx-auto mb-0 mt-4 max-w-xl text-xl text-ink2">Your application is in. Here’s exactly what happens next, so there’s nothing to wonder about.</p>
      </div>

      <section aria-label="Your receipt" className="print-card rise mt-10 rounded-[2rem] border border-line bg-card p-6 shadow-soft [animation-delay:150ms] sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-line2 pb-6">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-ink3">Reference number</p>
            <p className="m-0 font-display text-3xl font-semibold tracking-wide">{s.ref}</p>
          </div>
          <Button variant="outline" onClick={() => copyText(s.ref ?? '', 'ref')} className="no-print" aria-live="polite"><Icon name={copied === 'ref' ? 'check' : 'copy'} /> {copied === 'ref' ? 'Copied' : 'Copy'}</Button>
        </div>
        <p className="mb-0 mt-6 font-display text-xl leading-snug text-ink2">{summary(s.answers, s.triage)}</p>

        <h2 className="mb-5 mt-9 font-display text-2xl font-semibold">What happens next</h2>
        <ol className="m-0 list-none p-0">
          {TIMELINE.map((t, i) => (
            <li key={t.title} className="rise relative flex gap-5 pb-7 last:pb-0" style={{ animationDelay: `${300 + i * 120}ms` }}>
              {i < TIMELINE.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-[0.95rem] top-9 w-px bg-line2" />}
              <span aria-hidden="true" className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink text-xs font-bold ${i === 0 ? 'bg-ink text-paper' : 'bg-card'}`}>{i + 1}</span>
              <div>
                <p className="m-0 text-sm font-semibold text-ink3">{i === 0 ? 'Today' : `By ${date(t.days)}`}</p>
                <h3 className="m-0 font-display text-xl font-semibold">{t.title}</h3>
                <p className="m-0 text-ink2">{t.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {later.length > 0 && (
          <div className="mt-8 rounded-2xl bg-sunk p-5">
            <h2 className="m-0 mb-2 font-display text-xl font-semibold">Still to bring</h2>
            <ul className="m-0 grid gap-1 pl-5 text-ink2">{later.map((d) => <li key={d.id}>{d.label}</li>)}</ul>
          </div>
        )}
      </section>

      <div className="no-print mt-8 flex flex-wrap justify-center gap-3">
        <Button big onClick={() => copyText(receipt(), 'all')} aria-live="polite"><Icon name={copied === 'all' ? 'check' : 'copy'} /> {copied === 'all' ? 'Receipt copied' : 'Copy my receipt'}</Button>
        <Button big variant="outline" onClick={() => go('review')}>Back to my answers</Button>
      </div>
    </div>
  )
}
