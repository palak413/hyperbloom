import type { Ctx } from '../state'
import { DOCS } from '../data'
import { Button, Icon } from '../ui'
import { formatLabel, incomeCheck, money, plain, refNumber, summary, validate, visibleQuestions } from '../lib'

export default function Review({ s, go }: Ctx) {
  const qs = visibleQuestions(s.answers, s.triage)
  const problems = qs.filter((q) => validate(q, s.answers[q.id]))
  const sections = [...new Set(qs.map((q) => q.section))]
  const inc = incomeCheck(s.answers)
  const docs = DOCS.filter((d) => !d.showIf || d.showIf(s.triage))
  const edit = (id: string) => go('ask', { qi: qs.findIndex((q) => q.id === id), fromReview: true, editFrom: { id, value: s.answers[id] } })
  const submit = () => go('done', { ref: s.ref ?? refNumber(), submittedAt: s.submittedAt ?? new Date().toISOString() })
  const slug = (x: string) => x.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return (
    <div className="mx-auto max-w-3xl">
      <h1 data-focus tabIndex={-1} className="rise m-0 font-display text-4xl font-semibold leading-tight outline-none sm:text-5xl">One last look.</h1>
      <p className="mb-8 mt-4 text-xl text-ink2">Here’s what we understood, in our own words first. Anything wrong? Change it with one tap.</p>

      <section aria-labelledby="sum" className="rise rounded-[2rem] bg-ink p-7 text-paper on-dark sm:p-10">
        <h2 id="sum" className="m-0 mb-3 text-xs font-semibold uppercase tracking-[0.16em] opacity-70">In plain English</h2>
        <p className="m-0 font-display text-2xl leading-snug sm:text-3xl">{summary(s.answers, s.triage)}</p>
      </section>

      {inc.over && (
        <p role="note" className="rise mt-5 flex gap-3 rounded-2xl border border-ink bg-card p-5">
          <Icon name="clock" className="mt-1" />
          <span>Heads up: your income of {money(inc.income)} is above the usual limit of {money(inc.limit)} a month for your household size. That doesn’t block you from applying — a caseworker makes the final call, and exceptions exist.</span>
        </p>
      )}

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6">
        {sections.map((sec) => (
          <section key={sec} aria-labelledby={'s-' + slug(sec)} className="rounded-3xl border border-line bg-card">
            <h2 id={'s-' + slug(sec)} className="m-0 border-b border-line px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink3">{sec}</h2>
            <ul className="m-0 list-none divide-y divide-line p-0">
              {qs.filter((q) => q.section === sec).map((q) => {
                const bad = validate(q, s.answers[q.id])
                return (
                  <li key={q.id} className="flex min-w-0 items-start justify-between gap-4 px-6 py-4">
                    <div className="min-w-0">
                      <p className="m-0 text-sm text-ink3">{plain(q.label)}</p>
                      <p className="m-0 mt-0.5 break-words text-lg font-medium">{formatLabel(q, s.answers[q.id])}</p>
                      {bad && <p role="alert" className="m-0 mt-1 text-sm font-semibold underline">{bad}</p>}
                    </div>
                    <button type="button" onClick={() => edit(q.id)} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-line2 px-4 text-sm font-medium hover:border-ink">
                      <Icon name="edit" /> Change<span className="sr-only">: {plain(q.label)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
        <section aria-labelledby="dd" className="rounded-3xl border border-line bg-card">
          <h2 id="dd" className="m-0 border-b border-line px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink3">Documents</h2>
          <ul className="m-0 list-none divide-y divide-line p-0">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <span className="font-medium">{d.label}</span>
                <span className="text-ink2">{s.docs[d.id] === 'have' ? 'Ready' : 'To bring later'}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => go('ask', { qi: qs.length - 1, fromReview: false })}><Icon name="back" /> Back</Button>
        <Button big disabled={problems.length > 0} onClick={submit}>Send my application <Icon name="arrow" className="transition group-hover:translate-x-1" /></Button>
        {problems.length > 0 && <span className="text-ink2" role="status">Fix {problems.length} item{problems.length > 1 ? 's' : ''} above to send.</span>}
      </div>
    </div>
  )
}
