import { useEffect, useRef, useState } from 'react'
import { useDashboard } from '../../context/useDashboard'

// Severity → emoji icon mapping
const SEVERITY_ICON = {
  critical: '🚨',
  high:     '⚠️',
  medium:   '🔔',
  low:      'ℹ️',
}

// Severity → accent color CSS var
const SEVERITY_ACCENT = {
  critical: '#bf616a',
  high:     '#d08770',
  medium:   'var(--accent-amber)',
  low:      'var(--accent-blue)',
}

// Severity → icon bg
const SEVERITY_ICON_BG = {
  critical: 'bg-[rgba(191,97,106,0.14)]',
  high:     'bg-[rgba(208,135,112,0.14)]',
  medium:   'bg-[color:var(--accent-amber-soft)]',
  low:      'bg-[color:var(--accent-blue-soft)]',
}

// Auto-dismiss delay in ms (animation exit starts at 4600 ms, CSS handles fade)
const DISMISS_DELAY = 5000

let _toastId = 0
const nextId = () => ++_toastId

// ── Individual toast item ───────────────────────────────────────────────────
function Toast({ toast, onDismiss }) {
  const severity = (toast.severity ?? 'low').toLowerCase()
  const icon = SEVERITY_ICON[severity] ?? SEVERITY_ICON.low
  const accent = SEVERITY_ACCENT[severity] ?? SEVERITY_ACCENT.low
  const iconBg = SEVERITY_ICON_BG[severity] ?? SEVERITY_ICON_BG.low
  const isCritical = severity === 'critical'

  return (
    <div
      className={`toast-accent relative pointer-events-auto flex items-start gap-3.5 w-80 max-w-[calc(100vw-3rem)] py-3.5 px-4 rounded-[18px] border border-[color:var(--line-strong)] bg-[color:var(--bg-elevated)] backdrop-blur-xl [backdrop-filter:blur(20px)_saturate(160%)] [box-shadow:var(--shadow-lg)] [animation:toast-enter_380ms_cubic-bezier(0.22,1,0.36,1)_both,toast-exit_400ms_ease-in_forwards] [animation-delay:0ms,4600ms] ${isCritical ? 'border-[rgba(191,97,106,0.35)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,rgba(191,97,106,0.18))]' : ''}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{ '--toast-accent': accent }}
    >
      {/* Severity icon */}
      <div className={`shrink-0 grid place-items-center w-8 h-8 rounded-full text-[0.9rem] ${iconBg}`} aria-hidden="true">
        {icon}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <span className="block text-[0.65rem] font-black uppercase tracking-[0.14em] mb-0.5" style={{ color: accent }}>{toast.severity ?? 'Alert'}</span>
        <p className="text-sm font-bold text-[color:var(--text)] leading-[1.35] line-clamp-2">{toast.title}</p>
        {toast.detail && (
          <span className="block mt-0.5 text-xs text-[color:var(--muted)] leading-normal line-clamp-2">{toast.detail}</span>
        )}
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        className="shrink-0 grid place-items-center w-6 h-6 rounded-full border-none bg-transparent text-[color:var(--muted)] cursor-pointer transition-[background-color,color] duration-150 ease-linear text-[0.8rem] leading-none hover:bg-[color:var(--bg-strong)] hover:text-[color:var(--text)]"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast._toastId)}
      >
        ✕
      </button>

      {/* Shrinking progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-[18px] overflow-hidden" aria-hidden="true">
        <div className="h-full origin-left animate-[toast-progress_5000ms_linear_both]" style={{ background: accent }} />
      </div>
    </div>
  )
}

// ── Stack controller ────────────────────────────────────────────────────────
export function ToastNotification() {
  const { alerts } = useDashboard()
  const [toasts, setToasts] = useState([])

  // Track the previous alerts array length and the last seen alert id/key
  // so we only fire a toast for genuinely *new* entries, not on re-renders.
  const seenIds = useRef(new Set())

  useEffect(() => {
    if (!alerts.length) return

    // The newest alert is always at index 0 (context prepends via slice)
    const newest = alerts[0]
    const uid = newest.id ?? `${newest.title}-${newest.created_at}`

    if (seenIds.current.has(uid)) return   // already toasted this one
    seenIds.current.add(uid)

    const toastEntry = { ...newest, _toastId: nextId() }
    setToasts((prev) => [toastEntry, ...prev].slice(0, 5)) // cap at 5 visible

    // Auto-dismiss after DISMISS_DELAY
    const timer = setTimeout(() => {
      setToasts((prev) =>
        prev.filter((t) => t._toastId !== toastEntry._toastId),
      )
    }, DISMISS_DELAY)

    return () => clearTimeout(timer)
  }, [alerts])

  const dismiss = (toastId) => {
    setToasts((prev) => prev.filter((t) => t._toastId !== toastId))
  }

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-7 right-6 z-[10000] flex flex-col-reverse gap-2.5 pb-[5.25rem] pointer-events-none" aria-label="Notifications">
      {toasts.map((t) => (
        <Toast key={t._toastId} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  )
}
