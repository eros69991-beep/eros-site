import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useState } from 'react'
import type { QualityTier } from '../domain/types'
import styles from '../features/fallback/fallback.module.css'
import { UniverseScene } from '../features/universe/UniverseScene'
import { createQualityMonitor, getEffectiveSceneBudget } from './quality'
import { isSceneTimeFrozen, subscribeSceneClock } from './sceneClock'
import {
  resolveEffectProfile,
  type EffectProfile,
  type WorldSceneComponent,
} from './contracts'

type RealtimeQualityTier = Exclude<QualityTier, 'static'>

interface PostProcessingStackProps {
  profile: EffectProfile
  quality: RealtimeQualityTier
  quiet?: boolean
}

export function PostProcessingStack({ profile, quality, quiet = false }: PostProcessingStackProps) {
  const effects = resolveEffectProfile(profile, quality)
  const quietEffects = quiet ? {
    ...effects,
    bloomIntensity: effects.bloomIntensity * 0.5,
    noiseOpacity: effects.noiseOpacity * 0.5,
    vignetteDarkness: effects.vignetteDarkness * 0.5,
    depthOfField: false,
  } : effects
  const multisampling = quality === 'high' ? 4 : quality === 'balanced' ? 2 : 0

  return (
    <EffectComposer multisampling={multisampling}>
      <ToneMapping />
      <Bloom
        intensity={quietEffects.bloomIntensity}
        luminanceThreshold={quietEffects.bloomThreshold}
        luminanceSmoothing={0.12}
        mipmapBlur
      />
      <Noise opacity={quietEffects.noiseOpacity} />
      <Vignette offset={quietEffects.vignetteOffset} darkness={quietEffects.vignetteDarkness} />
      {quietEffects.depthOfField ? (
        <DepthOfField focusDistance={0.02} focalLength={0.025} bokehScale={1.5} />
      ) : null}
    </EffectComposer>
  )
}

function FrameQualityMonitor({
  quality,
  onDegrade,
}: {
  quality: RealtimeQualityTier
  onDegrade(tier: QualityTier): void
}) {
  const monitor = useMemo(() => createQualityMonitor(quality, onDegrade), [onDegrade, quality])
  useFrame((_state, delta) => monitor.recordFrameTime(delta * 1_000))
  return null
}

interface RealtimeSceneLayerProps {
  profile: EffectProfile
  worldScene?: WorldSceneComponent | undefined
  quality: RealtimeQualityTier
  mobile: boolean
  reducedMotion: boolean
  worldProgress?: { current: number }
  onDegrade(tier: QualityTier): void
  scenePath?: string
  quiet?: boolean
  onContextLost?(): void
}

const DEFAULT_WORLD_PROGRESS = { current: 0 }

function ContextLossRecovery({ onContextLost }: { onContextLost?(): void }) {
  const gl = useThree((state) => state.gl)
  useEffect(() => {
    if (!onContextLost) return undefined
    const recover = (event: Event) => { event.preventDefault(); onContextLost() }
    gl.domElement.addEventListener('webglcontextlost', recover)
    return () => gl.domElement.removeEventListener('webglcontextlost', recover)
  }, [gl, onContextLost])
  return null
}

function SceneClockInvalidator() {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => subscribeSceneClock(() => invalidate()), [invalidate])

  return null
}

export function RealtimeSceneLayer({
  profile,
  worldScene: WorldScene,
  quality,
  mobile,
  reducedMotion,
  worldProgress = DEFAULT_WORLD_PROGRESS,
  onDegrade,
  scenePath = '/',
  quiet = false,
  onContextLost,
}: RealtimeSceneLayerProps) {
  const budget = getEffectiveSceneBudget(quality, mobile)
  const worldSceneQuality: RealtimeQualityTier = mobile ? 'lite' : quality
  const [sceneTimeFrozen, setSceneTimeFrozen] = useState(isSceneTimeFrozen)

  useEffect(() => subscribeSceneClock(() => setSceneTimeFrozen(isSceneTimeFrozen())), [])

  return (
    <div className={styles.sceneLayer} aria-hidden="true" data-quiet={quiet || undefined}>
      <Canvas
        camera={{ fov: 42, position: [0, 0.45, mobile ? 58 : 24] }}
        className={styles.canvasSurface}
        dpr={budget.dpr}
        frameloop={reducedMotion || sceneTimeFrozen ? 'demand' : 'always'}
        gl={{ antialias: quality !== 'lite', alpha: true }}
      >
        {onContextLost ? <ContextLossRecovery onContextLost={onContextLost} /> : null}
        <SceneClockInvalidator />
        <FrameQualityMonitor quality={quality} onDegrade={onDegrade} />
        <Suspense fallback={null}>
          {WorldScene ? (
            <WorldScene quality={worldSceneQuality} progress={worldProgress} reducedMotion={reducedMotion} />
          ) : scenePath === '/' ? <UniverseScene quality={quality} mobile={mobile} reducedMotion={reducedMotion} /> : null}
        </Suspense>
        <PostProcessingStack profile={profile} quality={quality} quiet={quiet} />
      </Canvas>
    </div>
  )
}
