import { useCallback, useEffect, useRef, useState } from 'react'
import { INITIAL, load, save, wipe, type Ctx, type Screen, type State } from './state'
import { Button, Icon, Logo, cx, smooth } from './ui'
import { visibleQuestions, isEmpty } from './lib'
import Welcome from './screens/Welcome'
import Triage from './screens/Triage'
import Out from './screens/Out'
import Docs from './screens/Docs'
import Ask from './screens/Ask'
import Review from './screens/Review'
import Done from './screens/Done'

const STEPS: { key: string; label: string; screens: Screen[] }[] = [
  { key: 'check', label: 'Check', screens: ['triage', 'out'] },
  { key: 'gather', label: 'Gather', screens: ['docs'] },
  { key: 'answer', label: 'Answer', screens: ['ask'] },
  { key: 'review', label: 'Review', screens: ['review'] },
  { key: 'send', label: 'Sent', screens: ['done'] },
]

export default function App() {
  const [s, setS] = useState<State>(load)
  const [saved, setSaved] = useState(false)
  const [announce, setAnnounce] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const first = useRef(true)

  const up = useCallback((p: Partial<State>) => setS((o) => ({ ...o, ...p })), [])
  const go = useCallback((screen: Screen, extra: Partial<State> = {}) => {
    setS((o) => ({ ...o, ...extra, screen, last: screen === 'welcome' ? o.last : screen }))
    window.scrollTo({ top: 0, behavior: smooth() })
  }, [])
  const ctx: Ctx = { s, up, go }

  useEffect(() => {
    document.documentElement.style.setProperty('--base', `${100 + s.textSize * 12.5}%`)
  }, [s.textSize])

  useEffect(() => {
    save(s)
    if (first.current) { first.current = false; return }
    setSaved(true)
    const t = setTimeout(() => setSaved(false), 1600)
    return () => clearTimeout(t)
  }, [s])

  // Move focus to the new heading on every screen/question change, for keyboard and screen-reader users.
  const mainRef = useRef<HTMLElement>(null)
  const key = s.screen + ':' + s.qi
  const lastKey = useRef(key)
  useEffect(() => {
    if (lastKey.current === key) return
    lastKey.current = key
    const root = mainRef.current
    const h = root?.querySelector<HTMLElement>('[data-focus]')
    // On questions, focus the field itself so people can just type; the live region carries the question.
    const field = s.screen === 'ask' ? root?.querySelector<HTMLElement>('input:not([type=radio]):not([type=checkbox]), textarea') : null
    ;(field ?? h)?.focus({ preventScroll: true })
    setAnnounce(`${s.screen === 'ask' ? (h?.previousElementSibling?.textContent ?? '') + '. ' : ''}${h?.textContent ?? ''}`)
  }, [key])

  useEffect(() => {
    const names: Record<Screen, string> = { welcome: 'Plain-language applications', triage: 'Quick check', out: 'Not the right fit', docs: 'What to bring', ask: 'Your answers', review: 'Review', done: 'Application sent' }
    document.title = `${names[s.screen]} · ClearForm`
  }, [s.screen])

  const step = STEPS.findIndex((x) => x.screens.includes(s.screen))
  const qs = visibleQuestions(s.answers, s.triage)
  const answered = qs.filter((q) => !isEmpty(s.answers[q.id])).length
  const minutes = Math.max(1, Math.round((qs.length - answered) * 0.5))
  const inFlow = s.screen !== 'welcome'

  return (
    <div className="relative z-10 min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper">
        Skip to content
      </a>
      <header className="no-print z-40 sm:sticky sm:top-0 border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:px-6">
          <button type="button" onClick={() => go('welcome')} aria-label="ClearForm home" className="rounded-full">
            <Logo />
          </button>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <span aria-live="polite" className={cx('mr-1 hidden items-center gap-1.5 text-sm text-ink3 transition-opacity sm:inline-flex', saved ? 'opacity-100' : 'opacity-0')}>
              <Icon name="check" /> Saved on this device
            </span>
            <div role="group" aria-label="Text size" className="flex items-center rounded-full border border-line bg-card">
              <button type="button" aria-label="Smaller text" disabled={s.textSize <= -1} onClick={() => up({ textSize: s.textSize - 1 })} className="grid h-11 w-11 place-items-center rounded-full hover:bg-sunk disabled:opacity-30"><Icon name="minus" /></button>
              <span aria-hidden="true" className="select-none font-display text-lg font-semibold">Aa</span>
              <button type="button" aria-label="Larger text" disabled={s.textSize >= 3} onClick={() => up({ textSize: s.textSize + 1 })} className="grid h-11 w-11 place-items-center rounded-full hover:bg-sunk disabled:opacity-30"><Icon name="plus" /></button>
            </div>
            <button
              type="button" role="switch" aria-checked={s.official}
              onClick={() => up({ official: !s.official })}
              className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-3 text-sm font-medium hover:border-ink sm:px-4"
              title="Show the original official wording beside each question"
            >
              <span aria-hidden="true" className={cx('relative h-5 w-9 rounded-full transition', s.official ? 'bg-ink' : 'bg-line2')}>
                <span className={cx('absolute top-0.5 h-4 w-4 rounded-full bg-paper transition-all', s.official ? 'left-[1.1rem]' : 'left-0.5')} />
              </span>
              <span className="hidden sm:inline">Official wording</span>
              <span className="sm:hidden">Legal</span>
            </button>
          </div>
        </div>
        {inFlow && (
          <nav aria-label="Your progress" className="no-print mx-auto max-w-6xl px-4 pb-3 sm:px-6">
            <div className="sm:hidden">
              <p className="m-0 mb-2 text-sm"><span className="font-semibold">Step {step + 1} of {STEPS.length}</span> · {STEPS[step]?.label}</p>
              <div aria-hidden="true" className="flex gap-1">
                {STEPS.map((x, i) => <span key={x.key} className={cx('h-1.5 flex-1 rounded-full transition-colors duration-500', i <= step ? 'bg-ink' : 'bg-line')} />)}
              </div>
            </div>
            <ol className="hidden items-center gap-2 sm:flex">
              {STEPS.map((x, i) => {
                const state = i < step ? 'done' : i === step ? 'now' : 'next'
                return (
                  <li key={x.key} aria-current={state === 'now' ? 'step' : undefined} className="flex flex-1 items-center gap-2">
                    <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-semibold transition', state === 'done' && 'border-ink bg-ink text-paper', state === 'now' && 'border-ink bg-card text-ink', state === 'next' && 'border-line2 text-ink3')}>
                      {state === 'done' ? <Icon name="check" className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className={cx('text-sm', state === 'now' ? 'font-semibold' : 'text-ink3')}>
                      {x.label}<span className="sr-only">{state === 'done' ? ', completed' : state === 'now' ? ', current step' : ', not started'}</span>
                    </span>
                    {i < STEPS.length - 1 && <span aria-hidden="true" className={cx('h-px flex-1 transition-colors duration-500', i < step ? 'bg-ink' : 'bg-line')} />}
                  </li>
                )
              })}
            </ol>
          </nav>
        )}
      </header>

      <main id="main" ref={mainRef} tabIndex={-1} className="outline-none mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
        {s.screen === 'welcome' && <Welcome {...ctx} />}
        {s.screen === 'triage' && <Triage {...ctx} />}
        {s.screen === 'out' && <Out {...ctx} />}
        {s.screen === 'docs' && <Docs {...ctx} />}
        {s.screen === 'ask' && <Ask {...ctx} minutes={minutes} />}
        {s.screen === 'review' && <Review {...ctx} />}
        {s.screen === 'done' && <Done {...ctx} />}
      </main>

      <footer className="no-print border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-ink3 sm:px-6">
          <p className="m-0 max-w-xl">
            ClearForm is a design prototype. “Riverside Rent Relief” is a fictional program, and nothing you enter leaves your device.
          </p>
          {s.screen !== 'welcome' && (
            confirmReset ? (
              <span className="flex flex-wrap items-center gap-2" role="alert">
                <span className="text-ink">Erase everything you entered?</span>
                <Button variant="solid" onClick={() => { wipe(); setS(INITIAL); setConfirmReset(false); window.scrollTo(0, 0) }}>Yes, erase</Button>
                <Button variant="outline" onClick={() => setConfirmReset(false)}>Keep it</Button>
              </span>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmReset(true)}>Start over</Button>
            )
          )}
        </div>
      </footer>
      <div className="sr-only" aria-live="polite" role="status">{announce}</div>
    </div>
  )
}
