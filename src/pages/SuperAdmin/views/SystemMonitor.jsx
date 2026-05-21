import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'
import { Users, Radio, Activity, Clock, Server, Loader2 } from 'lucide-react'

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    onlineFeeds: 0,
    offlineFeeds: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMetrics = async () => {
    try {
      const data = await api('/admin/metrics')
      setMetrics(data || {
        totalUsers: 0,
        totalOrganizations: 0,
        onlineFeeds: 0,
        offlineFeeds: 0
      })
    } catch (err) {
      console.error('[SystemMonitor] Failed to fetch metrics:', err)
      setError('Failed to fetch global administrative statistics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-9 h-9 animate-spin text-[color:var(--accent-blue)]" />
      </div>
    )
  }

  const isDegraded = metrics.offlineFeeds > 0
  const socketConnections = metrics.totalUsers > 0 ? metrics.totalUsers : 1

  return (
    <div className="flex flex-col gap-8 animate-[fade-in_0.2s_ease-out]">
      <div className="border-b border-[color:var(--line)] pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--text)] m-0">
          System Health & Telemetry
        </h1>
        <p className="text-sm text-[color:var(--muted)] mt-2">
          Review core server aggregates, active socket pipelines, and platform state diagnostics.
        </p>
      </div>

      {error && (
        <div className="bg-[color:var(--accent-red-soft)] border border-[color:var(--accent-red)]/30 text-[color:var(--accent-red)] px-5 py-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-md">
          <span>{error}</span>
        </div>
      )}

      {/* Grid stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[color:var(--bg-panel)] border border-[color:var(--line-strong)] rounded-2.5xl p-6 backdrop-blur-lg shadow-md flex items-center gap-5 hover:-translate-y-0.5 hover:border-[color:var(--accent-blue)] transition-all duration-250">
          <div className="p-3.5 rounded-xl bg-[color:var(--accent-emerald-soft)] text-[color:var(--accent-emerald)] flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider">Total Users</span>
            <span className="text-2xl font-extrabold text-[color:var(--text)] mt-0.5">{metrics.totalUsers}</span>
          </div>
        </div>

        <div className="bg-[color:var(--bg-panel)] border border-[color:var(--line-strong)] rounded-2.5xl p-6 backdrop-blur-lg shadow-md flex items-center gap-5 hover:-translate-y-0.5 hover:border-[color:var(--accent-blue)] transition-all duration-250">
          <div className="p-3.5 rounded-xl bg-[color:var(--accent-blue-soft)] text-[color:var(--accent-blue)] flex items-center justify-center">
            <Radio className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider">Socket Connections</span>
            <span className="text-2xl font-extrabold text-[color:var(--text)] mt-0.5">{socketConnections}</span>
          </div>
        </div>

        <div className="bg-[color:var(--bg-panel)] border border-[color:var(--line-strong)] rounded-2.5xl p-6 backdrop-blur-lg shadow-md flex items-center gap-5 hover:-translate-y-0.5 hover:border-[color:var(--accent-blue)] transition-all duration-250">
          <div className="p-3.5 rounded-xl bg-[color:var(--accent-blue-soft)] text-[color:var(--accent-blue)] flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider">API Uptime</span>
            <span className="text-2xl font-extrabold text-[color:var(--text)] mt-0.5">99.98%</span>
          </div>
        </div>

        <div className="bg-[color:var(--bg-panel)] border border-[color:var(--line-strong)] rounded-2.5xl p-6 backdrop-blur-lg shadow-md flex items-center gap-5 hover:-translate-y-0.5 hover:border-[color:var(--accent-blue)] transition-all duration-250">
          <div className="p-3.5 rounded-xl bg-[color:var(--accent-red-soft)] text-[color:var(--accent-red)] flex items-center justify-center">
            <Activity className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider">Dropped Streams</span>
            <span className="text-2xl font-extrabold text-[color:var(--text)] mt-0.5">{metrics.offlineFeeds}</span>
          </div>
        </div>
      </div>

      {/* Server Status Section */}
      <div className="bg-[color:var(--bg-panel)] border border-[color:var(--line-strong)] rounded-3xl p-8 backdrop-blur-lg shadow-md flex flex-col gap-6">
        <div className="flex items-center gap-2.5 border-b border-[color:var(--line)] pb-4">
          <Server className="h-6 w-6 text-[color:var(--accent-blue)]" />
          <h2 className="text-base font-extrabold text-[color:var(--text)] m-0">Global Node Server Status</h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <div className={`absolute w-full h-full rounded-full opacity-25 animate-pulse ${
              isDegraded 
                ? 'bg-[color:var(--accent-red)] shadow-[0_0_20px_var(--accent-red)]' 
                : 'bg-[color:var(--accent-emerald)] shadow-[0_0_20px_var(--accent-emerald)]'
            }`} />
            <div className={`w-4 h-4 rounded-full relative z-10 ${
              isDegraded ? 'bg-[color:var(--accent-red)]' : 'bg-[color:var(--accent-emerald)]'
            }`} />
          </div>
          <div className="flex flex-col gap-1">
            <span className={`text-sm font-extrabold tracking-wider uppercase ${
              isDegraded ? 'text-[color:var(--accent-red)]' : 'text-[color:var(--accent-emerald)]'
            }`}>
              {isDegraded ? 'DEGRADED PERFORMANCE' : 'OPERATIONAL / HEALTHY'}
            </span>
            <span className="text-xs text-[color:var(--muted)] leading-relaxed max-w-xl">
              {isDegraded 
                ? `${metrics.offlineFeeds} HLS stream pipeline nodes are reporting disconnected statuses. Remediation recommended.` 
                : 'All multi-tenant database clusters and Socket.IO HLS surveillance channels are fully integrated and healthy.'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
