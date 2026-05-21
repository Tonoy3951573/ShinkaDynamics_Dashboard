import { useEffect, useRef, useState } from 'react'

const GRACE_PERIOD_MS = 1000 // 1s grace period for tracking persistence
const INTERPOLATION_FACTOR = 0.25 // Smooth coordinate gliding factor (higher = faster snap)

/**
 * Hook to smoothly interpolate real-time AI bounding box detections.
 *
 * @param {Array} rawDetections - Detections array [{ id, x, y, width, height, subjectName, confidenceScore }]
 * @returns {Array} interpolatedDetections - Smoothened, persistence-aware, and faded bounding boxes.
 */
export function useSocketDetections(rawDetections) {
  const [interpolated, setInterpolated] = useState([])
  const activeDetectionsRef = useRef(new Map())
  const animationFrameRef = useRef(null)

  useEffect(() => {
    const activeMap = activeDetectionsRef.current
    const now = Date.now()

    // 1. Process new incoming raw detections
    if (rawDetections && rawDetections.length > 0) {
      rawDetections.forEach((det) => {
        const id = det.id || `sub-${det.subjectName}`
        const existing = activeMap.get(id)

        if (existing) {
          // Update target coordinates, preserve current visual state for interpolation
          existing.target = {
            x: det.x,
            y: det.y,
            width: det.width,
            height: det.height,
            subjectName: det.subjectName,
            confidenceScore: det.confidenceScore
          }
          existing.lastSeen = now
          existing.isFading = false
        } else {
          // Initialize new subject box
          activeMap.set(id, {
            id,
            current: {
              x: det.x,
              y: det.y,
              width: det.width,
              height: det.height,
              subjectName: det.subjectName,
              confidenceScore: det.confidenceScore
            },
            target: {
              x: det.x,
              y: det.y,
              width: det.width,
              height: det.height,
              subjectName: det.subjectName,
              confidenceScore: det.confidenceScore
            },
            lastSeen: now,
            isFading: false,
            opacity: 1.0
          })
        }
      })
    }

    // 2. Mark subjects missing in rawDetections for fading / eventual deletion
    const rawIds = new Set((rawDetections || []).map((d) => d.id || `sub-${d.subjectName}`))
    activeMap.forEach((box, id) => {
      if (!rawIds.has(id)) {
        box.isFading = true
      }
    })
  }, [rawDetections])

  // 3. Interpolation and Opacity Glider Loop (runs at 60 FPS via requestAnimationFrame)
  useEffect(() => {
    const tick = () => {
      const activeMap = activeDetectionsRef.current
      const now = Date.now()
      const renders = []

      activeMap.forEach((box, id) => {
        // If fading and exceeded grace period, delete entirely
        if (box.isFading && now - box.lastSeen > GRACE_PERIOD_MS) {
          activeMap.delete(id)
          return
        }

        // Gliding coordinates towards target
        box.current.x += (box.target.x - box.current.x) * INTERPOLATION_FACTOR
        box.current.y += (box.target.y - box.current.y) * INTERPOLATION_FACTOR
        box.current.width += (box.target.width - box.current.width) * INTERPOLATION_FACTOR
        box.current.height += (box.target.height - box.current.height) * INTERPOLATION_FACTOR
        box.current.confidenceScore += (box.target.confidenceScore - box.current.confidenceScore) * INTERPOLATION_FACTOR

        // Calculate opacity fade out based on grace progress
        if (box.isFading) {
          const progress = (now - box.lastSeen) / GRACE_PERIOD_MS
          box.opacity = Math.max(0, 1.0 - progress)
        } else {
          box.opacity = 1.0
        }

        renders.push({
          id: box.id,
          subjectName: box.current.subjectName,
          confidenceScore: box.current.confidenceScore,
          opacity: box.opacity,
          x: box.current.x,
          y: box.current.y,
          width: box.current.width,
          height: box.current.height
        })
      })

      setInterpolated(renders)
      animationFrameRef.current = requestAnimationFrame(tick)
    }

    animationFrameRef.current = requestAnimationFrame(tick)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return interpolated
}
