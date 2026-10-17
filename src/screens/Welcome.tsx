import type { Ctx } from '../state'
import { Button, Icon, Lens, smooth } from '../ui'

const PROMISES = [
  { t: 'One question at a time', d: 'No walls of fields. Every question says why we’re asking.' },
  { t: 'Official words, translated', d: 'Tap any underlined term. Flip a switch to see the legal text.' },
  { t: 'Saved as you go', d: 'Close the tab, come back tomorrow. Nothing is lost.' },
]

export default function Welcome({ s, go }: Ctx) {
  const started = Boolean(s.ref || Object.keys(s.answers).length > 0 || s.triage.situation || s.last !== 'triage')
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
      <div className="rise">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-1.5 text-sm font-medium text-ink2">
          <Icon name="clock" /> About 8 minutes · Riverside Rent Relief
        </p>
        <h1 className="m-0 font-display text-[clamp(2.4rem,5.6vw,4rem)] font-semibold leading-[0.98] tracking-tight">
          Government forms,<br />finally in <em className="font-medium italic underline decoration-[0.06em] underline-offset-[0.12em]">plain words</em>.
        </h1>
        <p className="mb-8 mt-6 max-w-xl text-xl leading-relaxed text-ink2">
          ClearForm walks you through a real-feeling application — what to bring, what each question means, and what happens next — so nothing is a surprise.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button big onClick={() => go(s.ref ? 'done' : started ? s.last : 'triage')}>
            {s.ref ? 'See your receipt' : started ? 'Continue where you left off' : 'Start your application'} <Icon name="arrow" className="transition group-hover:translate-x-1" />
          </Button>
          <Button variant="ghost" big onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: smooth() })}>How it works</Button>
        </div>
        <p className="mt-5 flex items-center gap-2 text-sm text-ink3"><Icon name="lock" /> Nothing leaves your device. This is a demo with a fictional program.</p>
      </div>
      <div className="rise [animation-delay:120ms]">
        <Lens />
      </div>
      <ul id="how" className="m-0 grid list-none gap-4 p-0 pt-6 sm:grid-cols-3 lg:col-span-2">
        {PROMISES.map((p, i) => (
          <li key={p.t} className="rise rounded-3xl border border-line bg-card p-6" style={{ animationDelay: `${200 + i * 90}ms` }}>
            <span className="mb-4 grid h-9 w-9 place-items-center rounded-full bg-ink font-display text-lg text-paper">{i + 1}</span>
            <h2 className="m-0 mb-1 font-display text-xl font-semibold">{p.t}</h2>
            <p className="m-0 text-ink2">{p.d}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
