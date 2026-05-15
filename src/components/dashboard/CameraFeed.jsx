import { useEffect, useRef, useState } from 'react'
import { CameraOff, Video, Trash2 } from 'lucide-react'
import { panelCard, panelHeading, panelTitle, eyebrow, panelChip } from '../../lib/ui'
import { useDashboard } from '../../context/useDashboard'

export function CameraFeed({ camera }) {
  const { name = "Camera 1", location = "Front Entrance", type = "webcam", url, id } = camera || {}
  const { dashboardData, removeCamera } = useDashboard()
  
  const detections = dashboardData?.cameraDetections?.[id] || []
  
  const videoRef = useRef(null)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState(null)
  
  const isWebcam = type === 'webcam'

  const startStream = async () => {
    setError(null)
    if (isWebcam) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setHasPermission(true)
      } catch (err) {
        console.error("Error accessing webcam:", err)
        if (err.name === 'NotReadableError') {
          setError("Camera is currently in use by another application.")
        } else if (err.name === 'NotFoundError') {
          setError("No camera hardware detected on this device.")
        } else if (err.name === 'NotAllowedError') {
          setError("Permission denied by browser or operating system settings.")
        } else {
          setError(err.message || "Camera access denied or unavailable.")
        }
        setHasPermission(false)
      }
    } else {
      // IP Camera stream or MJPEG
      if (videoRef.current && type !== 'mjpeg') {
        videoRef.current.src = url
      }
      setHasPermission(true)
    }
  }

  const stopStream = () => {
    if (videoRef.current) {
      if (isWebcam && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
      } else {
        videoRef.current.src = ""
      }
    }
    setHasPermission(false)
    setError(null)
  }

  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [])

  return (
    <article className={panelCard}>
      <div className={panelHeading}>
        <div>
          <p className={eyebrow}>{location}</p>
          <h3 className={panelTitle}>
            {name}
            {hasPermission && (
              <span className="ml-3 inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-500 ring-1 ring-inset ring-red-500/20 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                LIVE
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className={panelChip}>
            {hasPermission ? <Video className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
          </span>
          {hasPermission ? (
            <button
              onClick={stopStream}
              className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/20"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={startStream}
              className="rounded-lg bg-[color:var(--accent-blue-soft)] px-3 py-1.5 text-xs font-semibold text-[color:var(--accent-blue)] transition hover:opacity-80"
            >
              Start
            </button>
          )}
          <div className="h-6 w-px bg-[color:var(--line)]"></div>
          <button
            onClick={() => {
              stopStream()
              if (id) removeCamera(id)
            }}
            className="rounded-lg p-1.5 text-[color:var(--muted)] hover:bg-red-500/10 hover:text-red-500 transition"
            title="Remove Camera"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-[color:var(--line)]">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[color:var(--muted)]">
            <CameraOff className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium text-red-400 mb-1">Connection Failed</p>
            <p className="text-xs mb-4">{error}</p>
            <button 
              onClick={startStream}
              className="px-4 py-2 bg-[color:var(--bg-strong)] hover:bg-[color:var(--accent-blue-soft)] hover:text-[color:var(--accent-blue)] transition rounded-lg text-xs font-semibold"
            >
              Retry Connection
            </button>
          </div>
        ) : type === 'mjpeg' ? (
          hasPermission && (
            <img
              src={url}
              alt="ESP32 Stream"
              className={`h-full w-full object-cover transition-opacity duration-300 ${hasPermission ? 'opacity-100' : 'opacity-0'}`}
            />
          )
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            crossOrigin="anonymous"
            className={`h-full w-full object-cover transition-opacity duration-300 ${hasPermission ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        
        {!hasPermission && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[color:var(--muted)]">
            <CameraOff className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">Stream Offline</p>
            <p className="text-xs mt-1 mb-4">Click 'Start' to connect to {type === 'mjpeg' ? 'ESP32' : isWebcam ? 'webcam' : 'IP stream'}</p>
            <button 
              onClick={startStream}
              className="px-5 py-2.5 bg-[color:var(--accent-blue)] text-white hover:bg-blue-600 transition rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20"
            >
              Connect Camera
            </button>
          </div>
        )}
        
        {/* AI Overlay bounding boxes */}
        {hasPermission && (
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
             <div className="flex justify-between items-start">
               <div className="text-xs font-mono text-[color:var(--accent-emerald)] bg-black/50 px-2 py-1 rounded backdrop-blur-[4px] border border-emerald-400/30">
                 TRACKING: ACTIVE
               </div>
               <div className="text-xs font-mono text-white/70 bg-black/50 px-2 py-1 rounded backdrop-blur-[4px]">
                 {new Date().toISOString().split('T')[1].substring(0,8)} GMT
               </div>
             </div>
             
             {/* Dynamic bounding boxes */}
             {detections.map((det) => (
               <div
                 key={det.id}
                 className="absolute border-2 border-[color:var(--accent-blue)] rounded-lg [box-shadow:0_0_15px_rgba(39,110,241,0.2)] transition-all duration-300 ease-in-out"
                 style={{
                   top: `${det.y}%`,
                   left: `${det.x}%`,
                   width: `${det.width}%`,
                   height: `${det.height}%`,
                 }}
               >
                 <div className="absolute bottom-[calc(100%+4px)] left-0 whitespace-nowrap text-[0.65rem] font-mono font-semibold text-[color:var(--accent-blue)] bg-black/65 px-1.5 py-0.5 rounded backdrop-blur-[8px] [backdrop-filter:blur(8px)_saturate(140%)] border border-[rgba(39,110,241,0.4)]">
                   {det.subjectName}: {Math.round(det.confidenceScore * 100)}% Match
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </article>
  )
}
