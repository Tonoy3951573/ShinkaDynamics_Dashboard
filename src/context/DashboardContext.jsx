import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { api } from '../lib/api'
import { useSocket } from '../hooks/useSocket'

const THEME_STORAGE_KEY = 'engageiq-theme'
const SIDEBAR_COLLAPSED_STORAGE_KEY = 'engageiq-sidebar-collapsed'
const EMPLOYEES_STORAGE_KEY = 'engageiq-employees'

const emptyDashboardData = {
  scoreDistribution: [
    { label: 'Joyful facial expression', value: 0, tone: 'neutral' },
    { label: 'Polite verbal tone', value: 0, tone: 'neutral' },
    { label: 'Greeting on entry and exit', value: 0, tone: 'neutral' },
  ],
  overviewStats: [
    { label: 'Average response time', value: '0s', detail: 'Awaiting data', tone: 'neutral' },
    { label: 'Escalation rate', value: '0%', detail: 'Awaiting data', tone: 'neutral' },
    { label: 'Peak hour quality', value: '0', detail: 'Awaiting data', tone: 'neutral' },
    { label: 'Training completion', value: '0%', detail: 'Awaiting data', tone: 'neutral' },
  ],
  overviewHighlights: [
    { title: 'Best-performing zone', value: 'None', detail: 'Awaiting data' },
    { title: 'Most common risk', value: 'None', detail: 'Awaiting data' },
    { title: 'Supervisor action queue', value: '0 cases', detail: 'Awaiting data' },
  ],
  criteria: [
    {
      title: 'Facial expression',
      score: 0,
      weight: '35%',
      description: 'Measures smiling frequency and positive customer-facing presence.',
      metrics: ['Smile consistency 0%', 'Negative expression events 0', 'Warmth score 0/100'],
    },
    {
      title: 'Verbal expression',
      score: 0,
      weight: '40%',
      description: 'Evaluates politeness, calm tone, and respectfulness.',
      metrics: ['Politeness phrases 0%', 'Raised tone incidents 0', 'Empathy confidence 0/100'],
    },
    {
      title: 'Greeting behavior',
      score: 0,
      weight: '25%',
      description: 'Tracks entry greetings and courteous closures.',
      metrics: ['Entry greeting 0%', 'Exit greeting 0%', 'Missed opportunities 0'],
    },
  ],
  scoreTrend: [0, 0, 0, 0, 0, 0, 0],
  weekdayHighlights: [
    { day: 'Mon', score: 0 },
    { day: 'Tue', score: 0 },
    { day: 'Wed', score: 0 },
    { day: 'Thu', score: 0 },
    { day: 'Fri', score: 0 },
    { day: 'Sat', score: 0 },
    { day: 'Sun', score: 0 },
  ],
  compliance: [
    'Awaiting policy configuration',
  ],
  recommendations: [
    { title: 'Awaiting data', detail: 'Recommendations will appear once employee interaction data is available.' }
  ],
  stats: [
    { label: 'Employees scored today', value: '0', detail: 'Awaiting data' },
    { label: 'Average interaction score', value: '0', detail: 'Awaiting data' },
    { label: 'Greeting compliance', value: '0%', detail: 'Awaiting data' },
    { label: 'Risky interactions', value: '0', detail: 'Awaiting data' },
  ],
  site: { label: 'Getting Started', name: 'Your Organization', updatedAt: 'Live', coverage: 'No cameras connected' },
  summary: { score: 0, trend: '0%', insight: 'System awaiting initial data.' },
  liveFeed: [],
  navigation: [
    { label: 'Overview', active: true },
    { label: 'Live Monitoring' },
    { label: 'Employee Scoring' },
    { label: 'Alerts' },
    { label: 'Policy & Audit' },
  ]
};

const DashboardContext = createContext(null)

function getSystemTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  // Trust the anti-FOUC script in index.html if it already evaluated the theme
  if (document.documentElement.dataset.theme) {
    return document.documentElement.dataset.theme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getActiveViewFromPathname(pathname) {
  if (pathname === '/monitoring') {
    return 'monitoring'
  }

  if (pathname.startsWith('/employees/')) {
    return 'employee-profile'
  }

  if (pathname.startsWith('/employees')) {
    return 'employees'
  }

  if (pathname === '/alerts') {
    return 'alerts'
  }

  if (pathname === '/policy') {
    return 'policy'
  }

  if (pathname === '/admin') {
    return 'admin'
  }

  return 'overview'
}

export function DashboardProvider({ children }) {
  const location = useLocation()
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [dashboardData, setDashboardData] = useState(emptyDashboardData)
  const [isLoading, setIsLoading] = useState(true)
  const [alerts, setAlerts] = useState([])
  const [alertsLoading, setAlertsLoading] = useState(false)

  // ── Real-time event handler for WebSocket events ──────────────────────
  const handleSocketEvent = useCallback((event, payload) => {
    switch (event) {
      case 'dev:clear_all':
        setAlerts([])
        setDashboardData((prev) => ({ ...prev, liveFeed: [] }))
        break
        
      case 'alert:new':
        setAlerts((current) => [payload, ...current])
        break

      case 'camera:detections_update':
        setDashboardData((prev) => ({
          ...prev,
          cameraDetections: {
            ...prev.cameraDetections,
            [payload.cameraId]: payload.detections
          }
        }))
        break

      case 'camera:online':
      case 'camera:offline':
        setDashboardData((prev) => {
          const updatedCameras = (prev.cameras || []).map((cam) =>
            cam.id === payload.cameraId ? { ...cam, status: payload.status } : cam
          );
          return { ...prev, cameras: updatedCameras };
        });
        break

      case 'camera:stream_error':
        setAlerts((current) => [
          {
            id: `err-${Date.now()}`,
            severity: 'Medium',
            title: `Camera connection error: ${payload.name || payload.cameraId}`,
            detail: payload.error || 'Connection to stream was lost.',
            status: 'active',
            created_at: new Date().toISOString()
          },
          ...current
        ]);
        break

      case 'feed:update':
        setDashboardData((prev) => ({
          ...prev,
          liveFeed: [payload, ...(prev.liveFeed || []).slice(0, 49)],
        }))
        break

      case 'employee:score_update': {
        const { employeeId, score, delta, metrics } = payload
        setEmployees((current) =>
          current.map((emp) =>
            emp.profile?.employeeId === employeeId
              ? {
                  ...emp,
                  score: score ?? emp.score,
                  delta: delta ?? emp.delta,
                  metrics: { ...emp.metrics, ...metrics },
                }
              : emp,
          ),
        )
        break
      }

      case 'insight:refresh':
        setDashboardData((prev) => {
          // Merge incoming fields — preserve existing data for anything not in the payload
          const safeAnalytics = {
            site: payload.site ?? prev.site,
            summary: payload.summary ?? prev.summary,
            stats: payload.stats ?? prev.stats,
            alerts: payload.alerts ?? prev.alerts,
            cameras: payload.cameras ?? prev.cameras,
            scoreDistribution: payload.scoreDistribution ?? prev.scoreDistribution,
            overviewStats: payload.overviewStats ?? prev.overviewStats,
            overviewHighlights: payload.overviewHighlights ?? prev.overviewHighlights,
            criteria: payload.criteria ?? prev.criteria,
            scoreTrend: payload.scoreTrend ?? prev.scoreTrend,
            weekdayHighlights: payload.weekdayHighlights ?? prev.weekdayHighlights,
            compliance: payload.compliance ?? prev.compliance,
            recommendations: payload.recommendations ?? prev.recommendations,
          }
          return { ...prev, ...safeAnalytics }
        })
        break

      case 'state:refresh':
        fetchAlerts()
        refreshAnalytics()
        break

      case 'admin:force_restart':
        // Handled directly inside individual CameraFeed sub-components
        break

      default:
        console.warn('[socket] unhandled event:', event, payload)
    }
  }, [])

  // ── Dev-only helper ──────────────────────────────────────────────────
  // Calls handleSocketEvent directly so the DevMockControls panel can
  // inject synthetic payloads without a live WebSocket connection.
  const [mockSocketStatus, setMockSocketStatus] = useState(null)
  const realSocket = useSocket(user ? localStorage.getItem('shinka-token') : null, handleSocketEvent)
  const socketStatus = mockSocketStatus || realSocket.socketStatus
  const socket = realSocket.socket

  // Extend simulateEvent to handle disconnect toggle
  const simulateEvent = useCallback(
    (event, payload) => {
      if (import.meta.env.DEV) {
        console.info('[dev:simulateEvent]', event, payload)
        if (event === 'dev:disconnect') {
          setMockSocketStatus(prev => prev === 'disconnected' ? null : 'disconnected')
          return
        }
        handleSocketEvent(event, payload)
      }
    },
    [handleSocketEvent],
  )

  useEffect(() => {
    if (!user) return;
    
    setIsLoading(true);
    Promise.all([
      api('/employees?limit=200'),
      api('/analytics')
    ])
      .then(([employeesResult, analyticsData]) => {
        // Unwrap paginated envelope: { data: [...], pagination: {...} }
        setEmployees(employeesResult.data || employeesResult)
        setDashboardData(prev => ({ ...prev, ...analyticsData }))
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch data from server:', err)
        setEmployees([])
        setIsLoading(false)
      })
  }, [user])

  // Refetch analytics from the server so all dashboard panels update
  const refreshAnalytics = async () => {
    try {
      const analyticsData = await api('/analytics')
      setDashboardData(prev => ({ ...prev, ...analyticsData }))
    } catch (err) {
      console.error('Failed to refresh analytics:', err)
    }
  }
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === 'undefined') {
      return 'system'
    }

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    return savedTheme === 'light' ||
      savedTheme === 'dark' ||
      savedTheme === 'system'
      ? savedTheme
      : 'system'
  })

  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme())

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const resolvedTheme = useMemo(
    () => (themeMode === 'system' ? systemTheme : themeMode),
    [themeMode, systemTheme],
  )
  
  const [searchQuery, setSearchQuery] = useState('')
  const [feedFilter, setFeedFilter] = useState('all')
  const [employeeSort, setEmployeeSort] = useState('score')
  const [minimumScore, setMinimumScore] = useState(0)
  const [selectedDay, setSelectedDay] = useState(
    emptyDashboardData.weekdayHighlights.at(-1)?.day ?? 'Sun',
  )
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true'
  })
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const activeView = getActiveViewFromPathname(location.pathname)
  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredFeed = useMemo(
    () =>
      (dashboardData.liveFeed || []).filter((item) => {
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
    [dashboardData.liveFeed, feedFilter, minimumScore, normalizedQuery],
  )

  // Search spans both summary text and nested metadata so the directory behaves
  // like a global roster search instead of forcing users into one narrow field.
  const sortedEmployees = useMemo(
    () =>
      [...employees]
        .filter((employee) => {
          const metricsContent = Object.values(employee.metrics ?? {})
            .join(' ')
            .toLowerCase()
          const infoContent = Object.values(employee.info ?? {})
            .join(' ')
            .toLowerCase()
          const matchesQuery =
            normalizedQuery.length === 0 ||
            (employee.name || '').toLowerCase().includes(normalizedQuery) ||
            (employee.role || '').toLowerCase().includes(normalizedQuery) ||
            (employee.strengths || '').toLowerCase().includes(normalizedQuery) ||
            metricsContent.includes(normalizedQuery) ||
            infoContent.includes(normalizedQuery)

          return matchesQuery && employee.score >= minimumScore
        })
        .sort((left, right) => {
          if (employeeSort === 'risk') {
            return left.score - right.score
          }

          if (employeeSort === 'momentum') {
            return (
              Number.parseInt(right.delta, 10) - Number.parseInt(left.delta, 10)
            )
          }

          return right.score - left.score
        }),
    [employees, employeeSort, minimumScore, normalizedQuery],
  )

  useEffect(() => {
    // Theme transitions are toggled on the root so every themed surface animates
    // together when the user switches modes.
    const root = document.documentElement

    root.classList.add('theme-changing')
    root.dataset.theme = resolvedTheme
    root.style.colorScheme = resolvedTheme
    
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
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

    window.localStorage.setItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY,
      String(sidebarCollapsed),
    )
  }, [sidebarCollapsed])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    // Reveal animations are opt-in and one-shot per route visit, with graceful
    // fallbacks for older browsers and reduced-motion users.
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
  }, [location.pathname, isLoading])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    setMobileSidebarOpen(false)
  }, [location.pathname])

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((current) => !current)
  }

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen((current) => !current)
  }

  const addEmployee = async (newEmployee) => {
    try {
      const addedEmployee = await api('/employees', {
        method: 'POST',
        body: JSON.stringify(newEmployee)
      })
      setEmployees((current) => [...current, addedEmployee])
      await refreshAnalytics()
    } catch (err) {
      console.error('Failed to add employee to server:', err)
      setEmployees((current) => [...current, newEmployee])
    }
  }

  const removeEmployee = async (employeeId) => {
    try {
      await api(`/employees/${employeeId}`, { method: 'DELETE' })
      setEmployees((current) =>
        current.filter((e) => e.profile?.employeeId !== employeeId)
      )
      await refreshAnalytics()
      return true
    } catch (err) {
      console.error('Failed to remove employee:', err)
      alert(err.message || 'Failed to remove employee')
      return false
    }
  }

  const addCamera = async (newCamera) => {
    try {
      const addedCamera = await api('/cameras', {
        method: 'POST',
        body: JSON.stringify(newCamera)
      })
      setDashboardData(prev => ({
        ...prev,
        cameras: [...(prev.cameras || []), addedCamera]
      }))
    } catch (err) {
      console.error('Failed to add camera:', err)
      // Alert the user about limits if it's a 403 error, handled gracefully or logged
      alert(err.message || 'Failed to add camera');
    }
  }

  const removeCamera = async (cameraId) => {
    try {
      await api(`/cameras/${cameraId}`, {
        method: 'DELETE'
      })
      setDashboardData(prev => ({
        ...prev,
        cameras: (prev.cameras || []).filter(c => c.id !== cameraId)
      }))
    } catch (err) {
      console.error('Failed to remove camera:', err)
      alert(err.message || 'Failed to remove camera');
    }
  }

  const fetchAlerts = async () => {
    setAlertsLoading(true)
    try {
      const result = await api('/alerts?limit=200')
      // Unwrap paginated envelope: { data: [...], pagination: {...} }
      setAlerts(result.data || result)
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
    } finally {
      setAlertsLoading(false)
    }
  }

  const acknowledgeAlert = async (alertId) => {
    try {
      await api(`/alerts/${alertId}/acknowledge`, { method: 'PATCH' })
      setAlerts((current) =>
        current.map((a) =>
          a.id === alertId ? { ...a, status: 'acknowledged' } : a
        )
      )
    } catch (err) {
      console.error('Failed to acknowledge alert:', err)
    }
  }

  const resolveAlert = async (alertId) => {
    try {
      await api(`/alerts/${alertId}/resolve`, { method: 'PATCH' })
      setAlerts((current) =>
        current.map((a) =>
          a.id === alertId
            ? { ...a, status: 'resolved', resolved_at: new Date().toISOString() }
            : a
        )
      )
    } catch (err) {
      console.error('Failed to resolve alert:', err)
    }
  }

  const dismissAlert = async (alertId) => {
    try {
      await api(`/alerts/${alertId}/dismiss`, { method: 'PATCH' })
      setAlerts((current) =>
        current.map((a) =>
          a.id === alertId ? { ...a, status: 'dismissed' } : a
        )
      )
    } catch (err) {
      console.error('Failed to dismiss alert:', err)
    }
  }

  const value = useMemo(
    () => ({
      activeView,
      addCamera,
      removeCamera,
      addEmployee,
      refreshAnalytics,
      removeEmployee,
      alerts,
      alertsLoading,
      fetchAlerts,
      acknowledgeAlert,
      resolveAlert,
      dismissAlert,
      dashboardData,
      employees,
      feedFilter,
      filteredFeed,
      isLoading,
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
      simulateEvent,
      socketStatus,
      socket,
      sortedEmployees,
      themeMode,
      toggleMobileSidebar,
      toggleSidebarCollapsed,
    }),
    [
      activeView,
      alerts,
      alertsLoading,
      dashboardData,
      employees,
      employeeSort,
      feedFilter,
      filteredFeed,
      isLoading,
      minimumScore,
      mobileSidebarOpen,
      resolvedTheme,
      searchQuery,
      selectedDay,
      sidebarCollapsed,
      simulateEvent,
      socketStatus,
      socket,
      sortedEmployees,
      themeMode,
    ],
  )

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export { DashboardContext }
