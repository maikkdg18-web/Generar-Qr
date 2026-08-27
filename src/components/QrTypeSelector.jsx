import { QR_TYPES } from '../lib/qrContent'
import { LinkIcon, MailIcon, TextIcon, UserIcon, WifiIcon } from './icons'

export const TYPE_ICONS = {
  url: LinkIcon,
  wifi: WifiIcon,
  vcard: UserIcon,
  text: TextIcon,
  email: MailIcon,
}

export default function QrTypeSelector({ value, onChange, disabled }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo de QR">
      {QR_TYPES.map((type) => {
        const Icon = TYPE_ICONS[type.id]
        const active = value === type.id
        return (
          <button
            key={type.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(type.id)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-300/50'
                : 'bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-slate-800 dark:text-violet-300 dark:hover:bg-slate-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {type.label}
          </button>
        )
      })}
    </div>
  )
}
