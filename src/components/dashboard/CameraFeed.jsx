import { useEffect, useRef, useState, useMemo } from 'react'
import { 
  Maximize2, 
  Minimize2, 
  Camera, 
  RefreshCw, 
  Activity, 
  AlertTriangle,
  Cpu,
  Download
} from 'lucide-react'
import { useHLSPlayer } from '../../hooks/useHLSPlayer'
import { useCameraStatus } from '../../hooks/useCameraStatus'
import { useSocketDetections } from '../../hooks/useSocketDetections'
import { useDashboard } from '../../context/useDashboard'

/**
 * Enterprise-grade, high-performance CameraFeed component.
 *
 * Implements:
 * 1. IntersectionObserver-based lazy loading to suspend stream consumption offscreen.
 * 2. Canvas-based dynamic snapshot capture of both local Webcams and HLS feeds.
 * 3. RequestAnimationFrame coordinated AI tracking coordinate overlays with fade-out grace.
 * 4. Responsive CSS fullscreen toggle.
 * 5. Premium futuristic glassmorphism and real-time network telemetry HUD.
 */
export function CameraFeed({ camera }) {
  const { id, name, location, type } = camera
  const { socket, dashboardData } = useDashboard()

  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(false)

  // ── 1. Lazy Loading (IntersectionObserver) ──────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const isActiveStream = isIntersecting

  // ── 2. Telemetry and Stream Lifecycle ──────────────────────────────
  const { status, latencyMs, jitterMs, fps } = useCameraStatus(
    id, 
    type, 
    isActiveStream, 
    socket
  )

  const streamUrl = useMemo(() => {
    if (type === 'webcam') return 'webcam'
    try {
      const data = typeof camera.data === 'string' ? JSON.parse(camera.data) : camera.data
      return data?.url || ''
    } catch {
      return ''
    }
  }, [camera, type])

  const { 
    isLoading, 
    error: playerError, 
    isSafariNative, 
    manuallyReconnect 
  } = useHLSPlayer(
    isActiveStream && type === 'hls' ? streamUrl : null, 
    videoRef
  )

  // ── 2b. Remote Force Restart Socket Handler ────────────────────────
  useEffect(() => {
    if (!socket || !id) return

    const handleForceRestart = (payload) => {
      // Restart if no cameraId is specified (global restart) or matches the current camera's id
      if (!payload || !payload.cameraId || payload.cameraId === id) {
        console.log(`[ws-admin] Force restart stream triggered for camera ${id}`);
        manuallyReconnect();
      }
    }

    socket.on('admin:force_restart', handleForceRestart)
    return () => {
      socket.off('admin:force_restart', handleForceRestart)
    }
  }, [socket, id, manuallyReconnect])

  // ── 3. Webcam Initialization (WebRTC) ──────────────────────────────
  const [webcamError, setWebcamError] = useState(null)
  const [webcamLoading, setWebcamLoading] = useState(false)

  useEffect(() => {
    if (type !== 'webcam' || !isActiveStream || !videoRef.current) {
      setWebcamLoading(false)
      return
    }

    setWebcamLoading(true)
    setWebcamError(null)

    let activeStream = null

    navigator.mediaDevices
      .getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      })
      .then((stream) => {
        activeStream = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
        setWebcamLoading(false)
      })
      .catch((err) => {
        console.error('[webcam] error:', err.name)
        setWebcamLoading(false)
        if (err.name === 'NotAllowedError') {
          setWebcamError('Camera access denied.')
        } else if (err.name === 'NotFoundError') {
          setWebcamError('No webcam hardware found.')
        } else {
          setWebcamError('Webcam failed to initialize.')
        }
      })

    return () => {
      setWebcamLoading(false)
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [type, isActiveStream])

  // ── 4. Coordinate Interpolated AI Overlays ────────────────────────
  const rawDetections = useMemo(() => {
    return dashboardData?.cameraDetections?.[id] || []
  }, [dashboardData?.cameraDetections, id])

  const smoothDetections = useSocketDetections(
    status === 'online' ? rawDetections : []
  )

  // ── 5. Fullscreen Toggles ──────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error('[fullscreen] error:', err))
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // ── 6. High-Fidelity Canvas Snapshot Capture ───────────────────────
  const captureSnapshot = () => {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    
    // Set matching dimensions
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 360

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw active video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Trigger local download
    const dataUrl = canvas.toDataURL('image/jpeg')
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `snapshot-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`
    link.click()
  }

  const isStreamLoading = type === 'webcam' ? webcamLoading : isLoading
  const finalError = type === 'webcam' ? webcamError : playerError

  return (
    <div 
      ref={containerRef}
      className={`group relative flex flex-col overflow-hidden rounded-[24px] border border-[color:var(--line)] bg-[color:var(--bg-panel)] transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${
        isFullscreen ? 'h-screen w-screen rounded-none border-none' : 'aspect-video w-full'
      }`}
    >
      {/* ── Dynamic AI Bounding Box Overlays ─────────────────────────── */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {smoothDetections.map((det) => (
          <div
            key={det.id}
            className="absolute rounded-lg border-2 border-cyan-400 bg-cyan-400/5 shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-all duration-75"
            style={{
              top: `${det.y}%`,
              left: `${det.x}%`,
              width: `${det.width}%`,
              height: `${det.height}%`,
              opacity: det.opacity
            }}
          >
            {/* Tag badge with confidence indicator */}
            <div className="absolute -top-6 left-0 flex items-center gap-1.5 rounded bg-cyan-500/90 px-1.5 py-0.5 text-[10px] font-black tracking-wider text-black uppercase shadow">
              <Cpu className="h-3 w-3" />
              <span>{det.subjectName}</span>
              <span className="opacity-80">{(det.confidenceScore * 100).toFixed(0)}%</span>
            </div>
            
            {/* Pulsing neon corner ticks */}
            <div className="absolute -top-0.5 -left-0.5 h-2 w-2 border-t-2 border-l-2 border-cyan-300"></div>
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 border-t-2 border-r-2 border-cyan-300"></div>
            <div className="absolute -bottom-0.5 -left-0.5 h-2 w-2 border-b-2 border-l-2 border-cyan-300"></div>
            <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 border-b-2 border-r-2 border-cyan-300"></div>
          </div>
        ))}
      </div>

      {/* ── Video Element ────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="h-full w-full object-cover bg-black/60"
      />

      {/* ── Loading Overlay State ────────────────────────────────────── */}
      {isStreamLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-20"></span>
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500"></div>
          </div>
          <span className="mt-4 font-display text-xs font-black uppercase tracking-[0.2em] text-blue-400 animate-pulse">
            Connecting Surveillance Stream...
          </span>
        </div>
      )}

      {/* ── Error Overlay State ──────────────────────────────────────── */}
      {finalError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-4 text-center backdrop-blur-lg">
          <AlertTriangle className="mb-3 h-12 w-12 text-red-500 animate-bounce" />
          <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">Stream Connection Failed</h4>
          <p className="mt-1 text-xs text-[color:var(--muted)] max-w-xs">{finalError}</p>
          <button
            onClick={manuallyReconnect}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/20 active:scale-95"
          >
            <RefreshCw className="h-3 w-3" />
            Reconnect Stream
          </button>
        </div>
      )}

      {/* ── Top Header Controls Overlay ──────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-start justify-between bg-gradient-to-b from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div>
          <span className="font-display text-sm font-black tracking-wide text-white drop-shadow-sm">
            {name}
          </span>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {location}
          </span>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border border-white/5">
          <span className={`h-1.5 w-1.5 rounded-full ${status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`}></span>
          <span className={status === 'online' ? 'text-emerald-400' : 'text-gray-400'}>
            {status === 'online' ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* ── Bottom HUD Diagnostics & Actions ─────────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 z-20 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        
        {/* Real-time Diagnostics HUD */}
        {status === 'online' ? (
          <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-gray-300 bg-black/55 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-cyan-400" />
              <span>{latencyMs}ms LAT</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div>{jitterMs}ms JIT</div>
            <div className="h-3 w-px bg-white/10" />
            <div>{fps} FPS</div>
          </div>
        ) : (
          <div className="text-[10px] font-mono font-bold text-gray-400 bg-black/55 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md">
            STREAM SUSPENDED / OFFLINE
          </div>
        )}

        {/* Stream Actions */}
        <div className="flex items-center gap-2">
          {/* Snapshot Trigger */}
          {status === 'online' && (
            <button
              onClick={captureSnapshot}
              title="Capture Snapshot"
              className="rounded-lg bg-black/60 p-2 text-white border border-white/5 backdrop-blur-md hover:bg-white/10 hover:text-cyan-400 transition"
            >
              <Download className="h-4 w-4" />
            </button>
          )}

          {/* Fullscreen Trigger */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="rounded-lg bg-black/60 p-2 text-white border border-white/5 backdrop-blur-md hover:bg-white/10 hover:text-cyan-400 transition"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}