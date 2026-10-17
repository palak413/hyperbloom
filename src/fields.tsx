import { useId } from 'react'
import { cx, Icon } from './ui'

interface Opt { value: string; label: string; note?: string }

/** Native radios / checkboxes dressed as large, calm cards. Fully keyboard and screen-reader operable. */
export function Cards({ legend, name, options, value, onChange, multi, srLegend, describedBy }: {
  legend: React.ReactNode; name: string; options: readonly Opt[]; value: string | string[] | undefined
  onChange: (v: string | string[]) => void; multi?: boolean; srLegend?: boolean; describedBy?: string
}) {
  const sel = (v: string) => (Array.isArray(value) ? value.includes(v) : value === v)
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0" aria-describedby={describedBy}>
      <legend className={cx('mb-3 font-display text-xl font-semibold', srLegend && 'sr-only')}>{legend}</legend>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
        {options.map((o) => {
          const on = sel(o.value)
          return (
            <label key={o.value} className={cx(
              'group flex min-h-14 cursor-pointer items-start gap-4 rounded-2xl border bg-card p-4 transition duration-200 hover:border-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink',
              on ? 'border-ink shadow-[inset_0_0_0_1px_var(--color-ink)]' : 'border-line',
            )}>
              <input
                className="sr-only" type={multi ? 'checkbox' : 'radio'} name={name} value={o.value} checked={on}
                onChange={() => {
                  if (!multi) return onChange(o.value)
                  const cur = Array.isArray(value) ? value : []
                  onChange(
                    o.value === 'none' ? (on ? [] : ['none'])
                      : on ? cur.filter((x) => x !== o.value) : [...cur.filter((x) => x !== 'none'), o.value],
                  )
                }}
              />
              <span aria-hidden="true" className={cx('mt-0.5 grid h-6 w-6 shrink-0 place-items-center border-2 transition', multi ? 'rounded-md' : 'rounded-full', on ? 'border-ink bg-ink text-paper' : 'border-line2')}>
                {on && <Icon name="check" className="pop h-3.5 w-3.5" />}
              </span>
              <span>
                <span className="block text-[1.05rem] font-medium leading-snug">{o.label}</span>
                {o.note && <span className="mt-0.5 block text-[0.95rem] text-ink3">{o.note}</span>}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function TextField({ label, hint, error, prefix, value, onChange, type = 'text', inputMode, placeholder, autoComplete, max, srLabel, multiline, autoFocus }: {
  label: React.ReactNode; hint?: React.ReactNode; error?: string | null; prefix?: string; value: string
  onChange: (v: string) => void; type?: string; inputMode?: 'numeric' | 'email' | 'text'; placeholder?: string
  autoComplete?: string; max?: string; srLabel?: boolean; multiline?: boolean; autoFocus?: boolean
}) {
  const id = useId()
  const common = {
    id, value, placeholder, autoFocus, 'aria-invalid': error ? true : undefined,
    'aria-describedby': [hint && id + '-h', error && id + '-e'].filter(Boolean).join(' ') || undefined,
    className: cx(
      'w-full rounded-2xl border bg-card px-5 py-4 text-xl outline-none transition placeholder:italic placeholder:text-ink3 focus:border-ink focus:shadow-[0_0_0_3px_var(--color-ink)]',
      error ? 'border-ink' : 'border-line2', prefix && 'pl-11',
    ),
  }
  return (
    <div>
      <label htmlFor={id} className={cx('mb-2 block font-display text-xl font-semibold', srLabel && 'sr-only')}>{label}</label>
      {hint && <p id={id + '-h'} className="mb-3 mt-0 text-ink3">{hint}</p>}
      <div className="relative">
        {prefix && <span aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-ink3">{prefix}</span>}
        {multiline ? (
          <textarea {...common} rows={5} maxLength={600} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input {...common} type={type} inputMode={inputMode} autoComplete={autoComplete} max={max} onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
      {error && (
        <p id={id + '-e'} role="alert" className="rise mb-0 mt-3 flex items-start gap-2 rounded-xl bg-ink px-4 py-3 text-paper">
          <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-paper text-sm font-bold text-ink">!</span>
          {error}
        </p>
      )}
    </div>
  )
}
