import { useEffect, useRef, useState, type ReactNode } from 'react'
import { worldSceneProgressRef } from './worldSceneProgress'
import styles from './worlds.module.css'

function readReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function useReducedMotionPreference(override: boolean | undefined) {
  const [platformReducedMotion, setPlatformReducedMotion] = useState(readReducedMotion)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined

    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = (event: MediaQueryListEvent) => setPlatformReducedMotion(event.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return override ?? platformReducedMotion
}

interface WorldSceneFrameProps {
  children: ReactNode
  reducedMotion?: boolean
}

export function WorldSceneFrame({ children, reducedMotion: reducedMotionOverride }: WorldSceneFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotionPreference(reducedMotionOverride)

  useEffect(() => {
    if (reducedMotion) {
      worldSceneProgressRef.current = 1
      return undefined
    }

    let frame = 0
    const updateProgress = () => {
      frame = 0
      if (!rootRef.current) return

      const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      worldSceneProgressRef.current = Math.min(1, Math.max(0, window.scrollY / scrollRange))
    }
    const scheduleUpdate = () => {
      if (frame !== 0) return
      frame = window.requestAnimationFrame(updateProgress)
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    scheduleUpdate()

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (frame !== 0) window.cancelAnimationFrame(frame)
    }
  }, [reducedMotion])

  return <div className={styles.sceneFrame} ref={rootRef}>{children}</div>
}
