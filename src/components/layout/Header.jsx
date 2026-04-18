import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn, ghostButton, panelChip, surfaceCard } from '../../lib/ui'
import { useDashboard } from '../../context/useDashboard'

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
  } = useDashboard()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [settings, setSettings] = useState({
    liveAlerts: true,
    supervisorDigest: true,
    privacyMode: false,
  })
  const profileRef = useRef(null)
  const { user } = dashboardData
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
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
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
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
        <button className={ghostButton} type="button">
          Export Report
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
              {user.name}
            </span>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--accent-blue-soft)] font-bold text-[color:var(--accent-blue)]">
              {initials}
            </span>
          </button>

          {isProfileOpen ? (
            <div
              className={cn(
                surfaceCard,
                'absolute right-0 top-full z-20 mt-3 w-[min(24rem,calc(100vw-2rem))] p-5',
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
                      {user.name}
                    </strong>
                    <p className="text-sm text-[color:var(--muted)]">
                      {user.role}
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
                      Gulshan Premium Store
                    </strong>
                  </div>
                  <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-4">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                      Access level
                    </span>
                    <strong className="mt-2 block text-[color:var(--text)]">
                      Executive Control
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
                <button className={cn(ghostButton, 'flex-1')} type="button">
                  Account Settings
                </button>
                <button
                  className="flex-1 rounded-full bg-[color:var(--accent-blue)] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105"
                  type="button"
                >
                  Open Admin Panel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
