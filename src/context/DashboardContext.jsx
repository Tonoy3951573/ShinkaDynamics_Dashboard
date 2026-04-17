import { createContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { dashboardData } from '../data/dashboardData'

const THEME_STORAGE_KEY = 'engageiq-theme'
const SIDEBAR_COLLAPSED_STORAGE_KEY = 'engageiq-sidebar-collapsed'

const DashboardContext = createContext(null)

function getSystemTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getActiveViewFromPathname(pathname) {
  if (pathname.startsWith('/employees/')) {
    return 'employee-profile'
  }

  if (pathname.startsWith('/employees')) {
    return 'employees'
  }

  return 'overview'
}

export function DashboardProvider({ children }) {
  const location = useLocation()
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === 'undefined') {
      return 'system'
    }

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    return savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system'
      ? savedTheme
      : 'system'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [feedFilter, setFeedFilter] = useState('all')
  const [employeeSort, setEmployeeSort] = useState('score')
  const [minimumScore, setMinimumScore] = useState(0)
  const [selectedDay, setSelectedDay] = useState(
    dashboardData.weekdayHighlights.at(-1)?.day ?? 'Sun',
  )
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true'
  })
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const resolvedTheme = useMemo(
    () => (themeMode === 'system' ? getSystemTheme() : themeMode),
    [themeMode],
  )
  const activeView = getActiveViewFromPathname(location.pathname)
  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredFeed = useMemo(
    () =>
      dashboardData.liveFeed.filter((item) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          item.employee.toLowerCase().includes(normalizedQuery) ||
          item.station.toLowerCase().includes(normalizedQuery) ||
          item.status.toLowerCase().includes(normalizedQuery)

        const matchesFilter =
          feedFilter === 'all' ||
          (feedFilter === 'positive' && item.score >= 90) ||
          (feedFilter === 'watchlist' && item.score < 90)

        return matchesQuery && matchesFilter && item.score >= minimumScore
      }),
    [feedFilter, minimumScore, normalizedQuery],
  )

  const sortedEmployees = useMemo(
    () =>
      [...dashboardData.employees]
        .filter((employee) => {
          const metricsContent = Object.values(employee.metrics ?? {}).join(' ').toLowerCase()
          const infoContent = Object.values(employee.info ?? {}).join(' ').toLowerCase()
          const matchesQuery =
            normalizedQuery.length === 0 ||
            employee.name.toLowerCase().includes(normalizedQuery) ||
            employee.role.toLowerCase().includes(normalizedQuery) ||
            employee.strengths.toLowerCase().includes(normalizedQuery) ||
            metricsContent.includes(normalizedQuery) ||
            infoContent.includes(normalizedQuery)

          return matchesQuery && employee.score >= minimumScore
        })
        .sort((left, right) => {
          if (employeeSort === 'risk') {
            return left.score - right.score
          }

          if (employeeSort === 'momentum') {
            return Number.parseInt(right.delta, 10) - Number.parseInt(left.delta, 10)
          }

          return right.score - left.score
        }),
    [employeeSort, minimumScore, normalizedQuery],
  )

  useEffect(() => {
    const root = document.documentElement

    root.classList.add('theme-changing')
    root.dataset.theme = resolvedTheme
    root.style.colorScheme = resolvedTheme
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)

    const timeoutId = window.setTimeout(() => {
      root.classList.remove('theme-changing')
    }, 420)

    return () => window.clearTimeout(timeoutId)
  }, [resolvedTheme, themeMode])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (themeMode === 'system') {
        const nextTheme = getSystemTheme()
        document.documentElement.dataset.theme = nextTheme
        document.documentElement.style.colorScheme = nextTheme
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [themeMode])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.reveal-on-scroll').forEach((element) => {
        element.classList.add('is-visible')
      })
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (mediaQuery.matches) {
      document.querySelectorAll('.reveal-on-scroll').forEach((element) => {
        element.classList.add('is-visible')
      })
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px',
      },
    )

    document.querySelectorAll('.reveal-on-scroll').forEach((element) => {
      observer.observe(element)
    })

    return () => observer.disconnect()
  }, [location.pathname])

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((current) => !current)
  }

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen((current) => !current)
  }

  const value = useMemo(
    () => ({
      activeView,
      dashboardData,
      feedFilter,
      filteredFeed,
      minimumScore,
      mobileSidebarOpen,
      employeeSort,
      resolvedTheme,
      searchQuery,
      selectedDay,
      setEmployeeSort,
      setFeedFilter,
      setMinimumScore,
      setMobileSidebarOpen,
      setSearchQuery,
      setSelectedDay,
      setSidebarCollapsed,
      setThemeMode,
      sidebarCollapsed,
      sortedEmployees,
      themeMode,
      toggleMobileSidebar,
      toggleSidebarCollapsed,
    }),
    [
      activeView,
      employeeSort,
      feedFilter,
      filteredFeed,
      minimumScore,
      mobileSidebarOpen,
      resolvedTheme,
      searchQuery,
      selectedDay,
      sidebarCollapsed,
      sortedEmployees,
      themeMode,
    ],
  )

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export { DashboardContext }
