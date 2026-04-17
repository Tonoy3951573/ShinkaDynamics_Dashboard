import { cn, emptyState, eyebrow, ghostButton, metricBlock, metricLabel, metricValue, panelCard, panelChip, panelHeading, panelTitle } from '../../lib/ui'

export function EmployeeProfilePage({ employee, onBack }) {
  if (!employee) {
    return (
      <section className={cn(panelCard, 'reveal-on-scroll is-visible')}>
        <div className={emptyState}>
          <strong className="block text-[color:var(--text)]">No employee selected.</strong>
          <span className="mt-2 block text-sm text-[color:var(--muted)]">
            Select an employee from the employee list to view full details.
          </span>
        </div>
      </section>
    )
  }

  const initials = employee.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <section className="reveal-on-scroll is-visible space-y-6">
      <div className={cn(panelCard, 'overflow-hidden')}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button className={ghostButton} type="button" onClick={onBack}>
            Back to employee list
          </button>
          <span className={panelChip}>Employee profile</span>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--accent-blue-soft)] text-lg font-bold text-[color:var(--accent-blue)]">
            {initials}
          </span>
          <div>
            <h3 className="font-display text-3xl font-bold tracking-[-0.04em] text-[color:var(--text)]">
              {employee.name}
            </h3>
            <p className="mt-1 text-[color:var(--muted)]">{employee.role}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className={metricBlock}>
            <span className={metricLabel}>Overall score</span>
            <strong className={metricValue}>{employee.score}</strong>
          </div>
          <div className={metricBlock}>
            <span className={metricLabel}>Weekly delta</span>
            <strong className={metricValue}>{employee.delta}</strong>
          </div>
          <div className={metricBlock}>
            <span className={metricLabel}>Employee ID</span>
            <strong className={metricValue}>{employee.profile?.employeeId ?? 'N/A'}</strong>
          </div>
          <div className={metricBlock}>
            <span className={metricLabel}>Risk level</span>
            <strong className={metricValue}>{employee.info?.riskLevel ?? 'N/A'}</strong>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className={panelCard}>
          <div className={panelHeading}>
            <div>
              <p className={eyebrow}>Personal Stats</p>
              <h3 className={panelTitle}>Behavior metrics</h3>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={metricBlock}>
              <span className={metricLabel}>Facial expression</span>
              <strong className={metricValue}>{employee.metrics?.facialExpression ?? '--'}</strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Verbal expression</span>
              <strong className={metricValue}>{employee.metrics?.verbalExpression ?? '--'}</strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Greeting behavior</span>
              <strong className={metricValue}>{employee.metrics?.greetingBehavior ?? '--'}</strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Response time</span>
              <strong className={metricValue}>{employee.metrics?.responseTime ?? '--'}</strong>
            </div>
          </div>
          <p className="mt-5 rounded-[22px] bg-[color:var(--bg-panel)] p-4 text-sm leading-6 text-[color:var(--text)]">
            {employee.strengths}
          </p>
        </article>

        <article className={panelCard}>
          <div className={panelHeading}>
            <div>
              <p className={eyebrow}>Employee Info</p>
              <h3 className={panelTitle}>Operational details</h3>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={metricBlock}>
              <span className={metricLabel}>Shift</span>
              <strong className={metricValue}>{employee.profile?.shift ?? 'N/A'}</strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Tenure</span>
              <strong className={metricValue}>{employee.profile?.tenure ?? 'N/A'}</strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Supervisor</span>
              <strong className={metricValue}>{employee.profile?.supervisor ?? 'N/A'}</strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Peak station</span>
              <strong className={metricValue}>{employee.info?.peakStation ?? 'N/A'}</strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Interactions today</span>
              <strong className={metricValue}>{employee.info?.interactionsToday ?? 'N/A'}</strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Last coaching</span>
              <strong className={metricValue}>{employee.info?.lastCoaching ?? 'N/A'}</strong>
            </div>
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className={panelCard}>
          <div className={panelHeading}>
            <div>
              <p className={eyebrow}>Weekly Trend</p>
              <h3 className={panelTitle}>Score by day</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(employee.profile?.weeklyScores ?? []).map((item) => (
              <div
                key={item.day}
                className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-4"
              >
                <span className={metricLabel}>{item.day}</span>
                <strong className={metricValue}>{item.score}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className={panelCard}>
          <div className={panelHeading}>
            <div>
              <p className={eyebrow}>Recent Sessions</p>
              <h3 className={panelTitle}>Latest monitored interactions</h3>
            </div>
          </div>
          <div className="grid gap-3">
            {(employee.profile?.recentSessions ?? []).map((session) => (
              <article
                key={`${session.time}-${session.station}`}
                className="flex flex-col gap-3 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <strong className="block text-[color:var(--text)]">{session.time}</strong>
                  <span className="text-sm text-[color:var(--muted)]">{session.station}</span>
                </div>
                <div>
                  <strong className="block text-[color:var(--text)]">Score {session.score}</strong>
                  <span className="text-sm text-[color:var(--muted)]">{session.note}</span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </div>

      <article className={panelCard}>
        <div className={panelHeading}>
          <div>
            <p className={eyebrow}>Certifications</p>
            <h3 className={panelTitle}>Training records</h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(employee.profile?.certifications ?? []).map((item) => (
            <span
              key={item}
              className="rounded-full bg-[color:var(--criteria-chip-bg)] px-3 py-1.5 text-xs font-bold text-[color:var(--criteria-chip-text)]"
            >
              {item}
            </span>
          ))}
        </div>
      </article>
    </section>
  )
}
