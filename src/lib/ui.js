export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const surfaceCard =
  'rounded-[28px] border border-[color:var(--line)] bg-[color:var(--bg-elevated)] [box-shadow:var(--shadow-md)] backdrop-blur-xl'

export const panelCard = `${surfaceCard} p-5 sm:p-6 lg:p-7`

export const panelHeading =
  'mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'

export const eyebrow =
  'mb-2 text-[0.72rem] font-black uppercase tracking-[0.18em] text-[color:var(--muted)]'

export const panelTitle =
  'font-display text-[1.4rem] font-bold leading-tight tracking-[-0.03em] text-[color:var(--text)]'

export const panelChip =
  'inline-flex items-center rounded-full border border-[color:var(--line)] bg-[color:var(--bg-chip)] px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]'

export const ghostButton =
  'inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-2.5 text-sm font-semibold text-[color:var(--text)] transition hover:-translate-y-0.5 hover:border-[color:var(--line-strong)] hover:bg-[color:var(--bg-strong)]'

export const emptyState =
  'rounded-[24px] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--bg-panel)] px-5 py-6 text-center'

export const metricBlock =
  'rounded-[22px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-4'

export const metricLabel = 'text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]'

export const metricValue = 'mt-2 block text-lg font-bold text-[color:var(--text)]'
