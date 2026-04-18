import { Navigate, Route, Routes } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardProvider } from './context/DashboardContext'
import { useDashboard } from './context/useDashboard'
import { EmployeeProfileRoutePage } from './pages/EmployeeProfileRoutePage'
import { EmployeesPage } from './pages/EmployeesPage'
import { OverviewPage } from './pages/OverviewPage'

function AppShell() {
  const {
    activeView,
    dashboardData,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    sidebarCollapsed,
  } = useDashboard()
  const sidebarWidth = sidebarCollapsed ? 104 : 280

  return (
    <div
      className={mobileSidebarOpen ? 'overflow-hidden lg:overflow-visible' : ''}
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
        <Sidebar navItems={dashboardData.navigation} activeView={activeView} />
        <div className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-7 lg:py-7 xl:px-8 xl:pb-10">
          <Header />
          <main className="space-y-6">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route
                path="/employees/:employeeId"
                element={
                  <EmployeeProfileRoutePage
                    employees={dashboardData.employees}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <DashboardProvider>
      <AppShell />
    </DashboardProvider>
  )
}

export default App
