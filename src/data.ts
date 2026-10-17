export type Answers = Record<string, string | string[]>

export interface Triage {
  county?: 'yes' | 'no'
  adult?: 'yes' | 'no'
  situation?: 'behind' | 'strain' | 'moving'
}

export interface Question {
  id: string
  section: string
  label: string
  /** The original, legal-style wording of the same question. */
  official: string
  why: string
  hint?: string
  kind: 'text' | 'email' | 'date' | 'number' | 'choice' | 'multi' | 'textarea' | 'consent'
  options?: { value: string; label: string; note?: string }[]
  required: boolean
  integer?: boolean
  min?: number
  max?: number
  prefix?: string
  placeholder?: string
  showIf?: (a: Answers, t: Triage) => boolean
}

export const GLOSSARY: Record<string, { term: string; def: string }> = {
  household: {
    term: 'household',
    def: 'Everyone who lives with you and shares money or bills — you, your partner, your children, and anyone else you support. Roommates who pay their own share separately usually do not count.',
  },
  gross: {
    term: 'gross income',
    def: 'Money you earn before taxes and other deductions come out. It is the bigger number at the top of your pay stub, not the amount that lands in your bank.',
  },
  arrears: {
    term: 'rent owed',
    def: 'Rent that was due but has not been paid yet. The official forms call this "arrears".',
  },
  lease: {
    term: 'lease',
    def: 'The agreement you signed with your landlord. It lists the rent, the address and the dates. A written or e-signed copy both work.',
  },
  attest: {
    term: 'declaration',
    def: 'A promise that what you wrote is true as far as you know. Honest mistakes are fine; we only worry about deliberately false answers.',
  },
}

export const SITUATIONS = [
  { value: 'behind', label: 'I’m behind on rent', note: 'I owe my landlord money for past months.' },
  { value: 'strain', label: 'I’m paying, but it’s a strain', note: 'I’m current but at risk of falling behind.' },
  { value: 'moving', label: 'I’m moving', note: 'I need help with a deposit or first month.' },
] as const

