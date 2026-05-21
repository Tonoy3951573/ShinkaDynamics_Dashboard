import { useState } from 'react'
import { Users, AlertCircle, Cpu, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import UserList from '../pages/SuperAdmin/views/UserList'
import ProblemList from '../pages/SuperAdmin/views/ProblemList'
import SystemMonitor from '../pages/SuperAdmin/views/SystemMonitor'

export default function SuperAdminLayout() {
  const { logout, user } = useAuth()
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div className="flex min-h-screen w-screen bg-[color:var(--bg)] text-[color:var(--text)] font-sans overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-72 bg-[color:var(--sidebar-bg)] border-r border-[color:var(--line)] backdrop-blur-2xl flex flex-col p-8 z-10">
        <div className="flex items-center gap-3.5 mb-12">
          <Shield className="text-[color:var(--accent-blue)] w-8 h-8" />
          <div>
            <h2 className="text-lg font-extrabold text-[color:var(--text)] m-0 leading-tight">Shinka Core</h2>
            <span className="text-[10px] font-bold tracking-widest text-[color:var(--muted)] uppercase">SYSTEM ADMIN</span>
          </div>
        </div>

        <nav className="flex flex-col gap-3 flex-1">
          <button 
            className={`flex items-center gap-3.5 px-5 py-3.5 text-sm font-semibold text-left rounded-2xl border border-transparent transition-all duration-200 cursor-pointer ${
              activeTab === 'users' 
                ? 'bg-[color:var(--accent-blue-soft)] text-[color:var(--accent-blue)] border-[color:var(--line-strong)]' 
                : 'text-[color:var(--muted)] hover:bg-[color:var(--accent-blue-soft)] hover:text-[color:var(--accent-blue)]'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <Users className="w-5 h-5" />
            <span>User List</span>
          </button>

          <button 
            className={`flex items-center gap-3.5 px-5 py-3.5 text-sm font-semibold text-left rounded-2xl border border-transparent transition-all duration-200 cursor-pointer ${
              activeTab === 'problems' 
                ? 'bg-[color:var(--accent-blue-soft)] text-[color:var(--accent-blue)] border-[color:var(--line-strong)]' 
                : 'text-[color:var(--muted)] hover:bg-[color:var(--accent-blue-soft)] hover:text-[color:var(--accent-blue)]'
            }`}
            onClick={() => setActiveTab('problems')}
          >
            <AlertCircle className="w-5 h-5" />
            <span>Reported Problems</span>
          </button>

          <button 
            className={`flex items-center gap-3.5 px-5 py-3.5 text-sm font-semibold text-left rounded-2xl border border-transparent transition-all duration-200 cursor-pointer ${
              activeTab === 'system' 
                ? 'bg-[color:var(--accent-blue-soft)] text-[color:var(--accent-blue)] border-[color:var(--line-strong)]' 
                : 'text-[color:var(--muted)] hover:bg-[color:var(--accent-blue-soft)] hover:text-[color:var(--accent-blue)]'
            }`}
            onClick={() => setActiveTab('system')}
          >
            <Cpu className="w-5 h-5" />
            <span>System Monitor</span>
          </button>
        </nav>

        <div className="border-t border-[color:var(--line)] pt-6 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-xs font-bold text-[color:var(--text)] m-0">{user?.name || 'Super Admin'}</p>
            <p className="text-[10px] font-bold text-[color:var(--accent-red)] tracking-wider mt-0.5">GLOBAL ROOT</p>
          </div>
          <button 
            className="bg-[color:var(--bg-chip)] border border-[color:var(--line)] text-[color:var(--text)] hover:bg-[color:var(--accent-red-soft)] hover:text-[color:var(--accent-red)] hover:border-[color:var(--accent-red)] rounded-xl w-9.5 h-9.5 flex items-center justify-center cursor-pointer transition-colors duration-200" 
            onClick={logout} 
            title="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto h-screen bg-radial-[at_top_left] from-[color:var(--accent-blue-soft)] to-transparent">
        <div className="max-w-6xl mx-auto flex flex-col gap-8 animate-[fade-in_0.25s_ease-out]">
          {activeTab === 'users' && <UserList />}
          {activeTab === 'problems' && <ProblemList />}
          {activeTab === 'system' && <SystemMonitor />}
        </div>
      </main>
    </div>
  )
}
