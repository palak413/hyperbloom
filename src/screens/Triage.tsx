import type { Ctx } from '../state'
import { SITUATIONS } from '../data'
import { Cards } from '../fields'
import { Button, Icon } from '../ui'

export default function Triage({ s, up, go }: Ctx) {
  const t = s.triage
  const set = (p: Partial<typeof t>) => up({ triage: { ...t, ...p } })
  const ready = t.county && t.adult && t.situation
  const next = () => {
    if (t.county === 'no' || t.adult === 'no') go('out')
    else go('docs')
  }
  return (
    <div className="mx-auto max-w-2xl">
      <h1 data-focus tabIndex={-1} className="rise m-0 font-display text-4xl font-semibold leading-tight outline-none sm:text-5xl">
        First, three quick questions.
      </h1>
      <p className="mb-10 mt-4 text-xl text-ink2">They tell us what you’ll need to bring, so you never gather paperwork you don’t need.</p>
      <form className="grid grid-cols-[minmax(0,1fr)] gap-10" onSubmit={(e) => { e.preventDefault(); if (ready) next() }}>
        <Cards legend="1. Do you live in Riverside County?" name="county" value={t.county} onChange={(v) => set({ county: v as 'yes' | 'no' })}
          options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No, or I’m not sure' }]} />
        <Cards legend="2. Are you 18 or older?" name="adult" value={t.adult} onChange={(v) => set({ adult: v as 'yes' | 'no' })}
          options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />
        <Cards legend="3. Which sounds most like your situation?" name="situation" value={t.situation} onChange={(v) => set({ situation: v as typeof t.situation })}
          options={SITUATIONS} />
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" big disabled={!ready}>See what I’ll need <Icon name="arrow" className="transition group-hover:translate-x-1" /></Button>
          {!ready && <span className="text-ink3" aria-live="polite">Answer all three to continue.</span>}
        </div>
      </form>
    </div>
  )
}
