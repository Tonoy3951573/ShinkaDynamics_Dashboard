import { eyebrow, panelCard, panelChip, panelHeading, panelTitle } from '../../lib/ui'

export function InsightPanel({ compliance, recommendations }) {
  return (
    <section
      className="reveal-on-scroll grid gap-6 xl:grid-cols-2"
      style={{ '--reveal-delay': '180ms' }}
    >
      <article className={panelCard}>
        <div className={panelHeading}>
          <div>
            <p className={eyebrow}>Governance</p>
            <h3 className={panelTitle}>Policy safeguards</h3>
          </div>
          <span className={panelChip}>Human review first</span>
        </div>
        <div className="grid gap-3">
          {compliance.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-3"
            >
              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[color:var(--accent-blue)]"></span>
              <p className="text-sm leading-6 text-[color:var(--text)]">{item}</p>
            </div>
          ))}
        </div>
      </article>
      <article className={panelCard}>
        <div className={panelHeading}>
          <div>
            <p className={eyebrow}>Recommended Actions</p>
            <h3 className={panelTitle}>Coaching and optimization</h3>
          </div>
          <span className={panelChip}>Next best moves</span>
        </div>
        <div className="grid gap-3">
          {recommendations.map((item) => (
            <article
              key={item.title}
              className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-4"
            >
              <strong className="text-[color:var(--text)]">{item.title}</strong>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.detail}</p>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}
