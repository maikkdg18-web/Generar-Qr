import { useTheme } from '../context/ThemeContext'
import { MoonIcon, SunIcon } from './icons'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      className="grid h-9 w-9 place-items-center rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-slate-800 dark:text-violet-300 dark:hover:bg-slate-700"
    >
      {theme === 'dark' ? <SunIcon className="h-4.5 w-4.5" /> : <MoonIcon className="h-4.5 w-4.5" />}
    </button>
  )
}
