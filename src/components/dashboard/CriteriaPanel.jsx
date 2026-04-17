import { eyebrow, panelCard, panelChip, panelHeading, panelTitle } from '../../lib/ui'

export function CriteriaPanel({ criteria }) {
  return (
    <section className={panelCard}>
      <div className={panelHeading}>
        <div>
          <p className={eyebrow}>Evaluation Criteria</p>
          <h3 className={panelTitle}>Behavior scoring model</h3>
        </div>
        <span className={panelChip}>Weighted AI rubric</span>
      </div>
      <div className="grid gap-4">
        {criteria.map((item) => (
          <article
            key={item.title}
            className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="font-display text-lg font-bold text-[color:var(--text)]">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  {item.description}
                </p>
              </div>
              <div className="rounded-[20px] bg-[color:var(--bg-strong)] px-4 py-3 text-right">
                <strong className="block text-2xl font-bold text-[color:var(--text)]">
                  {item.score}
                </strong>
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                  Weight {item.weight}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.metrics.map((metric) => (
                <span
                  key={metric}
                  className="rounded-full bg-[color:var(--criteria-chip-bg)] px-3 py-1.5 text-xs font-bold text-[color:var(--criteria-chip-text)]"
                >
                  {metric}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
