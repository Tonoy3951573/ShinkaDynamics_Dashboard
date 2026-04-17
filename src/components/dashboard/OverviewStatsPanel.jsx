import { cn, eyebrow, panelCard, panelChip, panelHeading, panelTitle } from '../../lib/ui'

const metricToneClasses = {
  good: 'bg-[color:var(--accent-emerald-soft)] text-[color:var(--pill-good-text)]',
  neutral: 'bg-[color:var(--accent-blue-soft)] text-[color:var(--pill-neutral-text)]',
  alert: 'bg-[color:var(--accent-amber-soft)] text-[color:var(--accent-amber)]',
}

export function OverviewStatsPanel({ stats, highlights }) {
  return (
    <section
      className="reveal-on-scroll grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
      style={{ '--reveal-delay': '100ms' }}
    >
      <article className={panelCard}>
        <div className={panelHeading}>
          <div>
            <p className={eyebrow}>Operational Metrics</p>
            <h3 className={panelTitle}>Branch health snapshot</h3>
          </div>
          <span className={panelChip}>Executive summary</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((item) => (
            <article
              key={item.label}
              className={cn(
                'rounded-[24px] border border-[color:var(--line)] p-4',
                metricToneClasses[item.tone] ?? metricToneClasses.neutral,
              )}
            >
              <span className="text-xs font-black uppercase tracking-[0.14em] opacity-80">
                {item.label}
              </span>
              <strong className="mt-3 block text-2xl font-bold">{item.value}</strong>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text)]/80">{item.detail}</p>
            </article>
          ))}
        </div>
      </article>

      <article className={panelCard}>
        <div className={panelHeading}>
          <div>
            <p className={eyebrow}>Management Focus</p>
            <h3 className={panelTitle}>Today&apos;s highlights</h3>
          </div>
          <span className={panelChip}>Actionable summary</span>
        </div>
        <div className="grid gap-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-4"
            >
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--muted)]">
                {item.title}
              </span>
              <strong className="mt-2 block text-xl font-bold text-[color:var(--text)]">
                {item.value}
              </strong>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.detail}</p>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}
