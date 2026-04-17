import { emptyState, eyebrow, panelCard, panelChip, panelHeading, panelTitle } from '../../lib/ui'

export function TeamSpotlight({ employees }) {
  return (
    <section className={panelCard}>
      <div className={panelHeading}>
        <div>
          <p className={eyebrow}>Team Spotlight</p>
          <h3 className={panelTitle}>Employee performance board</h3>
        </div>
        <span className={panelChip}>Ranked by AI score</span>
      </div>
      <div className="grid gap-4">
        {employees.length === 0 ? (
          <div className={emptyState}>
            <strong className="block text-[color:var(--text)]">
              No employees match the current controls.
            </strong>
            <span className="mt-2 block text-sm text-[color:var(--muted)]">
              Clear the search or lower the minimum score to expand results.
            </span>
          </div>
        ) : (
          employees.map((employee, index) => (
            <article
              key={employee.name}
              className="flex gap-4 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-4"
            >
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-[color:var(--spotlight-rank-bg)] text-sm font-black tracking-[0.12em] text-white">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <strong className="block text-[color:var(--text)]">{employee.name}</strong>
                    <p className="text-sm text-[color:var(--muted)]">{employee.role}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <strong className="block text-xl font-bold text-[color:var(--text)]">
                      {employee.score}
                    </strong>
                    <span className="text-sm text-[color:var(--muted)]">{employee.delta} this week</span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-[color:var(--text)]">{employee.strengths}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                  {employee.info?.peakStation ?? 'No station set'} - Risk {employee.info?.riskLevel ?? 'N/A'}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
