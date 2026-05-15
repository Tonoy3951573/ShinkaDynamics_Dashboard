import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Eye,
  Filter,
  Search,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react'
import { AlertCard } from '../components/dashboard/AlertCard'
import { useDashboard } from '../context/useDashboard'
import {
  cn,
  eyebrow,
  panelCard,
  panelChip,
  panelHeading,
  panelTitle,
} from '../lib/ui'

const severityOptions = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'tone', label: 'Tone' },
  { value: 'greeting', label: 'Greeting' },
  { value: 'behavior', label: 'Behavior' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'system', label: 'System' },
]

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]

const selectClass =
  'appearance-none rounded-full border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-2 pr-8 text-sm font-semibold text-[color:var(--text)] transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--bg-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-blue-soft)]'

export function AlertsPage() {
  const {
    alerts,
    alertsLoading,
    fetchAlerts,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
  } = useDashboard()

  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchAlerts()
  }, [])

  const filteredAlerts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return alerts.filter((alert) => {
      const matchesSearch =
        query.length === 0 ||
        alert.title.toLowerCase().includes(query) ||
        alert.detail.toLowerCase().includes(query) ||
        (alert.employee_name || '').toLowerCase().includes(query) ||
        (alert.station || '').toLowerCase().includes(query) ||
        (alert.source || '').toLowerCase().includes(query)

      const matchesSeverity =
        severityFilter === 'all' || alert.severity === severityFilter
      const matchesCategory =
        categoryFilter === 'all' || alert.category === categoryFilter
      const matchesStatus =
        statusFilter === 'all' || alert.status === statusFilter

      return matchesSearch && matchesSeverity && matchesCategory && matchesStatus
    })
  }, [alerts, searchQuery, severityFilter, categoryFilter, statusFilter])

  // Summary counts
  const counts = useMemo(() => {
    const active = alerts.filter((a) => a.status === 'active')
    return {
      total: alerts.length,
      active: active.length,
      critical: active.filter((a) => a.severity === 'critical').length,
      high: active.filter((a) => a.severity === 'high').length,
      medium: active.filter((a) => a.severity === 'medium').length,
      low: active.filter((a) => a.severity === 'low').length,
      acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
      resolved: alerts.filter((a) => a.status === 'resolved').length,
    }
  }, [alerts])

  const hasActiveFilters =
    severityFilter !== 'all' ||
    categoryFilter !== 'all' ||
    statusFilter !== 'all' ||
    searchQuery.length > 0

  const clearFilters = () => {
    setSearchQuery('')
    setSeverityFilter('all')
    setCategoryFilter('all')
    setStatusFilter('all')
  }

  return (
    <>
      {/* Summary Header */}
      <section className={cn(panelCard, 'reveal-on-scroll')}>
        <div className={panelHeading}>
          <div>
            <p className={eyebrow}>Alert Center</p>
            <h2 className={panelTitle}>Risk & Compliance Alerts</h2>
          </div>
          <span className={panelChip}>
            {counts.active} active
          </span>
        </div>

        {/* Severity summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => {
              setSeverityFilter('critical')
              setStatusFilter('active')
            }}
            className={cn(
              'group rounded-[20px] border p-4 text-left transition hover:-translate-y-0.5',
              counts.critical > 0
                ? 'border-red-500/30 bg-red-500/8 hover:border-red-500/50 hover:[box-shadow:0_12px_24px_rgba(208,79,69,0.12)]'
                : 'border-[color:var(--line)] bg-[color:var(--bg-panel)] hover:border-[color:var(--line-strong)]',
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {counts.critical > 0 && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                )}
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              <span className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-red-500 dark:text-red-400">
                Critical
              </span>
            </div>
            <strong className="block text-2xl font-bold text-[color:var(--text)]">
              {counts.critical}
            </strong>
          </button>

          <button
            type="button"
            onClick={() => {
              setSeverityFilter('high')
              setStatusFilter('active')
            }}
            className={cn(
              'group rounded-[20px] border p-4 text-left transition hover:-translate-y-0.5',
              counts.high > 0
                ? 'border-orange-500/30 bg-orange-500/8 hover:border-orange-500/50'
                : 'border-[color:var(--line)] bg-[color:var(--bg-panel)] hover:border-[color:var(--line-strong)]',
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
              <span className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-orange-600 dark:text-orange-400">
                High
              </span>
            </div>
            <strong className="block text-2xl font-bold text-[color:var(--text)]">
              {counts.high}
            </strong>
          </button>

          <button
            type="button"
            onClick={() => {
              setSeverityFilter('medium')
              setStatusFilter('active')
            }}
            className="group rounded-[20px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[color:var(--line-strong)]"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--accent-amber)]" />
              <span className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[color:var(--accent-amber)]">
                Medium
              </span>
            </div>
            <strong className="block text-2xl font-bold text-[color:var(--text)]">
              {counts.medium}
            </strong>
          </button>

          <button
            type="button"
            onClick={() => {
              setSeverityFilter('low')
              setStatusFilter('active')
            }}
            className="group rounded-[20px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[color:var(--line-strong)]"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--accent-blue)]" />
              <span className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[color:var(--accent-blue)]">
                Low
              </span>
            </div>
            <strong className="block text-2xl font-bold text-[color:var(--text)]">
              {counts.low}
            </strong>
          </button>
        </div>

        {/* Quick summary row */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent-blue-soft)] px-3 py-1 text-xs font-bold text-[color:var(--accent-blue)]">
            <Eye className="h-3 w-3" />
            {counts.acknowledged} acknowledged
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent-emerald-soft)] px-3 py-1 text-xs font-bold text-[color:var(--accent-emerald)]">
            <CheckCircle2 className="h-3 w-3" />
            {counts.resolved} resolved
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--bg-chip)] px-3 py-1 text-xs font-bold text-[color:var(--muted)]">
            <Bell className="h-3 w-3" />
            {counts.total} total
          </span>
        </div>
      </section>

      {/* Filters */}
      <section
        className={cn(panelCard, 'reveal-on-scroll')}
        style={{ '--reveal-delay': '80ms' }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[color:var(--muted)]" strokeWidth={2.2} />
            <span className="text-sm font-bold text-[color:var(--text)]">
              Filter Alerts
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" strokeWidth={2.2} />
              <input
                type="text"
                placeholder="Search alerts…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-[color:var(--line)] bg-[color:var(--bg-panel)] py-2 pl-10 pr-4 text-sm font-semibold text-[color:var(--text)] placeholder:text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-blue-soft)]"
              />
            </div>

            {/* Severity filter */}
            <div className="relative">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className={selectClass}
              >
                {severityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={selectClass}
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={selectClass}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-3 py-2 text-xs font-bold text-[color:var(--muted)] transition hover:border-[color:var(--accent-red)] hover:text-[color:var(--accent-red)]"
                onClick={clearFilters}
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Alert List */}
      <section
        className="reveal-on-scroll"
        style={{ '--reveal-delay': '160ms' }}
      >
        {alertsLoading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[color:var(--line)] border-t-[color:var(--accent-blue)]" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className={cn(panelCard, 'flex flex-col items-center justify-center py-16 text-center')}>
            {hasActiveFilters ? (
              <>
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-[color:var(--bg-chip)]">
                  <Search className="h-7 w-7 text-[color:var(--muted)]" />
                </div>
                <strong className="text-lg font-bold text-[color:var(--text)]">
                  No alerts match your filters
                </strong>
                <p className="mt-2 max-w-md text-sm text-[color:var(--muted)]">
                  Try adjusting your search criteria or clearing filters to see all alerts.
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent-blue)] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
                  onClick={clearFilters}
                >
                  Clear all filters
                </button>
              </>
            ) : (
              <>
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-[color:var(--accent-emerald-soft)]">
                  <Sparkles className="h-7 w-7 text-[color:var(--accent-emerald)]" />
                </div>
                <strong className="text-lg font-bold text-[color:var(--text)]">
                  All clear! No alerts right now
                </strong>
                <p className="mt-2 max-w-md text-sm text-[color:var(--muted)]">
                  Your store is running smoothly. The AI monitoring system will notify you when something needs attention.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredAlerts.map((alert, index) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={acknowledgeAlert}
                onResolve={resolveAlert}
                onDismiss={dismissAlert}
                style={{ '--reveal-delay': `${index * 60}ms` }}
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
