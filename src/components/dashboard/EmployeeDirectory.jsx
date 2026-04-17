import { useNavigate } from 'react-router-dom'
import { cn, emptyState, eyebrow, metricLabel, panelCard, panelChip, panelHeading, panelTitle } from '../../lib/ui'

export function EmployeeDirectory({ employees }) {
  const navigate = useNavigate()

  return (
    <section className={cn(panelCard, 'reveal-on-scroll is-visible')}>
      <div className={panelHeading}>
        <div>
          <p className={eyebrow}>Employee Directory</p>
          <h3 className={panelTitle}>Searchable performance list</h3>
        </div>
        <span className={panelChip}>Focused operations workflow</span>
      </div>

      {employees.length === 0 ? (
        <div className={emptyState}>
          <strong className="block text-[color:var(--text)]">No employees match the current filters.</strong>
          <span className="mt-2 block text-sm text-[color:var(--muted)]">
            Try widening the search or lowering the score threshold.
          </span>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {employees.map((employee, index) => (
            <button
              key={employee.name}
              className="rounded-[26px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-5 text-left transition hover:-translate-y-1 hover:border-[color:var(--line-strong)] hover:bg-[color:var(--bg-strong)] hover:[box-shadow:0_18px_34px_rgba(27,35,48,0.08)]"
              type="button"
              onClick={() => {
                if (employee.profile?.employeeId) {
                  navigate(`/employees/${employee.profile.employeeId}`)
                }
              }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--accent-blue-soft)] font-bold text-[color:var(--accent-blue)]">
                    {employee.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div>
                    <strong className="block text-[color:var(--text)]">{employee.name}</strong>
                    <span className="text-sm text-[color:var(--muted)]">
                      Rank {String(index + 1).padStart(2, '0')} - {employee.role}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <strong className="block text-2xl font-bold text-[color:var(--text)]">
                    {employee.score}
                  </strong>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      employee.delta.startsWith('-')
                        ? 'text-[color:var(--accent-red)]'
                        : 'text-[color:var(--accent-emerald)]',
                    )}
                  >
                    {employee.delta} this week
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-[color:var(--text)]">{employee.strengths}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] bg-[color:var(--bg-strong)] p-4">
                  <span className={metricLabel}>Facial</span>
                  <strong className="mt-2 block text-[color:var(--text)]">
                    {employee.metrics?.facialExpression ?? '--'}
                  </strong>
                </div>
                <div className="rounded-[20px] bg-[color:var(--bg-strong)] p-4">
                  <span className={metricLabel}>Verbal</span>
                  <strong className="mt-2 block text-[color:var(--text)]">
                    {employee.metrics?.verbalExpression ?? '--'}
                  </strong>
                </div>
                <div className="rounded-[20px] bg-[color:var(--bg-strong)] p-4">
                  <span className={metricLabel}>Greeting</span>
                  <strong className="mt-2 block text-[color:var(--text)]">
                    {employee.metrics?.greetingBehavior ?? '--'}
                  </strong>
                </div>
                <div className="rounded-[20px] bg-[color:var(--bg-strong)] p-4">
                  <span className={metricLabel}>Response</span>
                  <strong className="mt-2 block text-[color:var(--text)]">
                    {employee.metrics?.responseTime ?? '--'}
                  </strong>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[color:var(--accent-blue-soft)] px-3 py-1.5 text-xs font-bold text-[color:var(--pill-neutral-text)]">
                  Interactions today: {employee.info?.interactionsToday ?? '--'}
                </span>
                <span className="rounded-full bg-[color:var(--accent-red-soft)] px-3 py-1.5 text-xs font-bold text-[color:var(--pill-alert-text)]">
                  Risk level: {employee.info?.riskLevel ?? '--'}
                </span>
                <span className="rounded-full bg-[color:var(--accent-emerald-soft)] px-3 py-1.5 text-xs font-bold text-[color:var(--pill-good-text)]">
                  Peak station: {employee.info?.peakStation ?? '--'}
                </span>
                <span className="rounded-full bg-[color:var(--bg-strong)] px-3 py-1.5 text-xs font-bold text-[color:var(--text)]">
                  Last coaching: {employee.info?.lastCoaching ?? '--'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
