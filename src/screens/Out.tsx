import type { Ctx } from '../state'
import { Button, Icon } from '../ui'

export default function Out({ s, go }: Ctx) {
  const minor = s.triage.adult === 'no'
  return (
    <div className="mx-auto max-w-2xl">
      <h1 data-focus tabIndex={-1} className="rise m-0 font-display text-4xl font-semibold leading-tight outline-none sm:text-5xl">
        {minor ? 'A parent or guardian can apply for you.' : 'This program may not be the right fit.'}
      </h1>
      <p className="mb-8 mt-4 text-xl text-ink2">
        {minor
          ? 'Riverside Rent Relief accepts applications from adults. The good news: a parent, guardian or caseworker can start one on your behalf using this same page.'
          : 'Riverside Rent Relief only serves people who live in Riverside County. We’d rather tell you now than after eight minutes of questions.'}
      </p>
      <div className="rounded-3xl border border-line bg-card p-6">
        <h2 className="m-0 mb-3 font-display text-xl font-semibold">Where to look instead</h2>
        <ul className="m-0 grid list-none gap-3 p-0 text-ink2">
          <li className="flex gap-3"><Icon name="check" className="mt-1" /> Call 211 to find rent help by address, any time of day.</li>
          <li className="flex gap-3"><Icon name="check" className="mt-1" /> Search your own county’s “emergency rental assistance” page.</li>
          <li className="flex gap-3"><Icon name="check" className="mt-1" /> A local legal aid office can help with eviction notices for free.</li>
        </ul>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => go('triage')}><Icon name="back" /> Change my answers</Button>
        <Button variant="outline" onClick={() => go('welcome')}>Back to start</Button>
      </div>
    </div>
  )
}
