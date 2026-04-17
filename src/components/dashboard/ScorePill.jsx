import { cn } from '../../lib/ui'

const toneClasses = {
  good: 'bg-[color:var(--accent-emerald-soft)] text-[color:var(--pill-good-text)]',
  neutral: 'bg-[color:var(--accent-blue-soft)] text-[color:var(--pill-neutral-text)]',
  alert: 'bg-[color:var(--accent-red-soft)] text-[color:var(--pill-alert-text)]',
}

export function ScorePill({ value, label, tone = 'neutral' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold',
        toneClasses[tone] ?? toneClasses.neutral,
      )}
    >
      <strong>{value}</strong>
      <span>{label}</span>
    </span>
  )
}
