import { useState } from 'react'
import { ScorePill } from './ScorePill'
import { cn, emptyState, eyebrow, panelCard, panelChip, panelHeading, panelTitle } from '../../lib/ui'

export function LiveFeedPanel({ feed, alerts }) {
  const [activeFeedKey, setActiveFeedKey] = useState('')
  const fallbackFeedKey = feed[0] ? `${feed[0].employee}-${feed[0].station}` : ''
  const resolvedActiveFeedKey = feed.some(
    (item) => `${item.employee}-${item.station}` === activeFeedKey,
  )
    ? activeFeedKey
    : fallbackFeedKey
  const activeFeed = feed.find(
    (item) => `${item.employee}-${item.station}` === resolvedActiveFeedKey,
  )

  return (
    <section className={panelCard}>
      <div className={panelHeading}>
        <div>
          <p className={eyebrow}>Live Monitoring</p>
          <h3 className={panelTitle}>Current interaction queue</h3>
        </div>
        <span className={panelChip}>Streaming analysis</span>
      </div>
      <div className="grid gap-3">
        {feed.length === 0 ? (
          <div className={emptyState}>
            <strong className="block text-[color:var(--text)]">
              No live interactions match the current filters.
            </strong>
            <span className="mt-2 block text-sm text-[color:var(--muted)]">
              Try lowering the minimum score or broadening the search.
            </span>
          </div>
        ) : (
          feed.map((item) => {
            const itemKey = `${item.employee}-${item.station}`

            return (
              <button
                key={itemKey}
                className={cn(
                  'flex w-full items-start gap-4 rounded-[24px] border p-4 text-left transition',
                  resolvedActiveFeedKey === itemKey
                    ? 'border-transparent bg-[color:var(--bg-strong)] [box-shadow:0_16px_30px_rgba(39,110,241,0.12)]'
                    : 'border-[color:var(--line)] bg-[color:var(--bg-panel)] hover:border-[color:var(--line-strong)] hover:bg-[color:var(--bg-strong)]',
                )}
                type="button"
                onClick={() => setActiveFeedKey(itemKey)}
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[color:var(--accent-blue-soft)] font-bold text-[color:var(--accent-blue)]">
                  <span>{item.employee.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <strong className="text-[color:var(--text)]">{item.employee}</strong>
                    <ScorePill
                      value={`${item.score}`}
                      label={item.sentiment}
                      tone={item.score >= 90 ? 'good' : item.score >= 80 ? 'neutral' : 'alert'}
                    />
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--text)]">{item.status}</p>
                  <span className="mt-2 block text-sm text-[color:var(--muted)]">{item.station}</span>
                </div>
              </button>
            )
          })
        )}
      </div>
      {activeFeed ? (
        <div className="mt-5 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-5">
          <div>
            <p className={eyebrow}>Selected Interaction</p>
            <strong className="text-xl font-bold text-[color:var(--text)]">{activeFeed.employee}</strong>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] bg-[color:var(--bg-strong)] p-4">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                Current station
              </span>
              <strong className="mt-2 block text-[color:var(--text)]">{activeFeed.station}</strong>
            </div>
            <div className="rounded-[20px] bg-[color:var(--bg-strong)] p-4">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                Observed behavior
              </span>
              <strong className="mt-2 block text-[color:var(--text)]">{activeFeed.status}</strong>
            </div>
            <div className="rounded-[20px] bg-[color:var(--bg-strong)] p-4">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                AI interpretation
              </span>
              <strong className="mt-2 block text-[color:var(--text)]">{activeFeed.sentiment}</strong>
            </div>
            <div className="rounded-[20px] bg-[color:var(--bg-strong)] p-4">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                Score
              </span>
              <strong className="mt-2 block text-[color:var(--text)]">{activeFeed.score}</strong>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mt-5 grid gap-3 xl:grid-cols-3">
        {alerts.map((alert) => (
          <div
            key={alert.title}
            className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--accent-red-soft)]/60 p-4"
          >
            <strong className="text-sm font-black uppercase tracking-[0.14em] text-[color:var(--alert-text)]">
              {alert.severity}
            </strong>
            <p className="mt-2 font-semibold text-[color:var(--text)]">{alert.title}</p>
            <span className="mt-2 block text-sm leading-6 text-[color:var(--muted)]">
              {alert.detail}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
