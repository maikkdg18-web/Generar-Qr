const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
const inputClass =
  'w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-violet-900/50'

export function TextField({ label, ...props }) {
  return (
    <div>
      <label className={labelClass} htmlFor={props.id}>
        {label}
      </label>
      <input {...props} className={inputClass} />
    </div>
  )
}

export function TextareaField({ label, ...props }) {
  return (
    <div>
      <label className={labelClass} htmlFor={props.id}>
        {label}
      </label>
      <textarea {...props} className={`${inputClass} resize-none`} />
    </div>
  )
}

export function SelectField({ label, options, ...props }) {
  return (
    <div>
      <label className={labelClass} htmlFor={props.id}>
        {label}
      </label>
      <select {...props} className={inputClass}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
