import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Plus, VideoOff } from 'lucide-react'
import { LiveFeedPanel } from '../components/dashboard/LiveFeedPanel'
import { CameraFeed } from '../components/dashboard/CameraFeed'
import { AddCameraModal } from '../components/dashboard/AddCameraModal'
import { useDashboard } from '../context/useDashboard'

export function LiveMonitoringPage() {
  const { t } = useTranslation('dashboard')
  const { dashboardData } = useDashboard()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  const cameras = dashboardData?.cameras || []

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between reveal-on-scroll">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[color:var(--text)]">
            {t('liveMonitoring.title')}
          </h1>
          <p className="mt-2 text-lg text-[color:var(--muted)]">
            {t('liveMonitoring.description')}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[color:var(--accent-blue)] px-5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
          Add Camera
        </button>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] reveal-on-scroll" style={{ '--reveal-delay': '120ms' }}>
        <div className="flex flex-col gap-6">
          {cameras.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-[24px] border border-dashed border-[color:var(--line)] bg-[color:var(--bg-panel)] p-6 text-center">
              <VideoOff className="mb-4 h-12 w-12 text-[color:var(--muted)] opacity-50" />
              <h3 className="font-display text-lg font-bold text-[color:var(--text)]">No Cameras Connected</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)] max-w-sm">
                Click "Add Camera" to connect a local webcam or IP camera stream for real-time analysis.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--accent-blue)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" strokeWidth={3} />
                Add First Camera
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
              {cameras.map((camera) => (
                <CameraFeed key={camera.id} camera={camera} />
              ))}
            </div>
          )}
          
          <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] p-6">
            <h3 className="font-display text-lg font-bold text-[color:var(--text)] mb-2">{t('liveMonitoring.networkStreamStatus')}</h3>
            <div className="flex items-center gap-3 text-sm text-[color:var(--muted)]">
              <span className={`flex h-2.5 w-2.5 rounded-full ${cameras.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></span>
              {cameras.length > 0 ? t('liveMonitoring.nodesTransmitting', { count: cameras.length }) : t('liveMonitoring.systemOffline')}
            </div>
          </div>
        </div>
        
        <div>
          {/* LiveFeedPanel self-sources filteredFeed and alerts from context */}
          <LiveFeedPanel />
        </div>
      </div>

      <AddCameraModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </>
  )
}
