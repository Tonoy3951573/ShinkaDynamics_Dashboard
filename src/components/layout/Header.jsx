import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellRing, Menu, X, LogOut } from 'lucide-react'
import { cn, ghostButton, panelChip, surfaceCard } from '../../lib/ui'
import { useDashboard } from '../../context/useDashboard'
import { useAuth } from '../../context/AuthContext'
import { AccountSettingsModal } from '../AccountSettingsModal'
import { ConnectionStatus } from './ConnectionStatus'

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export function Header() {
  const {
    dashboardData,
    mobileSidebarOpen,
    setThemeMode,
    themeMode,
    toggleMobileSidebar,
    alerts,
    fetchAlerts,
    socketStatus,
  } = useDashboard()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [settings, setSettings] = useState({
    liveAlerts: true,
    supervisorDigest: true,
    privacyMode: false,
  })
  const profileRef = useRef(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const activeAlertCount = alerts.filter(
    (a) => a.status === 'active' || a.status === 'acknowledged'
  ).length

  // Fetch alerts for the bell badge
  useEffect(() => {
    if (user) fetchAlerts()
  }, [user])
  
  const displayUserName = user?.name
    ? user.name
    : user?.email
      ? user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ')
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : 'User'

  const initials = displayUserName
    .split(' ')
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const toggleSetting = (key) => {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  return (
    <header className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className={cn(
              'group inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-[color:var(--bg-panel)] text-[color:var(--text)] transition hover:-translate-y-0.5 hover:bg-[color:var(--bg-strong)] lg:hidden',
              mobileSidebarOpen &&
                'border-[color:var(--accent-blue)] text-[color:var(--accent-blue)]',
            )}
            type="button"
            onClick={toggleMobileSidebar}
            aria-label={mobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={mobileSidebarOpen}
          >
            <span className="relative h-5 w-5">
              <Menu
                className={cn(
                  'absolute inset-0 h-5 w-5 transition duration-300',
                  mobileSidebarOpen
                    ? 'scale-75 opacity-0 -rotate-90'
                    : 'scale-100 opacity-100 rotate-0',
                )}
                strokeWidth={2.2}
              />
              <X
                className={cn(
                  'absolute inset-0 h-5 w-5 transition duration-300',
                  mobileSidebarOpen
                    ? 'scale-100 opacity-100 rotate-0'
                    : 'scale-75 opacity-0 rotate-90',
                )}
                strokeWidth={2.2}
              />
            </span>
          </button>
        </div>
        <div>
          <p className="mb-2 text-[0.72rem] font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Employee Behavior Rating Platform
          </p>
          <h1 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[0.95] tracking-[-0.05em] text-[color:var(--text)]">
            Customer Interaction Intelligence Dashboard
          </h1>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 sm:justify-end">
        <div
          className="inline-flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-1"
          role="group"
          aria-label="Color theme"
        >
          {themeOptions.map((option) => (
            <button
              key={option.value}
              className={cn(
                'rounded-full px-3.5 py-2 text-sm font-semibold transition',
                themeMode === option.value
                  ? 'bg-[color:var(--accent-blue)] text-white'
                  : 'text-[color:var(--muted)] hover:bg-[color:var(--bg-strong)] hover:text-[color:var(--text)]',
              )}
              type="button"
              onClick={() => setThemeMode(option.value)}
              aria-pressed={themeMode === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
        <ConnectionStatus status={socketStatus} />
        <button className="hidden items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-2.5 text-sm font-semibold text-[color:var(--text)] transition hover:-translate-y-0.5 hover:border-[color:var(--line-strong)] hover:bg-[color:var(--bg-strong)] sm:inline-flex" type="button">
          Export Report
        </button>
        <button
          className="relative inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-2.5 text-[color:var(--text)] transition hover:-translate-y-0.5 hover:border-[color:var(--line-strong)] hover:bg-[color:var(--bg-strong)]"
          type="button"
          onClick={() => navigate('/alerts')}
          aria-label={`View alerts${activeAlertCount > 0 ? ` (${activeAlertCount} active)` : ''}`}
          title="Alerts"
        >
          <BellRing className="h-4.5 w-4.5" strokeWidth={2.1} />
          {activeAlertCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[0.6rem] font-black text-white shadow-sm">
              {activeAlertCount > 99 ? '99+' : activeAlertCount}
            </span>
          )}
        </button>
        <div className="relative" ref={profileRef}>
          <button
            className={cn(
              'flex items-center gap-3 rounded-full border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-1.5 pl-4 transition',
              isProfileOpen &&
                'border-[color:var(--line-strong)] bg-[color:var(--bg-strong)]',
            )}
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            aria-expanded={isProfileOpen}
            aria-haspopup="dialog"
            aria-label="Open profile settings"
          >
            <span className="hidden text-sm font-semibold text-[color:var(--text)] sm:inline">
              {displayUserName}
            </span>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--accent-blue-soft)] font-bold text-[color:var(--accent-blue)]">
              {initials}
            </span>
          </button>

          {isProfileOpen ? (
            <div
              className={cn(
                surfaceCard,
                'fixed inset-x-3 top-20 z-50 mx-auto max-h-[calc(100dvh-6rem)] overflow-y-auto p-5 sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mx-0 sm:mt-3 sm:max-h-[80vh] sm:w-[min(24rem,calc(100vw-2rem))]',
              )}
              role="dialog"
              aria-label="Profile settings"
            >
              <div className="flex flex-col gap-4 border-b border-[color:var(--line)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--accent-blue-soft)] font-bold text-[color:var(--accent-blue)]">
                    {initials}
                  </span>
                  <div>
                    <strong className="block text-[color:var(--text)]">
                      {displayUserName}
                    </strong>
                    <span className="block text-xs text-[color:var(--muted)]">
                      {user?.email}
                    </span>
                    <p className="mt-1 text-xs font-semibold text-[color:var(--accent-emerald)] capitalize">
                      {user?.role || 'staff'}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    panelChip,
                    'w-fit border-transparent bg-[color:var(--accent-emerald-soft)] text-[color:var(--pill-good-text)]',
                  )}
                >
                  Online
                </span>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  Workspace
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-4">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                      Active branch
                    </span>
                    <strong className="mt-2 block text-[color:var(--text)]">
                      {user?.organization?.name || 'My Organization'}
                    </strong>
                  </div>
                  <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-4">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                      Access level
                    </span>
                    <strong className="mt-2 block text-[color:var(--text)] capitalize">
                      {user?.role === 'admin' ? 'Executive Control' : user?.role || 'Staff'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  Settings
                </p>
                <button
                  className="flex w-full items-center justify-between gap-4 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-3 text-left transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--bg-strong)]"
                  type="button"
                  onClick={() => toggleSetting('liveAlerts')}
                  aria-pressed={settings.liveAlerts}
                >
                  <div>
                    <strong className="block text-[color:var(--text)]">
                      Live risk alerts
                    </strong>
                    <span className="text-sm text-[color:var(--muted)]">
                      Instant warnings for high-severity interactions
                    </span>
                  </div>
                  <span
                    className={cn(
                      'flex h-7 w-12 items-center rounded-full p-1 transition',
                      settings.liveAlerts
                        ? 'bg-[color:var(--accent-blue)]'
                        : 'bg-[color:var(--line-strong)]',
                    )}
                  >
                    <span
                      className={cn(
                        'h-5 w-5 rounded-full bg-white transition',
                        settings.liveAlerts && 'translate-x-5',
                      )}
                    ></span>
                  </span>
                </button>
                <button
                  className="mt-3 flex w-full items-center justify-between gap-4 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-3 text-left transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--bg-strong)]"
                  type="button"
                  onClick={() => toggleSetting('supervisorDigest')}
                  aria-pressed={settings.supervisorDigest}
                >
                  <div>
                    <strong className="block text-[color:var(--text)]">
                      Supervisor digest
                    </strong>
                    <span className="text-sm text-[color:var(--muted)]">
                      Daily summary delivered before closing review
                    </span>
                  </div>
                  <span
                    className={cn(
                      'flex h-7 w-12 items-center rounded-full p-1 transition',
                      settings.supervisorDigest
                        ? 'bg-[color:var(--accent-blue)]'
                        : 'bg-[color:var(--line-strong)]',
                    )}
                  >
                    <span
                      className={cn(
                        'h-5 w-5 rounded-full bg-white transition',
                        settings.supervisorDigest && 'translate-x-5',
                      )}
                    ></span>
                  </span>
                </button>
                <button
                  className="mt-3 flex w-full items-center justify-between gap-4 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] px-4 py-3 text-left transition hover:border-[color:var(--line-strong)] hover:bg-[color:var(--bg-strong)]"
                  type="button"
                  onClick={() => toggleSetting('privacyMode')}
                  aria-pressed={settings.privacyMode}
                >
                  <div>
                    <strong className="block text-[color:var(--text)]">
                      Privacy review mode
                    </strong>
                    <span className="text-sm text-[color:var(--muted)]">
                      Limit employee identity visibility during audits
                    </span>
                  </div>
                  <span
                    className={cn(
                      'flex h-7 w-12 items-center rounded-full p-1 transition',
                      settings.privacyMode
                        ? 'bg-[color:var(--accent-blue)]'
                        : 'bg-[color:var(--line-strong)]',
                    )}
                  >
                    <span
                      className={cn(
                        'h-5 w-5 rounded-full bg-white transition',
                        settings.privacyMode && 'translate-x-5',
                      )}
                    ></span>
                  </span>
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button 
                  className={cn(ghostButton, 'flex-1 text-red-500 hover:text-red-600 hover:bg-red-500/10')} 
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
                <button
                  className="flex-1 rounded-full bg-[color:var(--accent-blue)] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105"
                  type="button"
                  onClick={() => {
                    setIsSettingsModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                >
                  Account Settings
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <AccountSettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
    </header>
  )
}
