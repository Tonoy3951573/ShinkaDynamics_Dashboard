import { useEffect, useState, useRef } from 'react'
import { api } from '../lib/api'

/**
 * Hook to manage individual camera online/offline statuses, heartbeats, and metrics.
 *
 * @param {string} cameraId - Database camera ID.
 * @param {string} type - 'webcam' | 'hls'.
 * @param {boolean} isActive - Whether the stream is actively running/connected in the UI.
 * @param {any} socket - Socket instance or similar communication bridge.
 * @returns {{
 *   status: 'online' | 'offline',
 *   latencyMs: number,
 *   jitterMs: number,
 *   fps: number
 * }}
 */
export function useCameraStatus(cameraId, type, isActive, socket) {
  const [status, setStatus] = useState('offline')
  const [metrics, setMetrics] = useState({ latencyMs: 0, jitterMs: 0, fps: 0 })
  const heartbeatTimerRef = useRef(null)
  const pollingTimerRef = useRef(null)

  // 1. Fetch current live telemetry and stream status from backend
  const fetchStreamTelemetry = async () => {
    try {
      const data = await api(`/cameras/${cameraId}/stream`)
      setStatus(data.status || 'offline')
      if (data.diagnostics) {
        setMetrics(data.diagnostics)
      }
    } catch (e) {
      // Stream details unreachable/404 means offline
      setStatus('offline')
    }
  }

  useEffect(() => {
    // Initial fetch on mount
    fetchStreamTelemetry()

    // 2. Poll metrics every 10 seconds if active in the UI
    if (isActive) {
      pollingTimerRef.current = setInterval(fetchStreamTelemetry, 10000)
    }

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current)
      }
    }
  }, [cameraId, isActive])

  // 3. Bidirectional heartbeats for browser-based Webcams
  useEffect(() => {
    if (type !== 'webcam' || !isActive || !socket) {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current)
      }
      return
    }

    // Set online locally and send first heartbeat immediately
    setStatus('online')
    socket.emit?.('camera:heartbeat', { cameraId })

    heartbeatTimerRef.current = setInterval(() => {
      socket.emit?.('camera:heartbeat', { cameraId })
    }, 5000)

    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current)
      }
    }
  }, [cameraId, type, isActive, socket])

  // 4. WebSocket state change subscription
  useEffect(() => {
    if (!socket) return

    const handleCameraOnline = (payload) => {
      if (payload.cameraId === cameraId) {
        setStatus('online')
        fetchStreamTelemetry()
      }
    }

    const handleCameraOffline = (payload) => {
      if (payload.cameraId === cameraId) {
        setStatus('offline')
        setMetrics({ latencyMs: 0, jitterMs: 0, fps: 0 })
      }
    }

    socket.on?.('camera:online', handleCameraOnline)
    socket.on?.('camera:offline', handleCameraOffline)

    return () => {
      socket.off?.('camera:online', handleCameraOnline)
      socket.off?.('camera:offline', handleCameraOffline)
    }
  }, [cameraId, socket])

  return {
    status,
    ...metrics
  }
}
