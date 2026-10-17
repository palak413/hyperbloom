import { useState } from 'react'
import type { Ctx } from '../state'
import { Cards, TextField } from '../fields'
import { Button, Icon, ProgressRing, Rich, cx } from '../ui'
import { formatLabel, isEmpty, validate, visibleQuestions } from '../lib'

export default function Ask({ s, up, go, minutes }: Ctx & { minutes: number }) {
  const qs = visibleQuestions(s.answers, s.triage)
  const i = Math.min(s.qi, qs.length - 1)
  const q = qs[i]
  const v = s.answers[q.id]
  const [err, setErr] = useState<string | null>(null)
  const [showWhy, setShowWhy] = useState(false)
  const [lastQ, setLastQ] = useState(q.id)
  if (lastQ !== q.id) { setLastQ(q.id); setErr(null); setShowWhy(false) }

  const set = (val: string | string[]) => { up({ answers: { ...s.answers, [q.id]: val } }); if (err) setErr(null) }
  const doneCount = qs.filter((x) => !isEmpty(s.answers[x.id])).length
  const sections = [...new Set(qs.map((x) => x.section))]

  const next = () => {
    const e = validate(q, v)
    if (e) { setErr(e); return }
    if (s.fromReview) return go('review', { fromReview: false, editFrom: null })
    // answers may reveal/hide later questions, so recompute against the saved answers
    if (i >= qs.length - 1) go('review')
    else up({ qi: i + 1 })
  }
  const back = () => {
    if (s.fromReview) {
      const o = s.editFrom
      const answers = { ...s.answers }
      if (o && o.id === q.id) { if (o.value === undefined) delete answers[q.id]; else answers[q.id] = o.value }
      return go('review', { fromReview: false, editFrom: null, answers })
    }
    if (i === 0) go('docs')
    else up({ qi: i - 1 })
  }

  const label = <Rich text={q.label} />
  const hint = q.hint ? <Rich text={q.hint} /> : undefined
  const common = { error: err, hint }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
      <form key={q.id} onSubmit={(e) => { e.preventDefault(); next() }} noValidate className="mx-auto w-full max-w-2xl lg:mx-0">
        <div className="mb-6 flex items-center justify-between text-ink3">
          <p className="m-0 text-sm font-semibold uppercase tracking-[0.14em]">{q.section}</p>
          <p className="m-0 flex items-center gap-1.5 text-sm"><Icon name="clock" /> about {minutes} min left</p>
        </div>
        <div className="rise rounded-[2rem] border border-line bg-card p-6 shadow-soft sm:p-10">
          <p className="m-0 mb-1 text-sm text-ink3">Question {i + 1} of {qs.length}</p>
          <h1 data-focus tabIndex={-1} className="m-0 mb-6 font-display text-3xl font-semibold leading-tight outline-none sm:text-4xl">{label}</h1>
          {hint && q.kind !== 'text' && q.kind !== 'email' && q.kind !== 'number' && q.kind !== 'date' && q.kind !== 'textarea' && <p className="-mt-3 mb-5 text-ink3">{hint}</p>}

          {(q.kind === 'text' || q.kind === 'email') && (
            <TextField srLabel label={q.label.replace(/\{\{\w+\}\}/g, 'household')} value={(v as string) ?? ''} onChange={set} autoFocus
              type={q.kind === 'email' ? 'email' : 'text'} inputMode={q.kind === 'email' ? 'email' : 'text'}
              autoComplete={q.id === 'name' ? 'name' : q.kind === 'email' ? 'email' : 'off'} placeholder={q.placeholder} {...common} />
          )}
          {q.kind === 'number' && (
            <TextField srLabel label={q.label.replace(/\{\{(\w+)\}\}/g, '$1')} value={(v as string) ?? ''} onChange={(x) => set(x.replace(/[^\d,.]/g, ''))} autoFocus
              inputMode="numeric" prefix={q.prefix} placeholder={q.placeholder} {...common} />
          )}
          {q.kind === 'date' && (
            <TextField srLabel label={q.label} type="date" value={(v as string) ?? ''} onChange={set} max={new Date().toISOString().slice(0, 10)} autoComplete="bday" {...common} />
          )}
          {q.kind === 'textarea' && <TextField srLabel multiline label={q.label} value={(v as string) ?? ''} onChange={set} {...common} />}
          {(q.kind === 'choice' || q.kind === 'multi' || q.kind === 'consent') && (
            <>
              <Cards srLegend legend={q.label} name={q.id} options={q.options!} value={v} multi={q.kind === 'multi'} onChange={set}
                describedBy={err ? 'q-err' : undefined} />
              {err && <p id="q-err" role="alert" className="rise mb-0 mt-4 rounded-xl bg-ink px-4 py-3 text-paper">{err}</p>}
            </>
          )}

          <div className="mt-7">
            <button type="button" aria-expanded={showWhy} onClick={() => setShowWhy((w) => !w)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sunk px-4 font-medium text-ink2 transition hover:bg-line">
              <Icon name={showWhy ? 'minus' : 'plus'} /> Why are you asking?
            </button>
            {showWhy && <p className="rise m-0 mt-3 rounded-2xl border border-line bg-paper p-4 text-ink2"><Rich text={q.why} /></p>}
          </div>

          {s.official && (
            <div className="fade mt-5 rounded-2xl border border-dashed border-line2 p-4">
              <p className="m-0 mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink3">Official wording</p>
              <p className="m-0 font-display italic text-ink2"><Rich text={q.official} /></p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={back}><Icon name="back" /> {s.fromReview ? 'Cancel' : 'Back'}</Button>
          <Button type="submit" big>
            {s.fromReview ? 'Save change' : i === qs.length - 1 ? 'Review my answers' : !q.required && isEmpty(v) ? 'Skip' : 'Continue'}
            <Icon name="arrow" className="transition group-hover:translate-x-1" />
          </Button>
          {q.kind !== "textarea" && <span className="hidden text-sm text-ink3 sm:inline">or press Enter</span>}
        </div>
      </form>

      <aside aria-label="What you've told us so far" className="no-print order-first hidden lg:order-none lg:block">
        <div className="sticky top-32 min-w-0 overflow-hidden rounded-3xl border border-line bg-card/80 p-6">
          <div className="mb-5 flex items-center gap-4">
            <ProgressRing value={doneCount / qs.length} label={`${doneCount} of ${qs.length} questions answered`} />
            <div>
              <h2 className="m-0 font-display text-lg font-semibold leading-tight">Your picture so far</h2>
              <p className="m-0 text-sm text-ink3">{doneCount} of {qs.length} answered</p>
            </div>
          </div>
          <div className="grid gap-5">
            {sections.map((sec) => (
              <div key={sec}>
                <h3 className="m-0 mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink3">{sec}</h3>
                <ul className="m-0 grid list-none gap-1 p-0">
                  {qs.filter((x) => x.section === sec).map((x) => {
                    const idx = qs.indexOf(x)
                    const has = !isEmpty(s.answers[x.id])
                    return (
                      <li key={x.id} className="min-w-0">
                        <button type="button" onClick={() => up({ qi: idx })} aria-current={x.id === q.id ? 'step' : undefined}
                          className={cx('flex w-full min-w-0 items-start gap-2.5 rounded-xl px-2 py-1.5 text-left text-sm transition hover:bg-sunk', x.id === q.id && 'bg-sunk font-semibold')}>
                          <span aria-hidden="true" className={cx('mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border', has ? 'border-ink bg-ink text-paper' : 'border-line2')}>
                            {has && <Icon name="check" className="h-2.5 w-2.5" />}
                          </span>
                          <span className="block min-w-0 flex-1 truncate">{has ? formatLabel(x, s.answers[x.id]) : x.label.replace(/\{\{(\w+)\}\}/g, '$1').replace(/\?$/, '')}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
