import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, type Location } from 'react-router-dom'
import type { QualityTier, WorldId } from '../domain/types'
import { SceneFallback } from '../features/fallback/SceneFallback'
import { StaticUniverse } from '../features/fallback/StaticUniverse'
import { sceneRegistry } from '../features/worlds/sceneRegistry'
import { worldSceneProgressRef } from '../features/worlds/worldSceneProgress'
import { useSiteStore } from '../state/siteStore'
import { SCENE_EFFECT_PROFILES } from './contracts'
import { classifyMobilePerformanceDevice, selectInitialQuality } from './quality'
import { SceneErrorBoundary } from './SceneErrorBoundary'
import { supportsWebGL } from './webgl'

interface OverlayState {
  backgroundLocation?: Location
}

interface NavigatorWithPerformanceSignals extends Navigator {
  deviceMemory?: number
  userAgentData?: {
    mobile?: boolean
  }
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

function readCoarsePointer() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(pointer: coarse)').matches
}

function readMobilePerformanceDevice() {
  if (typeof navigator === 'undefined') return false
  const browserNavigator = navigator as NavigatorWithPerformanceSignals

  return classifyMobilePerformanceDevice({
    userAgentDataMobile: browserNavigator.userAgentData?.mobile ?? null,
    userAgent: browserNavigator.userAgent,
    maxTouchPoints: browserNavigator.maxTouchPoints,
    coarsePointer: readCoarsePointer(),
  })
}

function getInitialQuality(
  webgl: boolean,
  reducedMotion: boolean,
  mobile: boolean,
): QualityTier {
  const browserNavigator = typeof navigator === 'undefined'
    ? null
    : navigator as NavigatorWithPerformanceSignals

  return selectInitialQuality({
    mobile,
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

function getWorldIdFromPath(pathname: string): WorldId | null {
  const match = /^\/world\/(spring|summer|autumn|winter)(?:\/|$)/.exec(pathname)
  return match?.[1] as WorldId | undefined ?? null
}

export function SceneHost() {
  const location = useLocation()
  const reducedMotion = useReducedMotionPreference()
  const setStoredQuality = useSiteStore((state) => state.setQualityTier)
  const [webglAvailable] = useState(supportsWebGL)
  const [mobile] = useState(readMobilePerformanceDevice)
  const [quality, setQuality] = useState(() => (
    getInitialQuality(webglAvailable, reducedMotion, mobile)
  ))
  const [retryKey, setRetryKey] = useState(0)
  const [forceStatic, setForceStatic] = useState(false)

  const updateQuality = useCallback((tier: QualityTier) => {
    setQuality(tier)
    setStoredQuality(tier)
  }, [setStoredQuality])

  useEffect(() => {
    setStoredQuality(quality)
  }, [quality, setStoredQuality])

  const overlayState = location.state as OverlayState | null
  const scenePath = overlayState?.backgroundLocation?.pathname ?? location.pathname
  const worldId = getWorldIdFromPath(scenePath)
  const descriptor = worldId ? sceneRegistry[worldId] : undefined
  const WorldScene = useMemo(() => (descriptor ? lazy(descriptor.load) : undefined), [descriptor])
  const profile = descriptor?.effects ?? (scenePath === '/'
    ? SCENE_EFFECT_PROFILES.universe
    : SCENE_EFFECT_PROFILES.neutral)

  if (!webglAvailable || forceStatic || quality === 'static') {
    return <StaticUniverse />
  }

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
          worldScene={WorldScene}
          quality={quality}
          mobile={mobile}
          reducedMotion={reducedMotion}
          worldProgress={worldSceneProgressRef}
          onDegrade={updateQuality}
          scenePath={scenePath}
        />
      </Suspense>
    </SceneErrorBoundary>
  )
}
