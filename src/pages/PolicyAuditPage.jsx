import { useEffect, useState } from 'react'
import { 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight, 
  Settings, 
  FileText, 
  Trash2, 
  Clock, 
  CheckCircle,
  AlertOctagon,
  BookOpen
} from 'lucide-react'
import { api } from '../lib/api'

export function PolicyAuditPage() {
  // ── 1. Compliance States ───────────────────────────────────────────
  const [consentActive, setConsentActive] = useState(true)
  const [supervisorGate, setSupervisorGate] = useState(true)
  const [audioRecording, setAudioRecording] = useState(false)
  const [smileSensitivity, setSmileSensitivity] = useState(70)
  const [pitchThreshold, setPitchThreshold] = useState(65)
  const [retentionDays, setRetentionDays] = useState(30)
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)

  // ── 2. Load settings on mount ──────────────────────────────────────
  useEffect(() => {
    let active = true
    setLoading(true)

    api('/compliance')
      .then((data) => {
        if (!active) return
        setConsentActive(data.settings.consentActive)
        setSupervisorGate(data.settings.supervisorGate)
        setAudioRecording(data.settings.audioRecording)
        setSmileSensitivity(data.settings.smileSensitivity)
        setPitchThreshold(data.settings.pitchThreshold)
        setRetentionDays(data.settings.retentionDays)
        setAuditLogs(data.logs || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('[compliance] load error:', err)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const [purging, setPurging] = useState(false)
  const [purgeSuccess, setPurgeSuccess] = useState(false)

  // ── 3. Persist Settings Helper ─────────────────────────────────────
  const persistSettings = async (updates) => {
    const payload = {
      consentActive,
      supervisorGate,
      audioRecording,
      smileSensitivity,
      pitchThreshold,
      retentionDays,
      ...updates
    }

    try {
      await api('/compliance/settings', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    } catch (err) {
      console.error('[compliance] failed to persist settings:', err)
    }
  }

  // ── 4. Handlers ────────────────────────────────────────────────────
  const handlePurge = async () => {
    setPurging(true)
    try {
      await api('/compliance/purge', {
        method: 'POST',
        body: JSON.stringify({ retentionDays })
      })
      setPurgeSuccess(true)
      
      // Reload logs table
      const refreshed = await api('/compliance')
      setAuditLogs(refreshed.logs || [])
      
      setTimeout(() => setPurgeSuccess(false), 3000)
    } catch (err) {
      console.error('[compliance] manual purge failed:', err)
    } finally {
      setPurging(false)
    }
  }

  const handleToggle = async (value, setter, fieldKey, label) => {
    const nextState = !value
    setter(nextState)
    
    // 1. Persist log on database
    try {
      const logResult = await api('/compliance/audit', {
        method: 'POST',
        body: JSON.stringify({
          actor: 'Manager (Alex Rivera)',
          action: `Toggled policy "${label}" to ${nextState ? 'ENABLED' : 'DISABLED'}`,
          target: 'Global Compliance Settings'
        })
      })

      // Update local logs
      setAuditLogs((prev) => [
        {
          id: logResult.id,
          actor: 'Manager (Alex Rivera)',
          action: `Toggled policy "${label}" to ${nextState ? 'ENABLED' : 'DISABLED'}`,
          target: 'Global Compliance Settings',
          timestamp: new Date().toISOString(),
          status: 'Success'
        },
        ...prev
      ])
    } catch (err) {
      console.error('[compliance] failed to log policy change:', err)
    }

    // 2. Persist update on database
    await persistSettings({ [fieldKey]: nextState })
  }

  const handleSliderChange = (value, setter, fieldKey) => {
    setter(value)
    persistSettings({ [fieldKey]: value })
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[color:var(--line)] border-t-[color:var(--accent-blue)]"></div>
      </div>
    )
  }

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[color:var(--text)]">
            Policy & Compliance Audits
          </h1>
          <p className="mt-2 text-lg text-[color:var(--muted)]">
            Establish legal compliance safeguards, supervise supervisor approvals, and review operational audit logs.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* ── Policy Controls Dashboard ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Legal Safeguards */}
          <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-[color:var(--text)] mb-6">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
              Legal Compliance Safeguards
            </h3>

            <div className="space-y-6">
              {/* Safeguard: Consent Agreements */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[color:var(--bg-strong)] border border-[color:var(--line)]">
                <div>
                  <h4 className="text-sm font-bold text-[color:var(--text)]">Consent & Disclosure Agreements</h4>
                  <p className="mt-1 text-xs text-[color:var(--muted)] max-w-md">
                    Enforces that all monitored employees must have a signed consent form recorded in the system before receiving active AI evaluations.
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(consentActive, setConsentActive, 'consentActive', 'Consent Agreements')}
                  className="text-blue-500 hover:text-blue-600 transition shrink-0"
                >
                  {consentActive ? (
                    <ToggleRight className="h-10 w-10 text-blue-500" strokeWidth={1.5} />
                  ) : (
                    <ToggleLeft className="h-10 w-10 text-[color:var(--muted)]" strokeWidth={1.5} />
                  )}
                </button>
              </div>

              {/* Safeguard: Supervisor Approval Gate */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[color:var(--bg-strong)] border border-[color:var(--line)]">
                <div>
                  <h4 className="text-sm font-bold text-[color:var(--text)]">Supervisor Approval Gateway</h4>
                  <p className="mt-1 text-xs text-[color:var(--muted)] max-w-md">
                    Requires manual supervisor verification and authorization before publishing any negative interaction event to employee scoring profile cards.
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(supervisorGate, setSupervisorGate, 'supervisorGate', 'Supervisor Gateway')}
                  className="text-blue-500 hover:text-blue-600 transition shrink-0"
                >
                  {supervisorGate ? (
                    <ToggleRight className="h-10 w-10 text-blue-500" strokeWidth={1.5} />
                  ) : (
                    <ToggleLeft className="h-10 w-10 text-[color:var(--muted)]" strokeWidth={1.5} />
                  )}
                </button>
              </div>

              {/* Safeguard: Audio/Voice Capture */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[color:var(--bg-strong)] border border-[color:var(--line)]">
                <div>
                  <h4 className="text-sm font-bold text-[color:var(--text)]">Raw Audio Clip Recording</h4>
                  <p className="mt-1 text-xs text-[color:var(--muted)] max-w-md">
                    Permits saving localized audio snippets when vocal aggression is detected. Note: Requires strict local surveillance licensing disclosures.
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(audioRecording, setAudioRecording, 'audioRecording', 'Audio Clips')}
                  className="text-blue-500 hover:text-blue-600 transition shrink-0"
                >
                  {audioRecording ? (
                    <ToggleRight className="h-10 w-10 text-blue-500" strokeWidth={1.5} />
                  ) : (
                    <ToggleLeft className="h-10 w-10 text-[color:var(--muted)]" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section: AI Evaluation Sensitivity */}
          <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-[color:var(--text)] mb-6">
              <Settings className="h-5 w-5 text-blue-500" />
              AI Evaluation Sensitivity Thresholds
            </h3>

            <div className="space-y-6">
              {/* Smile Sensitivity */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-[color:var(--text)]">Smile Recognition Sensitivity</label>
                  <span className="text-xs font-black text-blue-400">{smileSensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="95"
                  value={smileSensitivity}
                  onChange={(e) => handleSliderChange(parseInt(e.target.value), setSmileSensitivity, 'smileSensitivity')}
                  className="w-full h-1.5 bg-[color:var(--line)] rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="mt-1.5 text-[11px] text-[color:var(--muted)]">
                  Higher values make recognition stricter, requiring a larger, more explicit facial smile to count towards scoring indices.
                </p>
              </div>

              {/* Pitch Threshold */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-[color:var(--text)]">Verbal Pitch Escalation Trigger</label>
                  <span className="text-xs font-black text-blue-400">{pitchThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={pitchThreshold}
                  onChange={(e) => handleSliderChange(parseInt(e.target.value), setPitchThreshold, 'pitchThreshold')}
                  className="w-full h-1.5 bg-[color:var(--line)] rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="mt-1.5 text-[11px] text-[color:var(--muted)]">
                  Decreasing this threshold alerts supervisors to lower pitch variations, making tone monitoring highly alert.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Retention & Privacy Actions ── */}
        <div className="space-y-6">
          <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-[color:var(--text)] mb-6">
              <Clock className="h-5 w-5 text-blue-500" />
              Retention Settings
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-[color:var(--text)]">Video Storage Retention</label>
                  <span className="text-xs font-black text-blue-400">{retentionDays} Days</span>
                </div>
                <input
                  type="range"
                  min="7"
                  max="90"
                  step="7"
                  value={retentionDays}
                  onChange={(e) => handleSliderChange(parseInt(e.target.value), setRetentionDays, 'retentionDays')}
                  className="w-full h-1.5 bg-[color:var(--line)] rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="mt-1.5 text-[11px] text-[color:var(--muted)]">
                  Local webcam recordings and HLS buffering clips are automatically deleted from server logs once retention expires.
                </p>
              </div>

              <div className="h-px bg-[color:var(--line)]" />

              <div>
                <h4 className="text-sm font-bold text-[color:var(--text)] mb-2 flex items-center gap-1.5 text-red-400">
                  <AlertOctagon className="h-4 w-4" />
                  Danger Zone
                </h4>
                <p className="text-xs text-[color:var(--muted)] mb-4">
                  Permanently purge historical AI surveillance tracking data, alerts database tables, and associated bounding box coordination histories from disk logs.
                </p>

                <button
                  onClick={handlePurge}
                  disabled={purging}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 py-3 text-xs font-bold text-red-400 transition hover:bg-red-500/20 active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {purging ? 'Purging Data logs...' : 'Purge Surveillance History'}
                </button>

                {purgeSuccess && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-semibold justify-center">
                    <CheckCircle className="h-4 w-4" />
                    Surveillance history cleared!
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-[color:var(--text)] mb-4">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Disclosure Policy
            </h3>
            <p className="text-xs leading-5 text-[color:var(--muted)]">
              AI analysis nodes must always be paired with active supervisor reviews. Disclose bounding box overlays and facial smiles analysis triggers to staff clearly during initial training processes to ensure robust operational cooperation.
            </p>
          </div>
        </div>
      </div>

      {/* ── Supervisor Audit Trails Table ── */}
      <div className="mt-8 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-6">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-[color:var(--text)] mb-6">
          <FileText className="h-5 w-5 text-blue-500" />
          Supervisor Action & Policy Audit Trails
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--line)] text-[11px] font-black uppercase tracking-wider text-[color:var(--muted)]">
                <th className="pb-3 pl-4">Actor</th>
                <th className="pb-3">Action Description</th>
                <th className="pb-3">Target Scope</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3 pr-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line)]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[color:var(--bg-strong)]/40 transition">
                  <td className="py-4 pl-4 font-bold text-[color:var(--text)]">{log.actor}</td>
                  <td className="py-4 text-[color:var(--text)]">{log.action}</td>
                  <td className="py-4 font-mono text-xs text-blue-400">{log.target}</td>
                  <td className="py-4 text-[color:var(--muted)] text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 uppercase tracking-wide">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
