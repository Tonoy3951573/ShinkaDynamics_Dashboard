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
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 1024px)').matches
    ) {
      toggleSidebarCollapsed()
    }
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex shrink-0 w-[min(19rem,calc(100vw-2rem))] flex-col border-r border-[color:var(--line)] bg-[color:var(--sidebar-bg)] px-4 py-4 backdrop-blur-xl transition-[width,transform] duration-300 ease-out sm:px-6 lg:sticky lg:top-0 lg:min-h-screen lg:bg-[color:var(--bg-strong)] lg:backdrop-blur-none lg:px-[28px] lg:py-7 lg:overflow-hidden',
        mobileSidebarOpen
          ? 'translate-x-0 shadow-[0_20px_50px_rgba(27,35,48,0.22)]'
          : '-translate-x-[calc(100%+1rem)] lg:translate-x-0',
        sidebarCollapsed ? 'lg:w-[104px]' : 'lg:w-[280px]',
      )}
    >
      <div className="mb-5 flex items-center gap-3 lg:mb-8">
        <button
          className="group relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[linear-gradient(145deg,#1b2330,#276ef1)] font-display text-lg font-bold text-white [box-shadow:var(--shadow-md)] transition duration-300 lg:hover:-translate-y-0.5 hover:[box-shadow:0_18px_30px_rgba(39,110,241,0.28)] lg:hover:[box-shadow:0_18px_30px_rgba(39,110,241,0.28)]"
          type="button"
          onClick={handleBrandToggle}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.32),transparent_55%)]"></span>
          <span className="relative z-10 font-display text-lg font-bold tracking-[0.08em] transition duration-300 lg:group-hover:scale-75 lg:group-hover:opacity-0">
            SD
          </span>
          {sidebarCollapsed ? (
            <Menu
              className="absolute z-10 hidden h-5 w-5 scale-75 opacity-0 transition duration-300 lg:block lg:group-hover:scale-100 lg:group-hover:opacity-100"
              strokeWidth={2.3}
            />
          ) : (
            <X
              className="absolute z-10 hidden h-5 w-5 scale-75 opacity-0 transition duration-300 lg:block lg:group-hover:scale-100 lg:group-hover:opacity-100"
              strokeWidth={2.3}
            />
          )}
        </button>
        <div
          className={cn(
            'flex flex-col justify-center overflow-hidden whitespace-nowrap transition-[width,opacity] duration-300 ease-out',
            sidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100 lg:w-[150px]',
          )}
        >
          <strong className="font-display text-lg font-bold text-[color:var(--text)]">
            Shinka Dynamics
          </strong>
          <p className="text-sm text-[color:var(--muted)]">
            Behavior Rating Suite
          </p>
        </div>
        <button
          className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-panel)] text-[color:var(--text)] transition hover:bg-[color:var(--bg-strong)] lg:hidden"
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
              (activeView === 'employees' ||
                activeView === 'employee-profile')) ||
            (item.active && activeView === 'overview')

          const baseLinkClass = cn(
            'group flex items-center gap-3 rounded-lg p-2 text-left text-sm font-semibold transition-[width,background-color] duration-300 ease-out text-[color:var(--text)] hover:bg-[color:var(--bg-strong)] hover:text-[color:var(--accent-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-blue-soft)] overflow-hidden whitespace-nowrap',
            sidebarCollapsed ? 'w-full lg:w-12' : 'w-full lg:w-[224px]',
          )

          const iconClass = cn(
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-panel)] text-[color:var(--muted)] transition-colors duration-200 group-hover:border-transparent group-hover:bg-[color:var(--accent-blue-soft)] group-hover:text-[color:var(--accent-blue)]',
          )

          if (!href) {
            return (
              <button
                key={item.label}
                className={cn(baseLinkClass, 'text-[color:var(--muted)] opacity-60 cursor-not-allowed')}
                type="button"
                aria-disabled="true"
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={iconClass}>
                  {Icon ? (
                    <Icon className="h-4 w-4" strokeWidth={2.1} />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-current/40"></span>
                  )}
                </span>
                <span
                  className={cn(
                    'transition-opacity duration-200',
                    sidebarCollapsed ? 'lg:opacity-0' : 'opacity-100 lg:delay-100',
                  )}
                >
                  {item.label}
                </span>
              </button>
            )
          }

          return (
            <NavLink
              key={item.label}
              to={href}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive: navIsActive }) =>
                cn(
                  baseLinkClass,
                  sidebarCollapsed &&
                    'lg:hover:bg-[color:var(--accent-blue-soft)]',
                  (isActive || navIsActive) &&
                    'bg-[color:var(--bg-strong)] text-[color:var(--accent-blue)] shadow-sm',
                  sidebarCollapsed &&
                    (isActive || navIsActive) &&
                    'lg:bg-[color:var(--accent-blue-soft)] lg:shadow-md',
                )
              }
              aria-current={isActive ? 'page' : undefined}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {({ isActive: navIsActive }) => (
                <>
                  <span
                    className={cn(
                      iconClass,
                      sidebarCollapsed &&
                        (isActive || navIsActive) &&
                        'lg:border-transparent lg:bg-transparent lg:text-[color:var(--accent-blue)] lg:group-hover:bg-transparent',
                      !sidebarCollapsed &&
                        (isActive || navIsActive) &&
                        'border-transparent bg-[color:var(--accent-blue-soft)] text-[color:var(--accent-blue)]',
                    )}
                  >
                    {Icon ? (
                      <Icon className="h-4 w-4" strokeWidth={2.1} />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-current/40"></span>
                    )}
                  </span>
                  <span
                    className={cn(
                      'transition-opacity duration-200',
                      sidebarCollapsed ? 'lg:opacity-0' : 'opacity-100 lg:delay-100',
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div
        className={cn(
          surfaceCard,
          'mt-auto overflow-hidden transition-all duration-300 ease-out flex-shrink-0',
          sidebarCollapsed ? 'lg:w-0 lg:h-0 lg:p-0 lg:opacity-0 lg:border-transparent lg:m-0' : 'w-full p-4 opacity-100 lg:w-[224px]',
        )}
      >
        <p className="text-sm leading-6 text-[color:var(--muted)] whitespace-normal min-w-[192px]">
          AI monitoring should stay paired with consent, policy disclosure, and
          supervisor review.
        </p>
      </div>
    </aside>
  )
}
