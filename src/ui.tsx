import { useEffect, useId, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { GLOSSARY } from './data'

/** Smooth scrolling unless the visitor asked for reduced motion. */
export const smooth = (): ScrollBehavior =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

export const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5 font-display text-[1.35rem] font-semibold tracking-tight', className)}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="currentColor" />
        <circle cx="16" cy="16" r="7" fill="none" stroke="var(--color-paper)" strokeWidth="2.5" />
        <circle cx="16" cy="16" r="2.5" fill="var(--color-paper)" />
      </svg>
      <span className="max-[430px]:sr-only">ClearForm</span>
    </span>
  )
}

export function Icon({ name, className }: { name: 'arrow' | 'back' | 'check' | 'file' | 'edit' | 'print' | 'copy' | 'clock' | 'lock' | 'plus' | 'minus'; className?: string }) {
  const p: Record<string, string> = {
    arrow: 'M5 12h14M13 6l6 6-6 6',
    back: 'M19 12H5M11 6l-6 6 6 6',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    file: 'M7 3h7l5 5v13H7zM14 3v5h5',
    edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
    print: 'M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z',
    copy: 'M9 9h11v11H9zM5 15V4h11',
    clock: 'M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0',
    lock: 'M6 11h12v9H6zM8 11V8a4 4 0 018 0v3',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
  }
  return (
    <svg className={cx('h-[1.1em] w-[1.1em] shrink-0', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={p[name]} />
    </svg>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid' | 'ghost' | 'outline'; big?: boolean }
export function Button({ variant = 'solid', big, className, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={cx(
        'group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-medium transition duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50',
        big && 'min-h-14 px-8 text-lg',
        variant === 'solid' && 'bg-ink text-paper hover:bg-ink2 on-dark',
        variant === 'outline' && 'border border-line2 bg-card text-ink hover:border-ink',
        variant === 'ghost' && 'text-ink2 hover:bg-sunk hover:text-ink',
        className,
      )}
    />
  )
}

/** A glossary term: tap to reveal a plain-language definition. */
export function Term({ id, children }: { id: string; children?: ReactNode }) {
  const g = GLOSSARY[id]
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const pop = useRef<HTMLSpanElement>(null)
  const pid = useId()
  // Keep the popover inside the viewport however close to the edge the term sits.
  useLayoutEffect(() => {
    const el = pop.current
    if (!open || !el) return
    el.style.left = '0px'
    const over = el.getBoundingClientRect().right - (window.innerWidth - 16)
    if (over > 0) el.style.left = `${-over}px`
  }, [open])
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])
  if (!g) return <>{children}</>
  return (
    <span ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={pid}
        onClick={() => setOpen((o) => !o)}
        className="cursor-help rounded-sm border-b-2 border-dotted border-ink bg-sunk/70 px-0.5 text-inherit hover:bg-sunk"
      >
        {children ?? g.term}
      </button>
      {open && (
        <span ref={pop} id={pid} role="note" className="fade absolute left-0 top-full z-30 mt-2 block w-[min(20rem,calc(100vw-2rem))] rounded-2xl bg-ink p-4 text-left font-sans text-[0.95rem] font-normal not-italic leading-snug tracking-normal text-paper shadow-soft">
          <strong className="mb-1 block font-display text-base font-semibold">{g.term}</strong>
          {g.def}
        </span>
      )}
    </span>
  )
}

/** Renders text containing {{term}} markers as interactive glossary terms. */
export function Rich({ text, noTerms }: { text: string; noTerms?: boolean }) {
  const parts = text.split(/\{\{(\w+)\}\}/g)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (noTerms ? <span key={i}>{GLOSSARY[p]?.term ?? p}</span> : <Term key={i} id={p} />) : <span key={i}>{p}</span>,
      )}
    </>
  )
}

/** Hero interaction: official legalese on one side, the same rule in plain words on the other. */
export function Lens() {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(55)
  const touched = useRef(false)

  // One gentle sweep on load so the idea is understood without any instruction.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    setPos(0)
    const start = performance.now()
    const tick = (t: number) => {
      if (touched.current) return
      const k = Math.min((t - start) / 1800, 1)
      setPos(Math.round((1 - Math.pow(1 - k, 3)) * 55))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const fromPointer = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    touched.current = true
    setPos(Math.max(0, Math.min(100, Math.round(((e.clientX - r.left) / r.width) * 100))))
  }

  const clip = { clipPath: `inset(0 ${100 - pos}% 0 0)` }
  return (
    <figure className="m-0">
      <div className="rounded-3xl border border-line bg-card p-1 shadow-soft">
        <div ref={ref} onPointerMove={fromPointer} onPointerDown={fromPointer} className="relative grid touch-pan-y overflow-hidden rounded-[1.25rem] bg-card">
          <p aria-hidden="true" className="col-start-1 row-start-1 m-0 select-none p-6 font-display text-[1.02rem] leading-relaxed text-ink3 sm:p-8 sm:text-lg">
            <span className="mb-3 block font-sans text-xs font-semibold uppercase tracking-[0.14em]">Section 4(b) · Official wording</span>
            Pursuant to the provisions hereof, the Applicant shall furnish documentary evidence of gross household receipts for the thirty (30) day period immediately preceding the date of application, failing which the application shall be deemed incomplete and subject to administrative closure.
          </p>
          <p style={clip} className="col-start-1 row-start-1 m-0 bg-card p-6 font-display text-[1.02rem] leading-relaxed text-ink sm:p-8 sm:text-lg">
            <span className="mb-3 block font-sans text-xs font-semibold uppercase tracking-[0.14em]">Same rule · In plain words</span>
            Show us what your household earned in the last 30 days. If you leave this out, we can’t finish your application, but we’ll tell you before we close anything.
          </p>
          <span aria-hidden="true" style={{ left: `${pos}%` }} className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-ink">
            <span className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-paper shadow-soft">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5" /></svg>
            </span>
          </span>
        </div>
      </div>
      <figcaption className="mt-4 px-1">
        <label htmlFor="lens-range" className="mb-1 flex justify-between text-sm font-medium text-ink2">
          <span>Plain words</span>
          <span>Official wording</span>
        </label>
        <input
          id="lens-range" type="range" min={0} max={100} value={pos}
          aria-label="Slide to compare the official wording with plain words"
          aria-valuetext={pos > 66 ? 'Mostly plain words' : pos < 33 ? 'Mostly official wording' : 'Half plain, half official'}
          onChange={(e) => { touched.current = true; setPos(Number(e.target.value)) }}
          className="h-11 w-full cursor-ew-resize accent-ink"
        />
      </figcaption>
    </figure>
  )
}

export function ProgressRing({ value, size = 56, label }: { value: number; size?: number; label: string }) {
  const r = 22
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label={label}>
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--color-line)" strokeWidth="5" />
      <circle
        cx="28" cy="28" r={r} fill="none" stroke="var(--color-ink)" strokeWidth="5" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value)} transform="rotate(-90 28 28)"
        style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.7,.2,1)' }}
      />
      <text x="28" y="33" textAnchor="middle" className="fill-ink text-[14px] font-semibold">{Math.round(value * 100)}</text>
    </svg>
  )
}
