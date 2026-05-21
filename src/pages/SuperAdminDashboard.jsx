import { useEffect, useState } from 'react'
import { 
  Building,
  Users,
  Video,
  AlertTriangle,
  X,
  RefreshCw,
  Trash2,
  Terminal,
  Settings,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Activity
} from 'lucide-react'
import { api } from '../lib/api'
import '../styles/SuperAdminDashboard.css'

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalOrganizations: 0,
    totalUsers: 0,
    onlineFeeds: 0,
    offlineFeeds: 0
  })
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const loadAdminTelemetry = async () => {
    try {
      const [metricsData, tenantsData] = await Promise.all([
        api('/admin/metrics'),
        api('/admin/tenants')
      ])
      setMetrics(metricsData || {
        totalOrganizations: 0,
        totalUsers: 0,
        onlineFeeds: 0,
        offlineFeeds: 0
      })
      setTenants(tenantsData || [])
    } catch (err) {
      console.error('[super-admin] Fetch telemetry failed:', err)
      setErrorMessage('Failed to load operational control center datasets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminTelemetry()
  }, [])

  const handleRemoteRemediation = async (action, targetOrgId) => {
    setActionLoading(true)
    setSuccessMessage(null)
    setErrorMessage(null)
    try {
      const res = await api('/admin/remote-fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, targetOrgId })
      })
      
      setSuccessMessage(res.message || 'Remediation dispatched successfully!')
      
      // Auto-reload metrics and tenants to capture SQLite updates
      const [updatedMetrics, updatedTenants] = await Promise.all([
        api('/admin/metrics'),
        api('/admin/tenants')
      ])
      setMetrics(updatedMetrics)
      setTenants(updatedTenants)

      // Update selectedTenant stats inside drawer if open
      if (selectedTenant && selectedTenant.id === targetOrgId) {
        const matching = updatedTenants.find(t => t.id === targetOrgId)
        if (matching) setSelectedTenant(matching)
      }
    } catch (err) {
      console.error('[remediation-engine] Action execution error:', err)
      setErrorMessage(err.message || 'Remediation action dispatch failed.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="sad-loading-viewport">
        <div className="sad-spinner"></div>
      </div>
    )
  }

  return (
    <div className="sad-container">
      {/* ── Header ── */}
      <header className="sad-header">
        <div className="sad-header-left">
          <Terminal className="sad-header-icon" />
          <div>
            <h1 className="sad-title">Super Admin Command Center</h1>
            <p className="sad-subtitle">
              System-wide telemetry, multi-tenant silo inspections, and active remote video pipeline remediation.
            </p>
          </div>
        </div>
      </header>

      {/* ── Toast Notifications ── */}
      {successMessage && (
        <div className="sad-alert sad-alert-success">
          <CheckCircle2 className="h-5 w-5" />
          <span>{successMessage}</span>
          <button className="sad-alert-close" onClick={() => setSuccessMessage(null)}><X className="h-4 w-4" /></button>
        </div>
      )}
      {errorMessage && (
        <div className="sad-alert sad-alert-error">
          <AlertTriangle className="h-5 w-5" />
          <span>{errorMessage}</span>
          <button className="sad-alert-close" onClick={() => setErrorMessage(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* ── Diagnostic Counters Row ── */}
      <div className="sad-stats-grid">
        <div className="sad-stat-card">
          <div className="sad-stat-icon-wrapper sad-stat-icon-orgs">
            <Building className="h-6 w-6" />
          </div>
          <div className="sad-stat-info">
            <span className="sad-stat-label">Total Orgs</span>
            <span className="sad-stat-value">{metrics.totalOrganizations}</span>
          </div>
        </div>

        <div className="sad-stat-card">
          <div className="sad-stat-icon-wrapper sad-stat-icon-users">
            <Users className="h-6 w-6" />
          </div>
          <div className="sad-stat-info">
            <span className="sad-stat-label">Total Users</span>
            <span className="sad-stat-value">{metrics.totalUsers}</span>
          </div>
        </div>

        <div className="sad-stat-card">
          <div className="sad-stat-icon-wrapper sad-stat-icon-live">
            <Video className="h-6 w-6" />
          </div>
          <div className="sad-stat-info">
            <span className="sad-stat-label">Live Pipelines</span>
            <span className="sad-stat-value">{metrics.onlineFeeds}</span>
          </div>
        </div>

        <div className="sad-stat-card">
          <div className="sad-stat-icon-wrapper sad-stat-icon-dropped">
            <Activity className="h-6 w-6" />
          </div>
          <div className="sad-stat-info">
            <span className="sad-stat-label">Dropped Streams</span>
            <span className="sad-stat-value">{metrics.offlineFeeds}</span>
          </div>
        </div>
      </div>

      {/* ── Main Data Table ── */}
      <div className="sad-table-wrapper">
        <div className="sad-table-header">
          <h2 className="sad-table-title">Multi-Tenant Operational Health Silos</h2>
        </div>

        {tenants.length === 0 ? (
          <div className="sad-empty-state">
            <Building className="h-12 w-12 text-[#81A1C1] mb-3 opacity-60" />
            <p className="font-semibold text-slate-300">No organizations registered</p>
            <p className="text-xs text-[#D8DEE9] mt-1">Tenant silo health analytics will render here.</p>
          </div>
        ) : (
          <div className="sad-table-container">
            <table className="sad-table">
              <thead>
                <tr>
                  <th>Tenant Silo / Org Name</th>
                  <th>ID</th>
                  <th>Subscription Plan</th>
                  <th>Active Users</th>
                  <th>Offline Pipelines</th>
                  <th>Open Tickets</th>
                  <th style={{ textAlign: 'right' }}>Administrative Action</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => {
                  const hasOffline = tenant.offline_cameras_count > 0;
                  return (
                    <tr 
                      key={tenant.id} 
                      className={`sad-row-clickable ${hasOffline ? 'sad-row-offline-tint' : ''}`}
                      onClick={() => setSelectedTenant(tenant)}
                    >
                      <td className="sad-cell-bold text-slate-100">{tenant.name}</td>
                      <td className="font-mono text-xs text-[#81A1C1]">{tenant.id}</td>
                      <td>
                        <span className={`sad-badge-plan ${tenant.plan === 'premium' ? 'plan-premium' : 'plan-free'}`}>
                          {tenant.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="font-semibold text-slate-300">{tenant.user_count}</td>
                      <td className={`font-bold ${hasOffline ? 'text-[#BF616A]' : 'text-slate-400'}`}>
                        {tenant.offline_cameras_count}
                      </td>
                      <td className="text-slate-300">{tenant.open_reports_count}</td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedTenant(tenant)}
                          className="sad-investigate-btn"
                          title="Open Remote Control Panel Drawer"
                        >
                          <Sliders className="h-3.5 w-3.5" />
                          Open Control Panel
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Absolute Glassmorphic Side-Drawer ── */}
      {selectedTenant && (
        <div className="sad-drawer-overlay" onClick={() => setSelectedTenant(null)}>
          <div className="sad-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="sad-drawer-header">
              <div className="sad-drawer-header-left">
                <Sliders className="h-5 w-5 text-[#88C0D0]" />
                <h2>Tenant Remediation Panel</h2>
              </div>
              <button className="sad-drawer-close" onClick={() => setSelectedTenant(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="sad-drawer-content">
              <div className="sad-drawer-section">
                <label className="sad-drawer-label">Active Organization Silo</label>
                <div className="sad-meta-card">
                  <h3 className="sad-drawer-title">{selectedTenant.name}</h3>
                  <span className="text-xs text-[#81A1C1] font-mono">ID: {selectedTenant.id}</span>
                  <div className="mt-3 flex gap-2">
                    <span className={`sad-badge-plan ${selectedTenant.plan === 'premium' ? 'plan-premium' : 'plan-free'}`}>
                      PLAN: {selectedTenant.plan.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sad-drawer-section">
                <label className="sad-drawer-label">Tenant System Telemetry</label>
                <div className="sad-drawer-telemetry-grid">
                  <div className="sad-telemetry-item">
                    <span className="sad-telemetry-val">{selectedTenant.user_count}</span>
                    <span className="sad-telemetry-lbl">ACTIVE USERS</span>
                  </div>
                  <div className="sad-telemetry-item">
                    <span className={`sad-telemetry-val ${selectedTenant.offline_cameras_count > 0 ? 'text-[#BF616A]' : ''}`}>
                      {selectedTenant.offline_cameras_count}
                    </span>
                    <span className="sad-telemetry-lbl">OFFLINE PIPELINES</span>
                  </div>
                  <div className="sad-telemetry-item">
                    <span className="sad-telemetry-val">{selectedTenant.open_reports_count}</span>
                    <span className="sad-telemetry-lbl">OPEN TICKETS</span>
                  </div>
                </div>
              </div>

              <div className="sad-drawer-actions-wrapper">
                <label className="sad-drawer-label">Super User Corrective Action Dispatchers</label>
                <p className="sad-drawer-actions-tip">
                  Initiate real-time background mutations or broadcast websocket signal frames to bypass isolated multi-tenant data structures.
                </p>

                <div className="sad-drawer-buttons">
                  <button
                    className="sad-action-btn sad-action-btn-restart"
                    disabled={actionLoading}
                    onClick={() => handleRemoteRemediation('RESTART_HLS_PIPELINE', selectedTenant.id)}
                  >
                    <RefreshCw className={`h-4 w-4 ${actionLoading ? 'animate-spin' : ''}`} />
                    Force Re-Initialize Video Pipelines
                  </button>

                  <button
                    className="sad-action-btn sad-action-btn-purge"
                    disabled={actionLoading}
                    onClick={() => handleRemoteRemediation('FLUSH_ALERTS', selectedTenant.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Flush Active Memory Cache
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
