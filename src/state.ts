import type { Answers, Triage } from './data'

export type Screen = 'welcome' | 'triage' | 'out' | 'docs' | 'ask' | 'review' | 'done'

export interface State {
  screen: Screen
  triage: Triage
  docs: Record<string, 'have' | 'later'>
  answers: Answers
  qi: number
  fromReview: boolean
  /** The answer as it was before an edit from the review screen, so Cancel can restore it. */
  editFrom?: { id: string; value: string | string[] | undefined } | null
  ref?: string
  submittedAt?: string
  /** Last in-journey screen, so "continue" returns to the right place. */
  last: Screen
  official: boolean
  textSize: number
}

export const INITIAL: State = {
  screen: 'welcome', triage: {}, docs: {}, answers: {}, qi: 0, fromReview: false, last: 'triage', official: false, textSize: 0,
}

export interface Ctx {
  s: State
  up: (p: Partial<State>) => void
  go: (screen: Screen, extra?: Partial<State>) => void
}

const KEY = 'clearform.v1'
export const load = (): State => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...INITIAL, ...JSON.parse(raw) }
  } catch { /* storage unavailable */ }
  return INITIAL
}
export const save = (s: State) => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ } }
export const wipe = () => { try { localStorage.removeItem(KEY) } catch { /* ignore */ } }
