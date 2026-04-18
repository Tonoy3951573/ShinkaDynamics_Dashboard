import {
  cn,
  emptyState,
  eyebrow,
  metricBlock,
  metricLabel,
  metricValue,
  panelCard,
  panelChip,
  panelHeading,
  panelTitle,
} from '../../lib/ui'
import { useDashboard } from '../../context/useDashboard'

export function ScoreTrendCard({ chartPoints, weekdayHighlights }) {
  const { selectedDay, setSelectedDay } = useDashboard()
  const hasTrendData = chartPoints.length > 0 && weekdayHighlights.length > 0
  const coordinates = chartPoints
    .map((point, index) => `${index * 56},${120 - point}`)
    .join(' ')
  const selectedHighlight =
    weekdayHighlights.find((day) => day.day === selectedDay) ??
    weekdayHighlights.at(-1) ??
    null
  const averageScore = Math.round(
    weekdayHighlights.reduce((sum, day) => sum + day.score, 0) /
      (weekdayHighlights.length || 1),
  )

  return (
    <section className={panelCard}>
      <div className={panelHeading}>
        <div>
          <p className={eyebrow}>Score Trend</p>
          <h3 className={panelTitle}>Weekly interaction quality</h3>
        </div>
        <span className={panelChip}>7-day pulse</span>
      </div>
      <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-4">
        {hasTrendData ? (
          <svg
            viewBox="0 0 336 140"
            aria-label="Weekly score line chart"
            role="img"
          >
            <defs>
              <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(39, 110, 241, 0.35)" />
                <stop offset="100%" stopColor="rgba(39, 110, 241, 0.02)" />
              </linearGradient>
            </defs>
            <path
              d={`M0,140 L${coordinates} L336,140 Z`}
              fill="url(#trend-fill)"
            />
            <polyline
              fill="none"
              stroke="var(--accent-blue)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={coordinates}
            />
          </svg>
        ) : (
          <div className={emptyState}>
            <strong className="block text-[color:var(--text)]">
              Trend data is unavailable.
            </strong>
            <span className="mt-2 block text-sm text-[color:var(--muted)]">
              Weekly score points will appear here once monitoring data is
              loaded.
            </span>
          </div>
        )}
      </div>
      {hasTrendData && selectedHighlight ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {weekdayHighlights.map((day) => (
              <button
                key={day.day}
                className={cn(
                  'rounded-[20px] border px-3 py-3 text-left transition',
                  selectedHighlight.day === day.day
                    ? 'border-transparent bg-[color:var(--accent-blue)] text-white [box-shadow:0_14px_30px_rgba(39,110,241,0.28)]'
                    : 'border-[color:var(--line)] bg-[color:var(--bg-panel)] text-[color:var(--text)] hover:border-[color:var(--line-strong)] hover:bg-[color:var(--bg-strong)]',
                )}
                type="button"
                onClick={() => setSelectedDay(day.day)}
              >
                <span className="block text-xs font-bold uppercase tracking-[0.12em] opacity-80">
                  {day.day}
                </span>
                <strong className="mt-2 block text-xl font-bold">
                  {day.score}
                </strong>
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-4 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={eyebrow}>Focused Day</p>
              <strong className="text-2xl font-bold text-[color:var(--text)]">
                {selectedHighlight.day}
              </strong>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className={metricBlock}>
                <span className={metricLabel}>Interaction score</span>
                <strong className={metricValue}>
                  {selectedHighlight.score}
                </strong>
              </div>
              <div className={metricBlock}>
                <span className={metricLabel}>Vs weekly average</span>
                <strong className={metricValue}>
                  {selectedHighlight.score - averageScore >= 0 ? '+' : ''}
                  {selectedHighlight.score - averageScore}
                </strong>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
