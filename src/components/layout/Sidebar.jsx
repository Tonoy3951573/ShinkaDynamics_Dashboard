import { NavLink } from 'react-router-dom'
import {
  Activity,
  BellRing,
  GitCompareArrows,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react'
import { cn, surfaceCard } from '../../lib/ui'
import { useDashboard } from '../../context/useDashboard'

const navItemHrefByLabel = {
  Overview: '/',
  'Employee Scoring': '/employees',
}

const navIconByLabel = {
  Overview: LayoutDashboard,
  'Live Monitoring': Activity,
  'Employee Scoring': UsersRound,
  'Branch Comparison': GitCompareArrows,
  Alerts: BellRing,
  'Policy & Audit': ShieldCheck,
}

export function Sidebar({ navItems, activeView }) {
  const {
    mobileSidebarOpen,
    setMobileSidebarOpen,
    sidebarCollapsed,
    toggleSidebarCollapsed,
  } = useDashboard()

  const handleBrandToggle = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
      toggleSidebarCollapsed()
    }
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-[min(19rem,calc(100vw-2rem))] flex-col border-r border-[--line] bg-[--sidebar-bg] px-4 py-4 backdrop-blur-xl transition-[transform,width,padding,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-6 lg:sticky lg:top-0 lg:min-h-screen lg:w-auto lg:px-[22px] lg:py-7',
        mobileSidebarOpen
          ? 'translate-x-0 shadow-[0_20px_50px_rgba(27,35,48,0.22)]'
          : '-translate-x-[calc(100%+1rem)] lg:translate-x-0',
        sidebarCollapsed && 'lg:px-3',
      )}
    >
      <div
        className={cn('mb-5 flex items-center gap-3 lg:mb-8', sidebarCollapsed && 'lg:justify-center')}
      >
        <button
          className="group relative grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-[linear-gradient(145deg,#1b2330,#276ef1)] font-display text-lg font-bold text-white [box-shadow:var(--shadow-md)] transition duration-300 hover:-translate-y-0.5 hover:[box-shadow:0_18px_30px_rgba(39,110,241,0.28)] lg:cursor-pointer"
          type="button"
          onClick={handleBrandToggle}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.32),transparent_55%)]"></span>
          <span className="relative z-10 font-display text-lg font-bold tracking-[0.08em] transition duration-300 lg:group-hover:scale-75 lg:group-hover:opacity-0">
            EL
          </span>
          {sidebarCollapsed ? (
            <X
              className="absolute z-10 hidden h-5 w-5 scale-75 opacity-0 transition duration-300 lg:block lg:group-hover:scale-100 lg:group-hover:opacity-100"
              strokeWidth={2.3}
            />
          ) : (
            <Menu
              className="absolute z-10 hidden h-5 w-5 scale-75 opacity-0 transition duration-300 lg:block lg:group-hover:scale-100 lg:group-hover:opacity-100"
              strokeWidth={2.3}
            />
          )}
        </button>
        <div
          className={cn(
            'min-w-0 overflow-hidden transition-[max-width,opacity,transform] duration-400 ease-out',
            sidebarCollapsed
              ? 'lg:max-w-0 lg:opacity-0 lg:-translate-x-3'
              : 'max-w-48 translate-x-0 opacity-100',
          )}
        >
          <strong className="font-display text-lg font-bold text-[color:var(--text)]">
            EngageIQ
          </strong>
          <p className="text-sm text-[color:var(--muted)]">Behavior Rating Suite</p>
        </div>
        <button
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-[color:var(--bg-panel)] text-[color:var(--text)] transition hover:bg-[color:var(--bg-strong)] lg:hidden"
          type="button"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>
      <nav className="grid gap-2" aria-label="Primary">
        {navItems.map((item) => {
          const href = navItemHrefByLabel[item.label] ?? null
          const Icon = navIconByLabel[item.label]
          const isActive =
            (href === '/' && activeView === 'overview') ||
            (href === '/employees' &&
              (activeView === 'employees' || activeView === 'employee-profile')) ||
            (item.active && activeView === 'overview')

          if (!href) {
            return (
              <button
                key={item.label}
                className={cn(
                  'w-full cursor-not-allowed rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[--muted] opacity-70 transition-[padding,background-color,color]',
                  sidebarCollapsed && 'lg:px-2',
                )}
                type="button"
                aria-disabled="true"
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span
                  className={cn(
                    'grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-3',
                    sidebarCollapsed && 'lg:grid-cols-1 lg:justify-items-center lg:gap-0',
                  )}
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[--line] bg-[--bg-panel] text-[--muted]">
                    {Icon ? (
                      <Icon className="h-4 w-4" strokeWidth={2.05} />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-current/60"></span>
                    )}
                  </span>
                  <span
                    className={cn(
                      'truncate transition-[max-width,opacity,transform] duration-300 ease-out',
                      sidebarCollapsed
                        ? 'lg:max-w-0 lg:opacity-0 lg:-translate-x-2'
                        : 'max-w-48 opacity-100',
                    )}
                  >
                    {item.label}
                  </span>
                </span>
              </button>
            )
          }

          return (
            <NavLink
              key={item.label}
              to={href}
              onClick={() => setMobileSidebarOpen(false)}
              className={() =>
                cn(
                  'group block w-full overflow-hidden rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-[padding,background-color,color,box-shadow,border-color] duration-300 text-[--text] hover:bg-[--bg-strong] hover:text-[--accent-blue] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent-blue-soft]',
                  sidebarCollapsed && 'lg:px-2',
                  isActive &&
                    'bg-[--bg-strong] text-[--accent-blue] [box-shadow:0_10px_24px_rgba(39,110,241,0.08)]',
                )
              }
              aria-current={isActive ? 'page' : undefined}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span
                className={cn(
                  'grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-3',
                  sidebarCollapsed && 'lg:grid-cols-1 lg:justify-items-center lg:gap-0',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[--line] bg-[--bg-panel] text-[--muted] transition group-hover:border-transparent group-hover:bg-[--accent-blue-soft]',
                    isActive && 'border-transparent bg-[--accent-blue-soft] text-[--accent-blue]',
                  )}
                >
                  {Icon ? (
                    <Icon className="h-4 w-4" strokeWidth={2.05} />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-current/60"></span>
                  )}
                </span>
                <span
                  className={cn(
                    'truncate transition-[max-width,opacity,transform] duration-300 ease-out',
                    sidebarCollapsed
                      ? 'lg:max-w-0 lg:opacity-0 lg:-translate-x-2'
                      : 'max-w-48 opacity-100',
                  )}
                >
                  {item.label}
                </span>
              </span>
            </NavLink>
          )
        })}
      </nav>
      <div
        className={cn(
          surfaceCard,
          'mt-6 overflow-hidden p-4 transition-[padding,opacity,transform,max-height] duration-400 ease-out lg:mt-8',
          sidebarCollapsed &&
            'lg:max-h-0 lg:translate-y-3 lg:border-transparent lg:p-0 lg:opacity-0',
        )}
      >
        <p className="text-sm leading-6 text-[--muted]">
          AI monitoring should stay paired with consent, policy disclosure, and supervisor review.
        </p>
      </div>
    </aside>
  )
}
