import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useLocation, type Location } from 'react-router-dom'
import type { QualityTier } from '../domain/types'
import { SceneFallback } from '../features/fallback/SceneFallback'
import { StaticUniverse } from '../features/fallback/StaticUniverse'
import { useSiteStore } from '../state/siteStore'
import { getEffectProfileForPath } from './contracts'
import { selectInitialQuality } from './quality'
import { SceneErrorBoundary } from './SceneErrorBoundary'
import { supportsWebGL } from './webgl'

interface OverlayState {
  backgroundLocation?: Location
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number
}

const RealtimeSceneLayer = lazy(async () => {
  const module = await import('./PostProcessingStack')
  return { default: module.RealtimeSceneLayer }
})

function readReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function readMobileLayout() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(max-width: 48rem)').matches
}

function getInitialQuality(webgl: boolean, reducedMotion: boolean): QualityTier {
  const browserNavigator = typeof navigator === 'undefined'
    ? null
    : navigator as NavigatorWithMemory

  return selectInitialQuality({
    mobile: readMobileLayout(),
    deviceMemory: browserNavigator?.deviceMemory ?? null,
    cores: browserNavigator?.hardwareConcurrency ?? 4,
    reducedMotion,
    webgl,
  })
}

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(readReducedMotion)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return reducedMotion
}

export function SceneHost() {
  const location = useLocation()
  const reducedMotion = useReducedMotionPreference()
  const setStoredQuality = useSiteStore((state) => state.setQualityTier)
  const [webglAvailable] = useState(supportsWebGL)
  const [quality, setQuality] = useState(() => getInitialQuality(webglAvailable, reducedMotion))
  const [retryKey, setRetryKey] = useState(0)
  const [forceStatic, setForceStatic] = useState(false)

  const updateQuality = useCallback((tier: QualityTier) => {
    setQuality(tier)
    setStoredQuality(tier)
  }, [setStoredQuality])

  useEffect(() => {
    setStoredQuality(quality)
  }, [quality, setStoredQuality])

  if (!webglAvailable || forceStatic || quality === 'static') {
    return <StaticUniverse />
  }

  const overlayState = location.state as OverlayState | null
  const scenePath = overlayState?.backgroundLocation?.pathname ?? location.pathname
  const profile = getEffectProfileForPath(scenePath)

  return (
    <SceneErrorBoundary
      resetKey={retryKey}
      fallback={(
        <SceneFallback
          onRetry={() => setRetryKey((value) => value + 1)}
          onContinueStatic={() => {
            setForceStatic(true)
            setStoredQuality('static')
          }}
        />
      )}
    >
      <Suspense fallback={<StaticUniverse />}>
        <RealtimeSceneLayer
          profile={profile}
          quality={quality}
          reducedMotion={reducedMotion}
          onDegrade={updateQuality}
        />
      </Suspense>
    </SceneErrorBoundary>
  )
}
