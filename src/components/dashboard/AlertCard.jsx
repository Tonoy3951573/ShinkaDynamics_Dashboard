import { useState } from 'react'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  MapPin,
  MonitorOff,
  Shield,
  User,
  Volume2,
  X,
  Zap,
} from 'lucide-react'
import { cn } from '../../lib/ui'

const severityConfig = {
  critical: {
    label: 'Critical',
    dotClass: 'bg-red-500',
    borderClass: 'border-l-red-500',
    bgClass: 'bg-[color:var(--accent-red-soft)]/40',
    textClass: 'text-red-500 dark:text-red-400',
    badgeClass: 'bg-red-500/15 text-red-600 dark:text-red-400',
    pulse: true,
  },
  high: {
    label: 'High',
    dotClass: 'bg-orange-500',
    borderClass: 'border-l-orange-500',
    bgClass: 'bg-orange-500/8',
    textClass: 'text-orange-600 dark:text-orange-400',
    badgeClass: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
    pulse: false,
  },
  medium: {
    label: 'Medium',
    dotClass: 'bg-[color:var(--accent-amber)]',
    borderClass: 'border-l-[color:var(--accent-amber)]',
    bgClass: 'bg-[color:var(--accent-amber-soft)]/40',
    textClass: 'text-[color:var(--accent-amber)]',
    badgeClass: 'bg-[color:var(--accent-amber-soft)] text-[color:var(--accent-amber)]',
    pulse: false,
  },
  low: {
    label: 'Low',
    dotClass: 'bg-[color:var(--accent-blue)]',
    borderClass: 'border-l-[color:var(--accent-blue)]',
    bgClass: 'bg-[color:var(--accent-blue-soft)]/40',
    textClass: 'text-[color:var(--accent-blue)]',
    badgeClass: 'bg-[color:var(--accent-blue-soft)] text-[color:var(--accent-blue)]',
    pulse: false,
  },
}

const categoryIcons = {
  tone: Volume2,
  greeting: Bell,
  behavior: Eye,
  compliance: Shield,
  system: MonitorOff,
}

