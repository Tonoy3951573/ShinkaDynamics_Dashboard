import { useTranslation } from 'react-i18next'
import { useState, useRef } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { ScorePill } from './ScorePill'
import { AlertEmptyState } from './AlertCard'
import { useDashboard } from '../../context/useDashboard'

export function LiveFeedPanel() {
  const { t } = useTranslation('dashboard')
  // ── Pull everything from context ──────────────────────────────────────
  const { filteredFeed, alerts } = useDashboard()

  // Track which item is selected. Falls back to first item if the active
  // key leaves the list (e.g. after a search clears it).
  const [activeFeedKey, setActiveFeedKey] = useState('')

  // ── Stable render keys ────────────────────────────────────────────────
  // The feed list is prepended, so the same employee can appear at the same
  // station multiple times. Using employee-station as the React key would
  // reuse the existing DOM node → no animation.
  //
  // We maintain a Map from a content-identity string → a monotonically
  // increasing sequence number.  Every genuinely new payload gets a new seq,
  // which forces React to mount a fresh node and fire the CSS keyframe.
  const keyMap = useRef(new Map())
  const keySeq = useRef(0)

  function getRenderKey(item) {
    // Prefer a server-assigned id so hot-reloads don't reset the counter.
    const identity = item.id ?? `${item.employee}|${item.station}|${item.score}|${item.status}`
    if (!keyMap.current.has(identity)) {
      keyMap.current.set(identity, ++keySeq.current)
    }
    return `feed-${keyMap.current.get(identity)}`
  }

  const fallbackFeedKey = filteredFeed[0]
    ? `${filteredFeed[0].employee}-${filteredFeed[0].station}`
    : ''

  const resolvedActiveFeedKey = filteredFeed.some(
    (item) => `${item.employee}-${item.station}` === activeFeedKey,
  )
    ? activeFeedKey
    : fallbackFeedKey

  const activeFeed = filteredFeed.find(
    (item) => `${item.employee}-${item.station}` === resolvedActiveFeedKey,
  )

  return (
    <section className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--bg-elevated)] backdrop-blur-xl [box-shadow:var(--shadow-md)] p-5 sm:p-6 lg:p-7">
      {/* ── Panel header ─────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-[0.72rem] font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">{t('liveMonitoring.title')}</p>
          <h3 className="text-[1.4rem] font-bold leading-tight tracking-[-0.03em] text-[color:var(--text)]">{t('liveMonitoring.currentQueue')}</h3>
        </div>
        {/* ::before pseudo-element adds the pulsing green dot */}
        <span className="chip-pulse-dot inline-flex items-center rounded-full border border-[color:var(--line)] bg-[color:var(--bg-chip)] px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[color:var(--muted)] whitespace-nowrap">{t('liveMonitoring.streamingAnalysis')}</span>
      </div>

      {/* ── Feed list ────────────────────────────────────────────────── */}
      <div className="grid gap-3">
        {filteredFeed.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-3xl border border-dashed border-[color:var(--line)] bg-[color-mix(in_srgb,var(--accent-emerald-soft)_20%,transparent)]">
            <div className="grid place-items-center w-16 h-16 rounded-full bg-[color:var(--accent-emerald-soft)] text-[color:var(--accent-emerald)] mb-5 animate-[breathe-emerald_3s_ease-in-out_infinite]">
              <CheckCircle2 />
            </div>
            <strong className="block text-lg font-bold text-[color:var(--text)] mb-2">{t('emptyStates.awaitingData')}</strong>
            <span className="block text-sm text-[color:var(--muted)] max-w-[300px] leading-relaxed">
              {t('emptyStates.liveInteractionDataDesc')}
            </span>
          </div>
        ) : (
          filteredFeed.map((item) => {
            // renderKey is sequence-based → unique even when the same
            // employee-station pair arrives again → React always mounts a
            // fresh DOM node → feed-item-enter keyframe fires every time.
            const renderKey = getRenderKey(item)
            const itemKey = `${item.employee}-${item.station}`
            const isActive = resolvedActiveFeedKey === itemKey
            const tone =
              item.score >= 90 ? 'good' : item.score >= 80 ? 'neutral' : 'alert'

            return (
              <button
                key={renderKey}
                type="button"
                className={`flex w-full items-start gap-4 rounded-3xl border bg-[color:var(--bg-panel)] p-4 text-left cursor-pointer transition-[border-color,background-color,box-shadow] duration-[220ms] ease-linear animate-[feed-item-enter_480ms_cubic-bezier(0.22,1,0.36,1)_both] hover:border-[color:var(--line-strong)] hover:bg-[color:var(--bg-strong)] ${isActive ? 'border-transparent bg-[color:var(--bg-strong)] [box-shadow:0_16px_30px_rgba(39,110,241,0.12)] dark:[box-shadow:0_16px_30px_rgba(112,162,255,0.14)]' : 'border-[color:var(--line)]'}`}
                onClick={() => setActiveFeedKey(itemKey)}
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[color:var(--accent-blue-soft)] font-bold text-[color:var(--accent-blue)] text-sm tracking-[0.04em]">
                  <span>{item.employee.slice(0, 2).toUpperCase()}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <strong className="font-bold text-[color:var(--text)] text-[0.9375rem]">{item.employee}</strong>
                    <ScorePill
                      value={`${item.score}`}
                      label={item.sentiment}
                      tone={tone}
                    />
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--text)]">{item.status}</p>
                  <span className="block mt-1.5 text-[0.8125rem] text-[color:var(--muted)]">{item.station}</span>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* ── Selected interaction detail panel ────────────────────────── */}
      {/*
        React only honours `key` on the root element returned by a branch.
        Wrapping in a Fragment with a key forces a remount (and re-animation)
        whenever the selected item changes.
      */}
      {activeFeed && (
        // eslint-disable-next-line react/jsx-key
        <>
          <div className="mt-5 rounded-3xl border border-[color:var(--line)] bg-[color:var(--bg-panel)] backdrop-blur-[16px] p-5 animate-[feed-item-enter_400ms_cubic-bezier(0.22,1,0.36,1)_both]" key={resolvedActiveFeedKey}>
            <div>
              <p className="mb-1.5 text-[0.72rem] font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">{t('interaction.selectedInteraction')}</p>
              <strong className="text-xl font-bold text-[color:var(--text)]">{activeFeed.employee}</strong>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] bg-[color:var(--bg-strong)] p-4">
                <span className="block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">{t('interaction.currentStation')}</span>
                <strong className="block mt-2 font-bold text-[color:var(--text)]">{activeFeed.station}</strong>
              </div>
              <div className="rounded-[20px] bg-[color:var(--bg-strong)] p-4">
                <span className="block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">{t('interaction.observedBehavior')}</span>
                <strong className="block mt-2 font-bold text-[color:var(--text)]">{activeFeed.status}</strong>
              </div>
              <div className="rounded-[20px] bg-[color:var(--bg-strong)] p-4">
                <span className="block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">{t('interaction.aiInterpretation')}</span>
                <strong className="block mt-2 font-bold text-[color:var(--text)]">{activeFeed.sentiment}</strong>
              </div>
              <div className="rounded-[20px] bg-[color:var(--bg-strong)] p-4">
                <span className="block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">{t('interaction.score')}</span>
                <strong className="block mt-2 font-bold text-[color:var(--text)]">{activeFeed.score}</strong>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Alerts strip ─────────────────────────────────────────────── */}
      {(!alerts || alerts.length === 0) ? (
        <div className="mt-5">
          <AlertEmptyState />
        </div>
      ) : (
        <div className="mt-5 grid gap-3 xl:grid-cols-3">
          {alerts.map((alert) => (
            <div key={alert.id ?? alert.title} className="rounded-[22px] border border-[color:var(--line)] bg-[color-mix(in_srgb,var(--accent-red-soft)_60%,transparent)] p-4 transition-colors duration-300">
              <strong className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--alert-text)]">{alert.severity}</strong>
              <p className="mt-2 font-semibold text-[color:var(--text)]">{alert.title}</p>
              <span className="block mt-2 text-sm leading-relaxed text-[color:var(--muted)]">{alert.detail}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
