import { useState, useCallback, useRef } from 'react'
import { useDashboard } from '../../context/useDashboard'

// ── Fake payload factories ──────────────────────────────────────────────────
// Each factory returns a new object so repeated clicks produce distinct items.

function makeCriticalAlert() {
  const ts = new Date().toLocaleTimeString()
  return {
    id: `dev-alert-${Date.now()}`,
    title: `[DEV] Critical tone escalation at Checkout ${Math.floor(Math.random() * 6) + 1}`,
    detail: `Simulated critical alert injected at ${ts}. Vocal aggression index exceeded threshold.`,
    severity: 'Critical',
    status: 'active',
    created_at: new Date().toISOString(),
  }
}

function makeLiveFeedEntry() {
  const names = ['Dev User A', 'Dev User B', 'Dev User C', 'Dev User D']
  const stations = ['Checkout 07', 'Front Entrance', 'Fitting Room B', 'Aisle C']
  const statuses = ['Raised vocal tone detected', 'No greeting on entry', 'Extended idle period']
  const score = Math.floor(Math.random() * 30) + 45   // 45–74 → triggers alert tone
  const name = names[Math.floor(Math.random() * names.length)]
  const station = stations[Math.floor(Math.random() * stations.length)]

  return {
    // Unique id guarantees getRenderKey always issues a new sequence number,
    // so React mounts a fresh DOM node and the slide-in animation fires.
    id: `dev-feed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    employee: name,
    station,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    score,
    sentiment: score < 60 ? 'Manual review' : 'At-risk',
  }
}

// Drastically shifts scoreDistribution to stress-test bar transitions
let metricsFlip = false
function makeShiftedMetrics() {
  metricsFlip = !metricsFlip
  return {
    scoreDistribution: metricsFlip
      ? [
          { label: 'Joyful facial expression', value: 38, tone: 'alert' },
          { label: 'Polite verbal tone',        value: 22, tone: 'alert' },
          { label: 'Greeting on entry/exit',    value: 55, tone: 'amber' },
        ]
      : [
          { label: 'Joyful facial expression', value: 97, tone: 'emerald' },
          { label: 'Polite verbal tone',        value: 91, tone: 'blue'   },
          { label: 'Greeting on entry/exit',    value: 99, tone: 'emerald'},
        ],
    summary: {
      score: metricsFlip ? 38 : 97,
      trend: metricsFlip ? '-29%' : '+26%',
      insight: metricsFlip
        ? '[DEV] Metrics shifted LOW to test bar transition animation.'
        : '[DEV] Metrics shifted HIGH to test bar transition animation.',
    },
  }
}

// ── Component ───────────────────────────────────────────────────────────────
export function DevMockControls() {
  const { simulateEvent, dashboardData } = useDashboard()

  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('data')
  const [shouldCrash, setShouldCrash] = useState(false)

  // Intentionally throw during render if button was clicked
  if (shouldCrash) {
    throw new Error('DEV_SIMULATED_CRASH: Intentional component fault triggered.')
  }

  // Track which button was "just fired" to play the flash animation
  const [fired, setFired] = useState(null)
  // Used to unmount the panel with an exit animation
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef(null)

  // Flash a button for 350 ms then clear
  const flash = useCallback((key) => {
    setFired(key)
    setTimeout(() => setFired(null), 360)
  }, [])

  const handleToggle = () => {
    if (open) {
      // Start exit animation, then actually unmount
      setClosing(true)
      closeTimer.current = setTimeout(() => {
        setOpen(false)
        setClosing(false)
      }, 200)
    } else {
      clearTimeout(closeTimer.current)
      setClosing(false)
      setOpen(true)
    }
  }

  const triggerAlert = () => {
    simulateEvent('alert:new', makeCriticalAlert())
    flash('alert')
  }

  const triggerFeed = () => {
    const entry = makeLiveFeedEntry()
    simulateEvent('feed:update', entry)

    // Simulate the backend recalculating the global score and pushing an insight update.
    // We blend the current average with the new entry's score.
    const currentScore = dashboardData?.summary?.score || 85
    const newScore = Math.round(currentScore * 0.9 + entry.score * 0.1)
    const diff = newScore - currentScore
    const trendStr = diff >= 0 ? `+${(diff / 10).toFixed(1)}%` : `${(diff / 10).toFixed(1)}%`

    // Derive per-metric bars from the blended score with slight variation
    const tone = (v) => v >= 85 ? 'emerald' : v >= 60 ? 'amber' : 'alert'
    const facial = Math.max(0, Math.min(100, newScore + Math.round(Math.random() * 10 - 5)))
    const verbal = Math.max(0, Math.min(100, newScore + Math.round(Math.random() * 10 - 5)))
    const greeting = Math.max(0, Math.min(100, newScore + Math.round(Math.random() * 10 - 5)))

    simulateEvent('insight:refresh', {
      summary: {
        ...dashboardData?.summary,
        score: newScore,
        trend: trendStr,
        insight: `[DEV] Overall score shifted by interaction from ${entry.employee}.`,
      },
      scoreDistribution: [
        { label: 'Joyful facial expression', value: facial, tone: tone(facial) },
        { label: 'Polite verbal tone',       value: verbal, tone: tone(verbal) },
        { label: 'Greeting on entry and exit', value: greeting, tone: tone(greeting) },
      ],
    })

    flash('feed')
  }

  const triggerMetrics = () => {
    simulateEvent('insight:refresh', makeShiftedMetrics())
    flash('metrics')
  }

  const triggerMovement = () => {
    flash('movement')
    const cameraId = dashboardData?.cameras?.[0]?.id || 'cam-01'
    let step = 0
    const maxSteps = 20

    const interval = setInterval(() => {
      step++
      if (step > maxSteps) {
        clearInterval(interval)
        simulateEvent('camera:detections_update', {
          cameraId,
          detections: [] // Clear after walking across
        })
        return
      }

      // Calculate path from x: 10% to x: 70%, slight y arc
      const progress = step / maxSteps
      const xPos = 10 + (progress * 60)
      const yPos = 30 + Math.sin(progress * Math.PI) * 10

      simulateEvent('camera:detections_update', {
        cameraId,
        detections: [
          {
            id: 'subject-alpha',
            x: xPos,
            y: yPos,
            width: 18 + Math.sin(progress * Math.PI * 4) * 2, // wobble
            height: 45 + Math.cos(progress * Math.PI * 4) * 2,
            subjectName: 'Subject_Alpha',
            confidenceScore: 0.85 + Math.random() * 0.12
          }
        ]
      })
    }, 300)
  }

  // Shared button base classes
  const btnBase = 'flex items-center gap-2.5 w-full py-2.5 px-3.5 rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-panel)] cursor-pointer text-left transition-[transform,background-color,border-color,box-shadow] duration-[160ms] [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:translate-x-[3px] active:scale-[0.97]'
  const btnFlash = 'animate-[dmc-btn-flash_350ms_ease]'
  
  // Hover variants
  const hoverAlert = 'hover:bg-[color:var(--accent-red-soft)] hover:border-[color:var(--accent-red)] hover:[box-shadow:0_0_0_3px_rgba(208,79,69,0.14)]'
  const hoverFeed = 'hover:bg-[color:var(--accent-blue-soft)] hover:border-[color:var(--accent-blue)] hover:[box-shadow:0_0_0_3px_rgba(39,110,241,0.14)]'
  const hoverMetrics = 'hover:bg-[color:var(--accent-emerald-soft)] hover:border-[color:var(--accent-emerald)] hover:[box-shadow:0_0_0_3px_rgba(15,157,122,0.14)]'

  const actions = [
    { id: 'alert', emoji: '🚨', label: 'Trigger Critical Alert', sub: 'Injects alert:new → severity Critical', hover: hoverAlert, onClick: triggerAlert },
    { id: 'feed', emoji: '👤', label: 'Simulate Live Feed', sub: 'Injects feed:update → low-score employee', hover: hoverFeed, onClick: triggerFeed },
    { id: 'metrics', emoji: '📊', label: 'Shift Global Metrics', sub: 'Toggles insight:refresh ↕ low/high', hover: hoverMetrics, onClick: triggerMetrics },
    { id: 'movement', emoji: '📹', label: 'Simulate Subject Movement', sub: 'Injects tracking coordinates over 6s', hover: hoverFeed, onClick: triggerMovement },
    { id: 'clear', emoji: '🧹', label: 'Clear All Data', sub: 'Empties feed and alerts arrays', hover: hoverMetrics, onClick: () => { simulateEvent('dev:clear_all'); flash('clear') } },
    { id: 'disconnect', emoji: '🔌', label: 'Toggle Disconnect', sub: 'Overrides socket status', hover: hoverAlert, onClick: () => { simulateEvent('dev:disconnect'); flash('disconnect') } },
    { id: 'crash', emoji: '💥', label: 'Simulate Component Crash', sub: 'Throws a fatal render error', hover: hoverAlert, onClick: () => setShouldCrash(true) },
  ]

  return (
    <>
      {/* ── Floating panel ──────────────────────────────────────────── */}
      {(open || closing) && (
        <div
          className={`dmc-hazard-border fixed bottom-[5.5rem] right-6 z-[9998] w-[17rem] bg-[color:var(--bg-elevated)] [backdrop-filter:blur(20px)_saturate(160%)] rounded-[20px] [box-shadow:var(--shadow-lg)] border-2 border-transparent bg-clip-padding outline-none ${closing ? 'animate-[dmc-panel-exit_200ms_ease-in_both] pointer-events-none' : 'animate-[dmc-panel-enter_260ms_cubic-bezier(0.22,1,0.36,1)_both]'}`}
          role="region"
          aria-label="Developer mock controls"
        >
          <div className="p-4 pt-4 pb-[1.125rem]">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3.5">
              <span className="text-base leading-none">⚙️</span>
              <span className="flex-1 text-[0.72rem] font-black uppercase tracking-[0.16em] text-[color:var(--accent-amber)]">Mock Controls</span>
              <span className="text-[0.6rem] font-black uppercase tracking-[0.14em] py-[0.15rem] px-[0.45rem] rounded bg-[rgba(203,139,47,0.18)] text-[color:var(--accent-amber)] border border-[rgba(203,139,47,0.35)]">DEV</span>
            </div>
            <div className="h-px bg-[color:var(--line)] mb-3.5" />

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              {actions.map((action) => (
                <button
                  key={action.id}
                  id={`dmc-btn-${action.id}`}
                  type="button"
                  className={`${btnBase} ${action.hover} ${fired === action.id ? btnFlash : ''}`}
                  onClick={action.onClick}
                >
                  <span className="text-[1.1rem] leading-none shrink-0 font-[Apple_Color_Emoji,Segoe_UI_Emoji,Noto_Color_Emoji,sans-serif]">{action.emoji}</span>
                  <span className="text-[0.8125rem] font-bold text-[color:var(--text)] leading-[1.3]">
                    {action.label}
                    <span className="block text-[0.7rem] font-medium text-[color:var(--muted)] mt-[0.1rem]">{action.sub}</span>
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-3.5 pt-2.5 border-t border-[color:var(--line)] text-[0.66rem] text-[color:var(--muted)] text-center leading-normal">
              Only visible in <code>import.meta.env.DEV</code>
              <br />Events route through <code>simulateEvent()</code>
            </p>
          </div>
        </div>
      )}

      {/* ── Toggle FAB ──────────────────────────────────────────────── */}
      <button
        id="dmc-fab"
        type="button"
        className="fixed bottom-6 right-6 z-[9999] grid place-items-center w-[3.25rem] h-[3.25rem] rounded-full border-none cursor-pointer bg-[linear-gradient(135deg,#cb8b2f_0%,#f0c579_100%)] [box-shadow:0_0_0_3px_rgba(203,139,47,0.28),0_8px_24px_rgba(203,139,47,0.35)] text-[1.2rem] leading-none text-[#1b2330] transition-[transform,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] will-change-transform hover:scale-[1.12] hover:-rotate-[8deg] hover:[box-shadow:0_0_0_4px_rgba(203,139,47,0.36),0_12px_32px_rgba(203,139,47,0.42)] active:scale-95"
        onClick={handleToggle}
        aria-label={open ? 'Close developer mock controls' : 'Open developer mock controls'}
        aria-expanded={open}
        title="Dev Mock Controls"
      >
        {open ? '✕' : '🛠'}
      </button>
    </>
  )
}
