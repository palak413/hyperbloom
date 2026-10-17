import { INCOME_LIMIT, QUESTIONS, type Answers, type Question, type Triage } from './data'

export const visibleQuestions = (a: Answers, t: Triage) =>
  QUESTIONS.filter((q) => !q.showIf || q.showIf(a, t))

export const isEmpty = (v: string | string[] | undefined) =>
  v === undefined || (Array.isArray(v) ? v.length === 0 : v.trim() === '')

export function validate(q: Question, v: string | string[] | undefined): string | null {
  if (isEmpty(v)) {
    return q.required
      ? q.kind === 'choice' || q.kind === 'consent'
        ? 'Please choose an option to continue.'
        : 'We need an answer here before we can move on.'
      : null
  }
  const s = Array.isArray(v) ? '' : (v as string).trim()
  switch (q.kind) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? null : 'That doesn’t look like an email yet — it should look like name@example.com.'
    case 'number': {
      const n = Number(s.replace(/,/g, ''))
      if (Number.isNaN(n)) return 'Please use numbers only.'
      if (q.integer && !Number.isInteger(n)) return 'Please enter a whole number, like 3.'
      if (q.min !== undefined && n < q.min) return `Please enter ${q.min} or more.`
      if (q.max !== undefined && n > q.max) return `That seems high. Please enter ${q.max.toLocaleString()} or less.`
      return null
    }
    case 'date': {
      const d = new Date(s + 'T00:00:00')
      if (Number.isNaN(d.getTime())) return 'Please enter a full date.'
      const now = new Date()
      if (d > now) return 'That date is in the future.'
      if (d.getFullYear() < 1900) return 'Please check the year.'
      const adult = new Date(d.getFullYear() + 18, d.getMonth(), d.getDate())
      return adult <= now ? null : 'You need to be 18 or older to apply. A parent or guardian can apply for you.'
    }
    case 'text':
      return s.length < 2 ? 'Please enter at least two characters.' : null
    default:
      return null
  }
}

export const num = (v: string | string[] | undefined) => Number(String(v ?? '').replace(/,/g, '')) || 0
export const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

export function summary(a: Answers, t: Triage): string {
  const size = num(a.size)
  const people = size === 1 ? 'one person' : `${size} people`
  const first = String(a.name ?? 'You').split(' ')[0]
  const ask =
    t.situation === 'behind'
      ? `help covering ${money(num(a.owed))} in rent you owe`
      : t.situation === 'moving'
        ? `${money(num(a.deposit))} toward a deposit and first month`
        : 'help keeping up with your rent'
  return `${first}, you’re asking for ${ask}. Your household of ${people} earns about ${money(num(a.income))} a month before taxes${t.situation !== 'moving' ? ` and pays ${money(num(a.rent))} in rent` : ''}. Payment would go directly to ${a.landlord || 'your landlord'}, and we’ll update you by ${a.contact === 'mail' ? 'paper mail' : a.contact === 'text' ? 'text message' : 'email'}.`
}

export function incomeCheck(a: Answers) {
  const limit = INCOME_LIMIT(num(a.size))
  const inc = num(a.income)
  return { limit, income: inc, over: inc > limit }
}

export const refNumber = () => 'CF-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000)

export function formatLabel(q: Question, v: string | string[] | undefined): string {
  if (isEmpty(v)) return 'Skipped'
  if (q.kind === 'number') return (q.prefix ?? '') + num(v).toLocaleString('en-US')
  if (q.kind === 'multi' || q.kind === 'choice' || q.kind === 'consent') {
    const vals = Array.isArray(v) ? v : [v as string]
    return vals.map((x) => q.options?.find((o) => o.value === x)?.label ?? x).join(', ')
  }
  if (q.kind === 'date') return new Date((v as string) + 'T00:00:00').toLocaleDateString('en-US', { dateStyle: 'long' })
  return v as string
}

export const plain = (s: string) => s.replace(/\{\{(\w+)\}\}/g, (_m, k: string) => ({ household: 'household', gross: 'gross income', arrears: 'rent owed', lease: 'lease', attest: 'declaration' } as Record<string, string>)[k] ?? k)
