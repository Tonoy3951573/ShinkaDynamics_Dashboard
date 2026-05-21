import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

/**
 * Real-time WebSocket hook for the Shinka Dynamics dashboard.
 *
 * Connects to the backend Socket.IO server using the provided JWT token.
 * Re-connects automatically whenever the token changes (e.g. after login).
 * Properly tears down and re-initialises the socket instance on token change
 * so stale authenticated connections are never reused.
 *
 * @param {string|null} token     JWT access token from AuthContext.
 * @param {(event: string, payload: any) => void} onEvent
 *   Handler invoked for every inbound domain event. Stored in a ref so the
 *   effect never needs to re-run when the callback identity changes.
 * @returns {{ socketStatus: 'connected'|'reconnecting'|'disconnected' }}
 */
export function useSocket(token, onEvent) {
  const [socketStatus, setSocketStatus] = useState('disconnected')
  const [socketInstance, setSocketInstance] = useState(null)
  const onEventRef = useRef(onEvent)

  // Keep the callback ref fresh without re-triggering the connection effect.
  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    // No token → stay disconnected, clean up any existing socket.
    if (!token) {
      setSocketStatus('disconnected')
      setSocketInstance(null)
      return
    }

    setSocketStatus('reconnecting') // optimistic "trying…" state

    // Connect to the same origin; Vite proxy forwards /socket.io → :3000 in dev.
    const socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
    })

    setSocketInstance(socket)

    // ── Lifecycle events ───────────────────────────────────────────────
    socket.on('connect', () => {
      setSocketStatus('connected')
      console.log('[socket] connected — id:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      // 'io client disconnect' means we triggered it ourselves (e.g. logout) — don't
      // show as a lost connection, the cleanup below will set 'disconnected'.
      if (reason !== 'io client disconnect') {
        setSocketStatus('disconnected')
        console.warn('[socket] disconnected —', reason)
      }
    })

    socket.on('reconnect_attempt', (attempt) => {
      setSocketStatus('reconnecting')
      console.log('[socket] reconnecting — attempt', attempt)
    })

    socket.on('reconnect', () => {
      setSocketStatus('connected')
    })

    socket.on('connect_error', (err) => {
      console.error('[socket] connection error:', err.message)
      setSocketStatus('disconnected')
    })

    // ── Domain events from the AI backend ─────────────────────────────
    const domainEvents = [
      'alert:new',
      'feed:update',
      'employee:score_update',
      'insight:refresh',
      'admin:force_restart',
      'state:refresh',
    ]

    domainEvents.forEach((eventName) => {
      socket.on(eventName, (payload) => {
        onEventRef.current?.(eventName, payload)
      })
    })

    // ── Cleanup — runs when token changes (logout/login) or unmount ────
    return () => {
      domainEvents.forEach((eventName) => socket.off(eventName))
      socket.disconnect()
      setSocketStatus('disconnected')
      setSocketInstance(null)
    }
  }, [token]) // Re-run whenever the token changes

  return { socketStatus, socket: socketInstance }
}