export const QUESTIONS: Question[] = [
  {
    id: 'name', section: 'About you', kind: 'text', required: true,
    label: 'What’s your full name?',
    official: 'Legal name of the Applicant, as it appears on government-issued identification.',
    why: 'We match this to your ID so your payment goes to the right person.',
    hint: 'Use the name on your ID, even if you go by something else.',
    placeholder: 'e.g. Maria Santos',
  },
  {
    id: 'dob', section: 'About you', kind: 'date', required: true,
    label: 'What’s your date of birth?',
    official: 'Date of birth of the Applicant (MM/DD/YYYY).',
    why: 'Applicants must be 18 or older. We never use your age to rank applications.',
  },
  {
    id: 'email', section: 'About you', kind: 'email', required: true,
    label: 'Where should we send updates?',
    official: 'Electronic mail address designated for official correspondence.',
    why: 'This is where your confirmation and decision will arrive, so please check it’s spelled right.',
    placeholder: 'you@example.com',
  },
  {
    id: 'size', section: 'Your household', kind: 'number', required: true, integer: true, min: 1, max: 12,
    label: 'How many people live in your {{household}}?',
    official: 'Total number of persons comprising the Applicant’s household unit, inclusive of the Applicant.',
    why: 'The amount of help available depends on how many people share your home.',
    hint: 'Count yourself. Enter a number from 1 to 12.',
    placeholder: '3',
  },
  {
    id: 'income', section: 'Your household', kind: 'number', required: true, min: 0, max: 100000, prefix: '$',
    label: 'About how much does your household earn each month, before taxes?',
    official: 'Aggregate monthly {{gross}} receipts of all household members from all sources.',
    why: 'Help goes first to households with the lowest income. A rough number is fine for now — you’ll upload proof later.',
    hint: 'Add everyone’s {{gross}} together. Estimates are okay.',
    placeholder: '2400',
  },
  {
    id: 'sources', section: 'Your household', kind: 'multi', required: false,
    label: 'Where does that money come from?',
    official: 'Identify all sources of household income (select all that apply).',
    why: 'Different income types need different proof. Knowing now saves you a second trip.',
    hint: 'Pick everything that applies.',
    options: [
      { value: 'work', label: 'A job' },
      { value: 'self', label: 'Self-employment or gig work' },
      { value: 'benefits', label: 'Benefits (disability, unemployment, pension)' },
      { value: 'support', label: 'Child or family support' },
      { value: 'none', label: 'No income right now' },
    ],
  },
  {
    id: 'rent', section: 'Your housing', kind: 'number', required: true, min: 1, max: 20000, prefix: '$',
    label: 'How much is your monthly rent?',
    official: 'Contractual monthly rental obligation as stated in the {{lease}}.',
    why: 'We compare your rent to your income to see how much help you may need.',
    hint: 'The base rent only — leave out utilities and parking.',
    placeholder: '1350',
    showIf: (_a, t) => t.situation !== 'moving',
  },
  {
    id: 'owed', section: 'Your housing', kind: 'number', required: true, min: 1, max: 60000, prefix: '$',
    label: 'How much {{arrears}} do you owe right now?',
    official: 'Total amount of rental {{arrears}} outstanding as of the date of application.',
    why: 'This sets the maximum we can pay to your landlord on your behalf.',
    hint: 'Check your landlord’s latest notice or ledger. A close estimate is fine.',
    placeholder: '2700',
    showIf: (_a, t) => t.situation === 'behind',
  },
  {
    id: 'deposit', section: 'Your housing', kind: 'number', required: true, min: 1, max: 20000, prefix: '$',
    label: 'How much do you need for the deposit and first month?',
    official: 'Aggregate amount of security deposit and advance rent required under the prospective {{lease}}.',
    why: 'This sets the amount we request from the program for you.',
    hint: 'Add the deposit and first month together.',
    placeholder: '2700',
    showIf: (_a, t) => t.situation === 'moving',
  },
  {
    id: 'landlord', section: 'Your housing', kind: 'text', required: true,
    label: 'What’s your landlord’s name, or their company?',
    official: 'Name of lessor or property management entity to whom disbursement shall be remitted.',
    why: 'Payments go straight to your landlord, never through you, so we need to know who to pay.',
    placeholder: 'e.g. Riverbend Properties',
  },
  {
    id: 'contact', section: 'Almost done', kind: 'choice', required: true,
    label: 'How would you like us to reach you?',
    official: 'Preferred modality of communication for case correspondence.',
    why: 'We’ll use your preference unless something is urgent.',
    options: [
      { value: 'email', label: 'Email', note: 'Updates arrive in your inbox.' },
      { value: 'text', label: 'Text message', note: 'Short alerts only. We’ll ask for your number later.' },
      { value: 'mail', label: 'Paper mail', note: 'Letters take about a week longer.' },
    ],
  },
  {
    id: 'notes', section: 'Almost done', kind: 'textarea', required: false,
    label: 'Is there anything else we should know?',
    official: 'Supplemental statement of circumstances (optional).',
    why: 'Optional. A caseworker may read this if your application needs a closer look.',
    hint: 'You can skip this. Two or three sentences is plenty.',
  },
  {
    id: 'declare', section: 'Almost done', kind: 'consent', required: true,
    label: 'Please confirm that your answers are true to the best of your knowledge.',
    official: 'Applicant hereby attests, under penalty of perjury, that all information provided is true, accurate and complete.',
    why: 'This is a standard {{attest}}. Honest mistakes are okay — you can fix anything before we decide.',
    options: [{ value: 'yes', label: 'Yes, what I’ve told you is true as far as I know.' }],
  },
]

export interface DocItem {
  id: string
  label: string
  detail: string
  how: string
  showIf?: (t: Triage) => boolean
}

export const DOCS: DocItem[] = [
  {
    id: 'id', label: 'A photo ID',
    detail: 'Driver’s license, state ID, passport, or a school or work ID.',
    how: 'No ID? A library card with a utility bill, or a letter from a shelter, also works.',
  },
  {
    id: 'income', label: 'Proof of income',
    detail: 'Your last 30 days: pay stubs, a benefits letter, or a short note from your employer.',
    how: 'Paid in cash? A signed note saying what you earn is accepted.',
  },
  {
    id: 'lease', label: 'Your lease',
    detail: 'The agreement with your landlord. Photos of every page are fine.',
    how: 'Lost it? Ask your landlord for a copy, or tell us and we’ll accept a rent receipt.',
    showIf: (t) => t.situation !== 'moving',
  },
  {
    id: 'notice', label: 'Your landlord’s late-rent notice',
    detail: 'Any letter, email or text saying how much you owe.',
    how: 'A screenshot of the message is enough.',
    showIf: (t) => t.situation === 'behind',
  },
  {
    id: 'newlease', label: 'The new lease or a rental offer',
    detail: 'A signed lease, or a written offer that shows the address and amounts.',
    how: 'A landlord’s email with the price and address works as an offer.',
    showIf: (t) => t.situation === 'moving',
  },
]

export const TIMELINE = [
  { days: 0, title: 'Application received', body: 'You’ll get an email confirmation with your reference number.' },
  { days: 3, title: 'Documents checked', body: 'A caseworker confirms nothing is missing and may message you.' },
  { days: 10, title: 'Decision', body: 'You’ll hear yes, no, or “we need one more thing”.' },
  { days: 17, title: 'Payment to your landlord', body: 'Money goes straight to them, and you’ll get a copy of the receipt.' },
]

export const INCOME_LIMIT = (size: number) => 3200 + 900 * (Math.max(1, size) - 1)
