import { cn } from '../../lib/ui'

const statusConfig = {
  connected: {
    label: 'Live',
    dotModifier: 'conn-dot--connected',
    statusColor: 'text-[color:var(--nord-green)] conn-status--connected',
    title: 'Real-time connection active — receiving AI events',
  },
  reconnecting: {
    label: 'Reconnecting',
    dotModifier: 'conn-dot--reconnecting',
    statusColor: 'text-[color:var(--nord-yellow)] conn-status--reconnecting',
    title: 'Attempting to restore real-time connection…',
  },
  disconnected: {
    label: 'Offline',
    dotModifier: 'conn-dot--disconnected',
    statusColor: 'text-[color:var(--nord-red)] conn-status--disconnected',
    title: 'Real-time connection lost — data may be stale',
  },
}

/**
 * Frosted-glass pill that shows the live WebSocket connection state.
 *
 * @param {{ status: 'connected'|'reconnecting'|'disconnected' }} props
 */
export function ConnectionStatus({ status = 'disconnected' }) {
  const config = statusConfig[status] || statusConfig.disconnected

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 py-[5px] pl-[10px] pr-[14px] rounded-full font-sans text-[0.72rem] font-bold tracking-[0.04em] uppercase whitespace-nowrap select-none cursor-default transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] bg-[rgba(46,52,64,0.35)] backdrop-blur-[18px] [backdrop-filter:blur(18px)_saturate(1.6)] border border-[rgba(216,222,233,0.12)] [box-shadow:0_2px_12px_rgba(0,0,0,0.08),inset_0_0.5px_0_rgba(236,239,244,0.06)] hover:-translate-y-px hover:[box-shadow:0_6px_20px_rgba(0,0,0,0.12),inset_0_0.5px_0_rgba(236,239,244,0.08)] animate-[status-fade-in_0.5s_ease-out_both]',
        '[html[data-theme=light]_&]:bg-[rgba(236,239,244,0.55)] [html[data-theme=light]_&]:border-[rgba(76,86,106,0.12)] [html[data-theme=light]_&]:[box-shadow:0_2px_12px_rgba(0,0,0,0.04),inset_0_0.5px_0_rgba(255,255,255,0.7)]',
        config.statusColor,
      )}
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${config.label}`}
      title={config.title}
    >
      <span className={cn('conn-dot', config.dotModifier)} aria-hidden="true" />
      <span className="leading-none">{config.label}</span>
    </div>
  )
}
