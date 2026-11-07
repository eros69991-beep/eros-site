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
import './sceneClock'
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

const canExposeSceneTestApi = import.meta.env.DEV || import.meta.env.MODE === 'test'

function TestSceneError({ active }: { active: boolean }) {
  if (active) throw new Error('Test-triggered realtime scene error')
  return null
}

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

function readCompactViewport() {
  return typeof window !== 'undefined' && window.innerWidth <= 600
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

function useCompactViewport() {
  const [compact, setCompact] = useState(readCompactViewport)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const update = () => setCompact(readCompactViewport())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return compact
}

function getWorldIdFromPath(pathname: string): WorldId | null {
  const match = /^\/world\/(spring|summer|autumn|winter)(?:\/|$)/.exec(pathname)
  return match?.[1] as WorldId | undefined ?? null
}

export function SceneHost() {
  const location = useLocation()
  const reducedMotion = useReducedMotionPreference()
  const compactViewport = useCompactViewport()
  const setStoredQuality = useSiteStore((state) => state.setQualityTier)
  const reducedVisualWorld = useSiteStore((state) => state.reducedVisualWorld)
  const [webglAvailable] = useState(supportsWebGL)
  const [performanceMobile] = useState(readMobilePerformanceDevice)
  const mobile = performanceMobile || compactViewport
  const [quality, setQuality] = useState(() => (
    getInitialQuality(webglAvailable, reducedMotion, performanceMobile)
  ))
  const [retryKey, setRetryKey] = useState(0)
  const [forceStatic, setForceStatic] = useState(false)
  const [testSceneError, setTestSceneError] = useState(false)

  const updateQuality = useCallback((tier: QualityTier) => {
    setQuality(tier)
    setStoredQuality(tier)
  }, [setStoredQuality])

  useEffect(() => {
    setStoredQuality(quality)
  }, [quality, setStoredQuality])

  useEffect(() => {
    if (!canExposeSceneTestApi || typeof window === 'undefined') return undefined
    const api = window.__EROS_TEST_API__
    if (!api) return undefined
    const triggerSceneError = () => setTestSceneError(true)
    api.triggerSceneError = triggerSceneError
    return () => {
      if (window.__EROS_TEST_API__?.triggerSceneError === triggerSceneError) {
        delete window.__EROS_TEST_API__.triggerSceneError
      }
    }
  }, [])

  const overlayState = location.state as OverlayState | null
  const scenePath = overlayState?.backgroundLocation?.pathname ?? location.pathname
  const worldId = getWorldIdFromPath(scenePath)
  const descriptor = worldId ? sceneRegistry[worldId] : undefined
  const WorldScene = useMemo(() => (descriptor ? lazy(descriptor.load) : undefined), [descriptor])
  const profile = descriptor?.effects ?? (scenePath === '/'
    ? SCENE_EFFECT_PROFILES.universe
    : SCENE_EFFECT_PROFILES.neutral)

  if (!webglAvailable || forceStatic || quality === 'static' || (worldId !== null && reducedVisualWorld === worldId)) {
    return <StaticUniverse interactive={scenePath === '/'} />
  }

  return (
    <SceneErrorBoundary
      resetKey={retryKey}
      fallback={(
        <SceneFallback
          onRetry={() => {
            setTestSceneError(false)
            setRetryKey((value) => value + 1)
          }}
          onContinueStatic={() => {
            setForceStatic(true)
            setStoredQuality('static')
          }}
        />
      )}
    >
      <Suspense fallback={<StaticUniverse interactive={scenePath === '/'} />}>
        <TestSceneError active={testSceneError} />
        <RealtimeSceneLayer
          profile={profile}
          worldScene={WorldScene}
          quality={quality}
          mobile={mobile}
          reducedMotion={reducedMotion}
          worldProgress={worldSceneProgressRef}
          onDegrade={updateQuality}
          scenePath={scenePath}
          quiet={scenePath.startsWith('/product/')}
          // 没有场景的页面在路由切换的同一次渲染里就隐藏画布，
          // 避免画布还没重画时，上一个季节的最后一帧压在新页面上。
          idle={!descriptor && scenePath !== '/'}
          onContextLost={() => {
            setForceStatic(true)
            setStoredQuality('static')
          }}
        />
      </Suspense>
    </SceneErrorBoundary>
  )
}
