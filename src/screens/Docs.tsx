import type { Ctx } from '../state'
import { DOCS } from '../data'
import { Button, Icon, cx } from '../ui'

export default function Docs({ s, up, go }: Ctx) {
  const list = DOCS.filter((d) => !d.showIf || d.showIf(s.triage))
  const have = list.filter((d) => s.docs[d.id] === 'have').length
  const set = (id: string, v: 'have' | 'later') => up({ docs: { ...s.docs, [id]: v } })
  return (
    <div className="mx-auto max-w-3xl">
      <h1 data-focus tabIndex={-1} className="rise m-0 font-display text-4xl font-semibold leading-tight outline-none sm:text-5xl">
        Here’s what to bring — {list.length} things.
      </h1>
      <p className="mb-8 mt-4 text-xl text-ink2">
        Tell us what you already have. You don’t need everything today: anything marked “Later” goes onto your receipt as a reminder.
      </p>
      <div className="mb-6 flex items-center gap-4" role="status">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-sunk" aria-hidden="true">
          <div className="h-full rounded-full bg-ink transition-all duration-500" style={{ width: `${(have / list.length) * 100}%` }} />
        </div>
        <span className="text-ink2">{have} of {list.length} ready</span>
      </div>
      <ul className="m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-4 p-0">
        {list.map((d, i) => {
          const v = s.docs[d.id]
          return (
            <li key={d.id} className={cx('rise rounded-3xl border bg-card p-5 transition sm:p-6', v === 'have' ? 'border-ink' : 'border-line')} style={{ animationDelay: `${i * 70}ms` }}>
              <div className="flex items-start gap-4">
                <span className={cx('mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full transition', v === 'have' ? 'bg-ink text-paper' : 'bg-sunk text-ink2')}>
                  <Icon name={v === 'have' ? 'check' : 'file'} className={cx(v === 'have' && 'pop')} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="m-0 font-display text-xl font-semibold">{d.label}</h2>
                  <p className="m-0 mt-1 text-ink2">{d.detail}</p>
                  <details className="mt-2 text-ink2">
                    <summary className="cursor-pointer rounded font-medium text-ink underline decoration-dotted underline-offset-4">Don’t have it?</summary>
                    <p className="mb-0 mt-2">{d.how}</p>
                  </details>
                  <div role="group" aria-label={`Do you have ${d.label.toLowerCase()}?`} className="mt-4 flex flex-wrap gap-2">
                    <button type="button" aria-pressed={v === 'have'} onClick={() => set(d.id, 'have')}
                      className={cx('min-h-11 rounded-full border px-5 font-medium transition', v === 'have' ? 'border-ink bg-ink text-paper' : 'border-line2 hover:border-ink')}>I have it</button>
                    <button type="button" aria-pressed={v === 'later'} onClick={() => set(d.id, 'later')}
                      className={cx('min-h-11 rounded-full border px-5 font-medium transition', v === 'later' ? 'border-ink bg-ink text-paper' : 'border-line2 hover:border-ink')}>I’ll get it later</button>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => go('triage')}><Icon name="back" /> Back</Button>
        <Button big onClick={() => go('ask', { qi: 0, fromReview: false })}>
          Start the questions <Icon name="arrow" className="transition group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  )
}
