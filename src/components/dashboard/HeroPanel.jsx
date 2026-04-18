import { ScorePill } from './ScorePill'
import { cn, surfaceCard } from '../../lib/ui'

const progressToneClasses = {
  emerald: 'bg-[linear-gradient(90deg,var(--accent-emerald),#42d0ab)]',
  blue: 'bg-[linear-gradient(90deg,var(--accent-blue),#7eaaff)]',
  amber: 'bg-[linear-gradient(90deg,var(--accent-amber),#f0c579)]',
  good: 'bg-[linear-gradient(90deg,var(--accent-emerald),#42d0ab)]',
  neutral: 'bg-[linear-gradient(90deg,var(--accent-blue),#7eaaff)]',
  alert: 'bg-[linear-gradient(90deg,var(--accent-amber),#f0c579)]',
}

export function HeroPanel({ site, summary, scoreDistribution }) {
  return (
    <section
      className={cn(
        surfaceCard,
        'reveal-on-scroll is-visible grid gap-6 overflow-hidden p-5 sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_auto] lg:p-7 xl:grid-cols-[minmax(0,1.15fr)_auto_minmax(18rem,0.8fr)]',
      )}
    >
      <div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--bg-chip)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[color:var(--muted)]">
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--accent-emerald)]"></span>
          {site.label}
        </div>
        <h2 className="mt-4 font-display text-[clamp(2.1rem,4vw,3.6rem)] font-bold leading-[0.95] tracking-[-0.05em] text-[color:var(--text)]">
          {site.name}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)]">
          {summary.insight}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-2 text-sm font-semibold text-[color:var(--text)]">
            {site.updatedAt}
          </span>
          <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-2 text-sm font-semibold text-[color:var(--text)]">
            {site.coverage}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-start gap-4 lg:items-center lg:justify-center">
        <div className="grid h-40 w-40 place-items-center rounded-full border-[12px] border-[color:var(--hero-ring-rest)] bg-[color:var(--hero-ring-core)] [box-shadow:0_18px_40px_var(--hero-ring-core-shadow)]">
          <div className="text-center">
            <strong className="block font-display text-5xl font-bold tracking-[-0.05em] text-[color:var(--text)]">
              {summary.score}
            </strong>
            <span className="text-sm font-semibold text-[color:var(--muted)]">
              Overall score
            </span>
          </div>
        </div>
        <ScorePill value={summary.trend} label="vs last week" tone="good" />
      </div>
      <div className="grid gap-4">
        {scoreDistribution.map((item, index) => (
          <div
            key={item.label}
            className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-4"
            style={{ '--item-delay': `${index * 110}ms` }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[color:var(--muted)]">
                {item.label}
              </span>
              <strong className="text-lg font-bold text-[color:var(--text)]">
                {item.value}%
              </strong>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[color:var(--metric-track)]">
              <div
                className={cn(
                  'h-full origin-left rounded-full motion-safe:animate-[hero-bar-grow_900ms_cubic-bezier(0.22,1,0.36,1)_both]',
                  progressToneClasses[item.tone] ?? progressToneClasses.blue,
                )}
                style={{
                  width: `${item.value}%`,
                  animationDelay: `${index * 140 + 120}ms`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
