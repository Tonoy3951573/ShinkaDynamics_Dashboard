import { useState } from 'react'
import { X, Camera, Globe, MonitorPlay } from 'lucide-react'
import { useDashboard } from '../../context/useDashboard'
import { cn } from '../../lib/ui'

export function AddCameraModal({ isOpen, onClose }) {
  const { addCamera } = useDashboard()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('webcam')
  const [url, setUrl] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!name || !location) return
    if ((type === 'ip' || type === 'mjpeg') && !url) return
    
    const newCamera = {
      id: `cam-${Date.now()}`,
      name,
      location,
      type,
      ...((type === 'ip' || type === 'mjpeg') ? { url } : {})
    }
    
    addCamera(newCamera)
    
    setName('')
    setLocation('')
    setType('webcam')
    setUrl('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-lg rounded-2xl border border-[color:var(--line)] bg-[color:var(--bg-panel)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[color:var(--line)] px-6 py-4">
          <h2 className="font-display text-lg font-bold text-[color:var(--text)]">
            Add New Camera
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[color:var(--muted)] hover:bg-[color:var(--bg-strong)] hover:text-[color:var(--text)] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[color:var(--text)]">
                Camera Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Register 03"
                className="w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-strong)] px-4 py-3 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent-blue)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent-blue)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[color:var(--text)]">
                Zone / Location
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Front Entrance"
                className="w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-strong)] px-4 py-3 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent-blue)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent-blue)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[color:var(--text)]">
                Connection Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setType('webcam')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition",
                    type === 'webcam' 
                      ? "border-[color:var(--accent-blue)] bg-[color:var(--accent-blue-soft)] text-[color:var(--accent-blue)]" 
                      : "border-[color:var(--line)] bg-[color:var(--bg-strong)] text-[color:var(--muted)] hover:border-[color:var(--text)]"
                  )}
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-xs font-bold text-center">Local Webcam</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('ip')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition",
                    type === 'ip' 
                      ? "border-[color:var(--accent-blue)] bg-[color:var(--accent-blue-soft)] text-[color:var(--accent-blue)]" 
                      : "border-[color:var(--line)] bg-[color:var(--bg-strong)] text-[color:var(--muted)] hover:border-[color:var(--text)]"
                  )}
                >
                  <Globe className="h-6 w-6" />
                  <span className="text-xs font-bold text-center">IP Stream</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('mjpeg')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 transition",
                    type === 'mjpeg' 
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" 
                      : "border-[color:var(--line)] bg-[color:var(--bg-strong)] text-[color:var(--muted)] hover:border-[color:var(--text)]"
                  )}
                  title="Temporary feature for testing ESP32 modules"
                >
                  <MonitorPlay className="h-6 w-6" />
                  <span className="text-xs font-bold text-center">ESP32 (Test)</span>
                </button>
              </div>
            </div>

            {(type === 'ip' || type === 'mjpeg') && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-[color:var(--text)]">
                  Stream URL
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={type === 'mjpeg' ? "e.g. http://10.58.58.248:81/stream" : "e.g. http://192.168.1.50/stream.mp4"}
                  className="w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-strong)] px-4 py-3 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent-blue)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent-blue)]"
                />
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-[color:var(--text)] transition hover:bg-[color:var(--bg-strong)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-[color:var(--accent-blue)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600"
            >
              <MonitorPlay className="h-4 w-4" />
              Connect Camera
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
