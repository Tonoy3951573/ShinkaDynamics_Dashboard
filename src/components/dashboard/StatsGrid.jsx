import { cn, surfaceCard } from '../../lib/ui'

export function StatsGrid({ stats }) {
  return (
    <section
      className="reveal-on-scroll grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      style={{ '--reveal-delay': '80ms' }}
    >
      {stats.map((stat, index) => (
        <article
          key={stat.label}
          className={cn(surfaceCard, 'p-5')}
          style={{ '--item-delay': `${index * 90}ms` }}
        >
          <p className="text-sm font-semibold text-[color:var(--muted)]">
            {stat.label}
          </p>
          <strong className="mt-4 block font-display text-4xl font-bold tracking-[-0.05em] text-[color:var(--text)]">
            {stat.value}
          </strong>
          <span className="mt-2 block text-sm leading-6 text-[color:var(--muted)]">
            {stat.detail}
          </span>
        </article>
      ))}
    </section>
  )
}
