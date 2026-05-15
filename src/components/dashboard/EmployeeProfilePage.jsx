import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Trash2, AlertTriangle } from 'lucide-react'
import {
  cn,
  emptyState,
  eyebrow,
  ghostButton,
  metricBlock,
  metricLabel,
  metricValue,
  panelCard,
  panelChip,
  panelHeading,
  panelTitle,
} from '../../lib/ui'
import { useDashboard } from '../../context/useDashboard'
import { useNavigate } from 'react-router-dom'

export function EmployeeProfilePage({ employee, onBack }) {
  const { removeEmployee } = useDashboard()
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!employee?.profile?.employeeId) return
    setIsDeleting(true)
    const success = await removeEmployee(employee.profile.employeeId)
    setIsDeleting(false)
    if (success) {
      navigate('/employees')
    } else {
      setShowDeleteConfirm(false)
    }
  }

  if (!employee) {
    return (
      <section className="reveal-on-scroll is-visible space-y-6">
        <div className={cn(panelCard, 'overflow-hidden')}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button className={ghostButton} type="button" onClick={onBack}>
              Back to employee list
            </button>
          </div>
          <div className={emptyState}>
            <strong className="block text-[color:var(--text)]">
              No employee found.
            </strong>
            <span className="mt-2 block text-sm text-[color:var(--muted)]">
              The employee you are looking for does not exist or has been removed.
            </span>
          </div>
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

  const ringMetrics = employee.metrics
    ? [
        { label: 'Facial', value: employee.metrics.facialExpression ?? 0, tone: 'emerald', stroke: 'var(--accent-emerald)' },
        { label: 'Verbal', value: employee.metrics.verbalExpression ?? 0, tone: 'amber', stroke: 'var(--accent-amber)' },
        { label: 'Greeting', value: employee.metrics.greetingBehavior ?? 0, tone: 'blue', stroke: 'var(--accent-blue)' },
      ]
    : []

  return (
    <section className="reveal-on-scroll is-visible space-y-6">
      <div className={cn(panelCard, 'overflow-hidden')}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button className={ghostButton} type="button" onClick={onBack}>
            Back to employee list
          </button>
          <div className="flex items-center gap-3">
            <span className={panelChip}>Employee profile</span>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:border-red-500/50 hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-4">
          {employee.photoUrl ? (
            <img 
              src={employee.photoUrl}
              alt={employee.name}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-[color:var(--accent-blue)] ring-offset-2 ring-offset-[color:var(--bg-elevated)]"
            />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--accent-blue-soft)] text-lg font-bold text-[color:var(--accent-blue)]">
              {initials}
            </span>
          )}
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
            <strong className={metricValue}>
              {employee.profile?.employeeId ?? 'N/A'}
            </strong>
          </div>
          <div className={metricBlock}>
            <span className={metricLabel}>Risk level</span>
            <strong className={metricValue}>
              {employee.info?.riskLevel ?? 'N/A'}
            </strong>
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
          {ringMetrics.length > 0 && (() => {
            // Stack segments: each metric contributes equally (max 33.3% of the ring)
            const L0 = (ringMetrics[0].value) / 3;
            const L1 = (ringMetrics[1].value) / 3;
            const L2 = (ringMetrics[2].value) / 3;

            const layers = [
              { id: 2, stroke: ringMetrics[2].stroke, val: L0 + L1 + L2 },
              { id: 1, stroke: ringMetrics[1].stroke, val: L0 + L1 },
              { id: 0, stroke: ringMetrics[0].stroke, val: L0 },
            ];

            return (
              <div className="flex flex-col items-center gap-5 py-4">
                <div className="relative grid h-44 w-44 place-items-center rounded-full bg-[color:var(--hero-ring-core)] [box-shadow:0_18px_40px_var(--hero-ring-core-shadow)] transition-[background-color,box-shadow] duration-[320ms]">
                  <svg
                    className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                    viewBox="0 0 100 100"
                    style={{ overflow: 'visible' }}
                  >
                    <defs>
                      <filter id={`ring-glow-emp-${employee.profile?.employeeId || 'x'}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                        <feComponentTransfer in="blur" result="glow">
                          <feFuncA type="linear" slope="0.65" />
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode in="glow" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    {/* Background track */}
                    <circle
                      cx="50" cy="50" r="46.25" pathLength="100"
                      className="fill-none [stroke:var(--hero-ring-rest)] [stroke-width:7] transition-[stroke] duration-[320ms]"
                    />
                    {/* Stacked colored segments */}
                    <g filter={`url(#ring-glow-emp-${employee.profile?.employeeId || 'x'})`}>
                      {layers.map((layer) => (
                        <circle
                          key={layer.id}
                          cx="50" cy="50" r="46.25" pathLength="100"
                          className="fill-none [stroke-width:7] [stroke-linecap:round] animate-[hero-ring-grow_1.2s_cubic-bezier(0.22,1,0.36,1)_backwards] transition-[stroke-dashoffset] duration-1000 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
                          style={{
                            stroke: layer.stroke,
                            strokeDasharray: '100 100',
                            strokeDashoffset: 100 - layer.val,
                          }}
                        />
                      ))}
                    </g>
                  </svg>
                  <div className="text-center relative z-[1]">
                    <strong className="block text-4xl font-bold tracking-[-0.05em] text-[color:var(--text)] leading-none">{employee.score}</strong>
                    <span className="text-xs font-semibold text-[color:var(--muted)] mt-1 block">Overall score</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4">
                  {ringMetrics.map((m) => (
                    <div key={m.label} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: m.stroke }} />
                      <span className="text-xs font-semibold text-[color:var(--muted)]">{m.label} <strong className="text-[color:var(--text)]">{m.value}%</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className={metricBlock}>
              <span className={metricLabel}>Facial expression</span>
              <strong className={metricValue}>
                {employee.metrics?.facialExpression ?? '--'}
              </strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Verbal expression</span>
              <strong className={metricValue}>
                {employee.metrics?.verbalExpression ?? '--'}
              </strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Greeting behavior</span>
              <strong className={metricValue}>
                {employee.metrics?.greetingBehavior ?? '--'}
              </strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Response time</span>
              <strong className={metricValue}>
                {employee.metrics?.responseTime ?? '--'}
              </strong>
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
              <strong className={metricValue}>
                {employee.profile?.shift ?? 'N/A'}
              </strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Tenure</span>
              <strong className={metricValue}>
                {employee.profile?.tenure ?? 'N/A'}
              </strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Supervisor</span>
              <strong className={metricValue}>
                {employee.profile?.supervisor ?? 'N/A'}
              </strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Peak station</span>
              <strong className={metricValue}>
                {employee.info?.peakStation ?? 'N/A'}
              </strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Interactions today</span>
              <strong className={metricValue}>
                {employee.info?.interactionsToday ?? 'N/A'}
              </strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Last coaching</span>
              <strong className={metricValue}>
                {employee.info?.lastCoaching ?? 'N/A'}
              </strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Customer satisfaction</span>
              <strong className={metricValue}>
                {employee.info?.customerSatisfaction ?? 'N/A'}
              </strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Resolution rate</span>
              <strong className={metricValue}>
                {employee.info?.issueResolutionRate ?? 'N/A'}
              </strong>
            </div>
            <div className={metricBlock}>
              <span className={metricLabel}>Avg handle time</span>
              <strong className={metricValue}>
                {employee.info?.averageHandlingTime ?? 'N/A'}
              </strong>
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
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={employee.profile?.weeklyScores ?? []}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} dy={10} />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--line)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text)' }}
                />
                <Area type="monotone" dataKey="score" stroke="var(--accent-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
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
                  <strong className="block text-[color:var(--text)]">
                    {session.time}
                  </strong>
                  <span className="text-sm text-[color:var(--muted)]">
                    {session.station}
                  </span>
                </div>
                <div>
                  <strong className="block text-[color:var(--text)]">
                    Score {session.score}
                  </strong>
                  <span className="text-sm text-[color:var(--muted)]">
                    {session.note}
                  </span>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-6 shadow-2xl animate-[modalSlideUp_0.3s_ease-out]">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-red-500/10 mb-4">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-[color:var(--text)]">
                Remove Employee
              </h3>
              <p className="mt-2 text-sm text-[color:var(--muted)] leading-relaxed max-w-sm">
                Are you sure you want to remove <strong className="text-[color:var(--text)]">{employee.name}</strong>? This action cannot be undone and all associated data will be permanently deleted.
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-[color:var(--text)] transition hover:bg-[color:var(--bg-strong)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Remove Employee
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}
    </section>
  )
}
