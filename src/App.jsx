import { Navigate, Route, Routes } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardProvider } from './context/DashboardContext'
import { useDashboard } from './context/useDashboard'
import { EmployeeProfileRoutePage } from './pages/EmployeeProfileRoutePage'
import { EmployeesPage } from './pages/EmployeesPage'
import { LiveMonitoringPage } from './pages/LiveMonitoringPage'
import { OverviewPage } from './pages/OverviewPage'
import { AlertsPage } from './pages/AlertsPage'
import { PolicyAuditPage } from './pages/PolicyAuditPage'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import ReportIssueModal from './components/dashboard/ReportIssueModal'
import { AuthProvider, useAuth } from './context/AuthContext'
import SuperAdminLayout from './layouts/SuperAdminLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { ErrorBoundary } from './components/layout/ErrorBoundary'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { ToastNotification } from './components/layout/ToastNotification'
import { lazy, Suspense, useState } from 'react'
import { WifiOff, Loader2 } from 'lucide-react'

// Loaded & rendered only in development.
// import.meta.env.DEV === false in production builds → Vite tree-shakes the
// entire DevMockControls module (including its CSS) out of the bundle.
const DevMockControls = import.meta.env.DEV
  ? lazy(() =>
      import('./components/dev/DevMockControls').then((m) => ({
        default: m.DevMockControls,
      })),
    )
  : null

function AppShell() {
  const { user } = useAuth()
  if (user && user.role === 'super_user') {
    return <SuperAdminLayout />
  }

  const {
    activeView,
    alerts,
    dashboardData,
    employees,
    isLoading,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    sidebarCollapsed,
    socketStatus,
  } = useDashboard()
  const sidebarWidth = sidebarCollapsed ? 104 : 280

  // True whenever at least one active critical alert is in state.
  // Drives the viewport-edge pulse via CSS class.
  const hasCritical = alerts.some(
    (a) => (a.severity ?? '').toLowerCase() === 'critical' && a.status === 'active',
  )

  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  return (
    <div
      className={`app-shell${hasCritical ? ' app-shell--critical' : ''}${
        mobileSidebarOpen ? ' overflow-hidden lg:overflow-visible' : ''
      }`}
    >
      <div
        className={
          mobileSidebarOpen
            ? 'fixed inset-0 z-30 bg-[color:var(--text)]/30 backdrop-blur-sm transition lg:hidden'
            : 'pointer-events-none fixed inset-0 z-30 bg-[color:var(--text)]/0 opacity-0 transition lg:hidden'
        }
        onClick={() => setMobileSidebarOpen(false)}
      ></div>
      <div
        className="min-h-screen lg:flex lg:items-start"
      >
        <Sidebar 
          navItems={dashboardData.navigation} 
          activeView={activeView} 
          onReportClick={() => setIsReportModalOpen(true)} 
        />
        <div className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-7 lg:py-7 xl:px-8 xl:pb-10">
          <Header />
          <main className="space-y-6">
            {isLoading ? (
              <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[color:var(--line)] border-t-[color:var(--accent-blue)]"></div>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/monitoring" element={<LiveMonitoringPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/policy" element={<PolicyAuditPage />} />
                <Route path="/admin" element={<SuperAdminDashboard />} />
                <Route
                  path="/employees/:employeeId"
                  element={
                    <EmployeeProfileRoutePage
                      employees={employees}
                    />
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </main>
        </div>
      </div>
      {/* Global toast stack – always mounted, self-manages visibility */}
      <ToastNotification />
      
      {/* Report Issue Modal */}
      <ReportIssueModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
      {/* Dev-only floating mock controls – absent in production */}
      {DevMockControls && (
        <Suspense fallback={null}>
          <DevMockControls />
        </Suspense>
      )}
      
      {/* ── Disconnect Overlay ────────────────────────────────────────── */}
      {(socketStatus === 'disconnected' || socketStatus === 'error') && (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-[rgba(15,23,42,0.4)] backdrop-blur-[12px] [backdrop-filter:blur(12px)_grayscale(50%)] animate-[overlay-fade-in_400ms_ease-out_both]">
          <div className="flex flex-col items-center text-center bg-[color:var(--bg-elevated)] border border-[color:var(--line-strong)] rounded-3xl py-12 px-10 [box-shadow:0_32px_64px_rgba(0,0,0,0.3)] max-w-[90vw] w-[420px] animate-[modal-slide-up_500ms_cubic-bezier(0.22,1,0.36,1)_both] [animation-delay:100ms]">
             <div className="grid place-items-center w-16 h-16 rounded-full bg-[color-mix(in_srgb,var(--accent-red)_20%,transparent)] text-[color:var(--accent-red)] mb-6">
               <WifiOff className="w-8 h-8 animate-[icon-pulse_2s_ease-in-out_infinite]" />
             </div>
             <h2 className="text-2xl font-bold text-[color:var(--text)] mb-4 leading-tight">Connection to AI Core Lost</h2>
             <div className="inline-flex items-center gap-3 bg-[color:var(--bg-chip)] border border-[color:var(--line)] py-2 px-5 rounded-full text-[color:var(--muted)] text-sm font-semibold">
               <Loader2 className="animate-spin" />
               <span>Reconnecting...</span>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <DashboardProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <AppShell />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
        </Routes>
      </DashboardProvider>
    </AuthProvider>
  )
}

export default App