function timeAgo(dateString) {
  const now = Date.now()
  const past = new Date(dateString).getTime()
  const diffMs = now - past

  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function AlertCard({ alert, onAcknowledge, onResolve, onDismiss, style }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isActioning, setIsActioning] = useState(false)

  const config = severityConfig[alert.severity] || severityConfig.medium
  const CategoryIcon = categoryIcons[alert.category] || AlertTriangle
  const isActionable = alert.status === 'active' || alert.status === 'acknowledged'

  const handleAction = async (action) => {
    setIsActioning(true)
    try {
      await action(alert.id)
    } finally {
      setIsActioning(false)
    }
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-[22px] border border-l-[3px] bg-[color:var(--bg-elevated)] backdrop-blur-xl transition-all duration-300 animate-[alert-card-enter_420ms_cubic-bezier(0.22,1,0.36,1)_both]',
        config.borderClass,
        alert.status === 'resolved' && 'opacity-60',
        alert.status === 'dismissed' && 'opacity-40',
        'hover:border-[color:var(--line-strong)] hover:[box-shadow:var(--shadow-md)]',
      )}
      style={style}
    >
      <div className="p-5">
        {/* Top row: severity + category + timestamp */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* Severity dot – critical uses pure CSS ping, others use inline dot */}
            <span
              className={cn(
                'relative flex h-2.5 w-2.5 shrink-0',
                config.pulse && alert.status === 'active' && 'alert-dot--critical',
              )}
            >
              <span
                className={cn(
                  'relative inline-flex h-2.5 w-2.5 rounded-full',
                  config.pulse && alert.status === 'active'
                    ? 'alert-dot__core'   /* colour applied by .alert-dot__core in CSS */
                    : config.dotClass,
                )}
              />
            </span>

            {/* Severity badge */}
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.14em]',
                config.badgeClass,
              )}
            >
              {config.label}
            </span>

            {/* Category badge */}
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--bg-chip)] px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[color:var(--muted)]">
              <CategoryIcon className="h-3 w-3" strokeWidth={2.2} />
              {alert.category}
            </span>

            {/* Status badge */}
            {alert.status !== 'active' && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em]',
                  alert.status === 'acknowledged' &&
                    'bg-[color:var(--accent-blue-soft)] text-[color:var(--accent-blue)]',
                  alert.status === 'resolved' &&
                    'bg-[color:var(--accent-emerald-soft)] text-[color:var(--accent-emerald)]',
                  alert.status === 'dismissed' &&
                    'bg-[color:var(--bg-chip)] text-[color:var(--muted)]',
                )}
              >
                {alert.status === 'acknowledged' && <Eye className="h-3 w-3" />}
                {alert.status === 'resolved' && <CheckCircle2 className="h-3 w-3" />}
                {alert.status}
              </span>
            )}
          </div>

          {/* Timestamp */}
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[color:var(--muted)]">
            <Clock className="h-3 w-3" strokeWidth={2.4} />
            {timeAgo(alert.created_at)}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-[1.05rem] font-bold leading-snug text-[color:var(--text)]">
          {alert.title}
        </h4>

        {/* Detail */}
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
          {alert.detail}
        </p>

        {/* Meta chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {alert.source && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--bg-panel)] px-3 py-1 text-xs font-semibold text-[color:var(--muted)]">
              <Zap className="h-3 w-3" strokeWidth={2.2} />
              {alert.source}
            </span>
          )}
          {alert.employee_name && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--bg-panel)] px-3 py-1 text-xs font-semibold text-[color:var(--text)]">
              <User className="h-3 w-3 text-[color:var(--muted)]" strokeWidth={2.2} />
              {alert.employee_name}
            </span>
          )}
          {alert.station && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--bg-panel)] px-3 py-1 text-xs font-semibold text-[color:var(--muted)]">
              <MapPin className="h-3 w-3" strokeWidth={2.2} />
              {alert.station}
            </span>
          )}
        </div>

        {/* Expand toggle + action buttons */}
        {isActionable && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--muted)] transition hover:text-[color:var(--text)]"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Fewer options
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Actions
                </>
              )}
            </button>
          </div>
        )}

        {/* Expanded actions */}
        {isExpanded && isActionable && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-[color:var(--line)] pt-3">
            {alert.status === 'active' && (
              <button
                type="button"
                disabled={isActioning}
                className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent-blue-soft)] px-4 py-2 text-xs font-bold text-[color:var(--accent-blue)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-50"
                onClick={() => handleAction(onAcknowledge)}
              >
                <Eye className="h-3.5 w-3.5" />
                Acknowledge
              </button>
            )}
            <button
              type="button"
              disabled={isActioning}
              className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent-emerald-soft)] px-4 py-2 text-xs font-bold text-[color:var(--accent-emerald)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-50"
              onClick={() => handleAction(onResolve)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Resolve
            </button>
            <button
              type="button"
              disabled={isActioning}
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-2 text-xs font-bold text-[color:var(--muted)] transition hover:-translate-y-0.5 hover:border-[color:var(--line-strong)] hover:bg-[color:var(--bg-strong)] disabled:opacity-50"
              onClick={() => handleAction(onDismiss)}
            >
              <X className="h-3.5 w-3.5" />
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function AlertEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-[22px] border border-dashed border-[color:var(--line)] bg-[color-mix(in_srgb,var(--accent-blue-soft)_20%,transparent)]">
      <div className="grid place-items-center w-14 h-14 rounded-full bg-[color:var(--accent-blue-soft)] text-[color:var(--accent-blue)] mb-5 animate-[breathe_3s_ease-in-out_infinite]">
        <Shield />
      </div>
      <strong className="text-lg font-bold text-[color:var(--text)] mb-2">All Clear</strong>
      <p className="text-sm text-[color:var(--muted)] max-w-[280px] leading-relaxed">
        No active anomalies detected. The AI system is actively monitoring.
      </p>
    </div>
  )
}
