import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'

/**
 * Custom high-performance, memory-leak-safe React hook for HLS.js video streaming.
 *
 * @param {string|null} url - HLS manifest URL (.m3u8).
 * @param {React.RefObject<HTMLVideoElement>} videoRef - React ref pointing to the video element.
 * @returns {{
 *   isLoading: boolean,
 *   error: string|null,
 *   retryCount: number,
 *   isSafariNative: boolean,
 *   manuallyReconnect: () => void
 * }}
 */
export function useHLSPlayer(url, videoRef) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isSafariNative, setIsSafariNative] = useState(false)
  
  const hlsRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  
  const destroyPlayer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.removeAttribute('src')
      videoRef.current.load()
    }
  }, [videoRef])

  const initializePlayer = useCallback(() => {
    destroyPlayer()
    
    if (!url || !videoRef.current) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const video = videoRef.current

    // ── 1. Native HLS Support (Safari / iOS) ──────────────────────────
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      setIsSafariNative(true)
      video.src = url
      
      const onPlay = () => setIsLoading(false)
      const onError = (e) => {
        console.error('[hls-native] play error:', e)
        setError('Native stream currently unavailable.')
        setIsLoading(false)
      }

      video.addEventListener('playing', onPlay)
      video.addEventListener('error', onError)
      
      video.play().catch(() => {
        // Autoplay policy might block initially
      })

      // Store cleanup for effect closure
      hlsRef.current = {
        destroy: () => {
          video.removeEventListener('playing', onPlay)
          video.removeEventListener('error', onError)
        }
      }
      return
    }

    // ── 2. HLS.js Library Support (Chrome, Firefox, Edge, etc.) ────────
    if (Hls.isSupported()) {
      setIsSafariNative(false)

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferSize: 0,
        maxBufferLength: 4,
        liveSyncPosition: 1.5,
        manifestLoadingMaxRetry: 3,
        manifestLoadingRetryDelay: 1000,
      })

      hls.loadSource(url)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)
        video.play().catch(() => {
          // Autoplay blocked handling
        })
      })

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error('[hls-lib] error event:', data.type, data.details, data.fatal)
        
        if (data.fatal) {
          setIsLoading(false)
          setError(`Stream offline: ${data.details}`)

          // Exponential backoff reconnect
          const delay = Math.min(1000 * Math.pow(2, retryCount), 16000)
          console.warn(`[hls-lib] fatal error. Retrying in ${delay}ms...`)

          destroyPlayer()

          reconnectTimerRef.current = setTimeout(() => {
            setRetryCount((prev) => prev + 1)
            initializePlayer()
          }, delay)
        }
      })

      hlsRef.current = hls
    } else {
      setError('HLS playback is not supported in this browser.')
      setIsLoading(false)
    }
  }, [url, videoRef, retryCount, destroyPlayer])

  useEffect(() => {
    initializePlayer()
    return () => {
      destroyPlayer()
    }
  }, [url]) // Re-run player when streaming URL changes

  const manuallyReconnect = useCallback(() => {
    setRetryCount(0)
    initializePlayer()
  }, [initializePlayer])

  return {
    isLoading,
    error,
    retryCount,
    isSafariNative,
    manuallyReconnect,
  }
}
