import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'
import { Sliders, RefreshCw, Trash2, X, AlertTriangle, Check, Loader2 } from 'lucide-react'

export default function ProblemList() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const fetchReports = async () => {
    try {
      const data = await api('/admin/reports')
      setReports(data || [])
    } catch (err) {
      console.error('[ProblemList] Failed to fetch reports:', err)
      setError('Failed to fetch system issue dispatches.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleRemoteFix = async (action, targetOrgId) => {
    setActionLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await api('/admin/remote-fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, targetOrgId })
      })
      setSuccess(res.message || 'Remote remediation executed successfully!')
    } catch (err) {
      console.error('[ProblemList] Remote fix action execution failed:', err)
      setError(err.message || 'Action dispatch failed.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-9 h-9 animate-spin text-[color:var(--accent-blue)]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 animate-[fade-in_0.2s_ease-out]">
      <div className="border-b border-[color:var(--line)] pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--text)] m-0">
          User Reported Problems
        </h1>
        <p className="text-sm text-[color:var(--muted)] mt-2">
          Review pipeline dispatches, customer complaints, and trigger remote framework recoveries.
        </p>
      </div>

      {success && (
        <div className="bg-[color:var(--accent-emerald-soft)] border border-[color:var(--accent-emerald)]/30 text-[color:var(--accent-emerald)] px-5 py-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-md animate-[fade-in_0.2s_ease-out]">
          <Check className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-[color:var(--accent-red-soft)] border border-[color:var(--accent-red)]/30 text-[color:var(--accent-red)] px-5 py-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-md animate-[fade-in_0.2s_ease-out]">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-[color:var(--bg-panel)] border border-[color:var(--line-strong)] rounded-3xl p-6 backdrop-blur-lg shadow-md overflow-x-auto">
        <table className="min-w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-[color:var(--line-strong)]">
              <th className="pb-4 font-bold text-xs uppercase tracking-wider text-[color:var(--accent-blue)]">Issue Title</th>
              <th className="pb-4 font-bold text-xs uppercase tracking-wider text-[color:var(--accent-blue)]">Reporter Name</th>
              <th className="pb-4 font-bold text-xs uppercase tracking-wider text-[color:var(--accent-blue)]">Organization Silo</th>
              <th className="pb-4 font-bold text-xs uppercase tracking-wider text-[color:var(--accent-blue)]">Category</th>
              <th className="pb-4 font-bold text-xs uppercase tracking-wider text-[color:var(--accent-blue)]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--line)]">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[color:var(--muted)] font-medium">
                  No active problem dispatches reported.
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr 
                  key={r.id} 
                  className="hover:bg-[color:var(--accent-blue-soft)] transition-colors duration-200 cursor-pointer"
                  onClick={() => setSelectedReport(r)}
                >
                  <td className="py-4.5 font-bold text-[color:var(--text)]">{r.title}</td>
                  <td className="py-4.5 text-[color:var(--text)]">{r.reporter_name || 'System Admin'}</td>
                  <td className="py-4.5 text-[color:var(--text)]">{r.organization_name || 'Global Core'}</td>
                  <td className="py-4.5">
                    <span className="font-mono text-[10px] font-bold bg-[color:var(--bg-chip)] text-[color:var(--text)] px-2.5 py-1 rounded-lg border border-[color:var(--line)]">
                      {r.category?.toUpperCase() || 'BUG'}
                    </span>
                  </td>
                  <td className="py-4.5">
                    <span className={`inline-flex text-[10px] font-extrabold px-2.5 py-1 rounded-lg ${
                      r.status === 'open'
                        ? 'bg-[color:var(--accent-amber-soft)] text-[color:var(--accent-amber)] border border-[color:var(--accent-amber)]/20'
                        : 'bg-[color:var(--accent-emerald-soft)] text-[color:var(--accent-emerald)] border border-[color:var(--accent-emerald)]/20'
                    }`}>
                      {(r.status || 'open').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Right side drawer */}
      {selectedReport && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end animate-[fade-in_0.2s_ease-out]" 
          onClick={() => setSelectedReport(null)}
        >
          <div 
            className="w-full max-w-md h-full bg-[color:var(--bg-panel)] border-l border-[color:var(--line-strong)] backdrop-blur-2xl shadow-2xl flex flex-col color-[color:var(--text)] animate-[slide-in_0.25s_cubic-bezier(0.16,1,0.3,1)]" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[color:var(--line-strong)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sliders className="h-5 w-5 text-[color:var(--accent-blue)]" />
                <h2 className="text-base font-extrabold text-[color:var(--text)]">Remote Repair Center</h2>
              </div>
              <button 
                className="bg-[color:var(--bg-chip)] border border-[color:var(--line)] text-[color:var(--muted)] hover:bg-[color:var(--accent-red-soft)] hover:text-[color:var(--accent-red)] rounded-full w-8.5 h-8.5 flex items-center justify-center cursor-pointer transition-all duration-200" 
                onClick={() => setSelectedReport(null)}
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex-1 p-6 flex flex-col gap-6">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold tracking-widest text-[color:var(--accent-blue)] uppercase mb-2.5">
                  Reported Ticket Details
                </label>
                <div className="bg-[color:var(--bg-chip)] border border-[color:var(--line)] rounded-2xl p-5">
                  <h3 className="text-base font-extrabold text-[color:var(--text)] m-0 mb-2">{selectedReport.title}</h3>
                  <p className="text-xs text-[color:var(--muted)] leading-relaxed m-0">{selectedReport.description}</p>
                  <div className="text-[11px] text-[color:var(--muted)] flex flex-col gap-1 mt-4 border-t border-[color:var(--line)] pt-3.5">
                    <p><strong>Reporter:</strong> {selectedReport.reporter_name} ({selectedReport.reporter_email})</p>
                    <p><strong>Tenant Name:</strong> {selectedReport.organization_name}</p>
                    <p><strong>Org ID:</strong> <code className="font-mono text-[10px] text-[color:var(--accent-blue)] bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">{selectedReport.organization_id}</code></p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col mt-auto">
                <label className="text-[10px] font-bold tracking-widest text-[color:var(--accent-blue)] uppercase mb-2.5">
                  Remediation Control Actions
                </label>
                <p className="text-xs text-[color:var(--muted)] leading-relaxed mb-4">
                  Dispatch network frames to the target organization's active Socket.IO connection blocks to fix runtime stalls instantly.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    className="w-full bg-[color:var(--accent-blue)] text-white hover:bg-blue-700 hover:shadow-lg rounded-xl py-3.5 px-5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all duration-250 active:scale-98 disabled:opacity-50"
                    disabled={actionLoading}
                    onClick={() => handleRemoteFix('RESTART_HLS_PIPELINE', selectedReport.organization_id)}
                  >
                    <RefreshCw className={`h-4 w-4 ${actionLoading ? 'animate-spin' : ''}`} />
                    Restart Target Tenant Pipeline
                  </button>

                  <button
                    className="w-full bg-[color:var(--accent-red-soft)] border border-[color:var(--accent-red)]/30 text-[color:var(--accent-red)] hover:bg-[color:var(--accent-red)] hover:text-white hover:shadow-lg rounded-xl py-3.5 px-5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all duration-250 active:scale-98 disabled:opacity-50"
                    disabled={actionLoading}
                    onClick={() => handleRemoteFix('FLUSH_ALERTS', selectedReport.organization_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Target Database Alerts
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
