import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useState } from 'react'
import type { QualityTier } from '../domain/types'
import styles from '../features/fallback/fallback.module.css'
import { UniverseScene } from '../features/universe/UniverseScene'
import { createQualityMonitor, getEffectiveSceneBudget } from './quality'
import {
  resolveEffectProfile,
  type EffectProfile,
  type WorldSceneComponent,
} from './contracts'

type RealtimeQualityTier = Exclude<QualityTier, 'static'>

interface PostProcessingStackProps {
  profile: EffectProfile
  quality: RealtimeQualityTier
}

export function PostProcessingStack({ profile, quality }: PostProcessingStackProps) {
  const effects = resolveEffectProfile(profile, quality)
  const multisampling = quality === 'high' ? 4 : quality === 'balanced' ? 2 : 0

  return (
    <EffectComposer multisampling={multisampling}>
      <ToneMapping />
      <Bloom
        intensity={effects.bloomIntensity}
        luminanceThreshold={effects.bloomThreshold}
        luminanceSmoothing={0.12}
        mipmapBlur
      />
      <Noise opacity={effects.noiseOpacity} />
      <Vignette offset={effects.vignetteOffset} darkness={effects.vignetteDarkness} />
      {effects.depthOfField ? (
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
  onDegrade(tier: QualityTier): void
  scenePath?: string
}

export function RealtimeSceneLayer({
  profile,
  worldScene: WorldScene,
  quality,
  mobile,
  reducedMotion,
  onDegrade,
  scenePath = '/',
}: RealtimeSceneLayerProps) {
  const budget = getEffectiveSceneBudget(quality, mobile)
  const worldSceneQuality: RealtimeQualityTier = mobile ? 'lite' : quality
  const [worldProgress] = useState({ current: 0 })

  return (
    <div className={styles.sceneLayer} aria-hidden="true">
      <Canvas
        camera={{ fov: 42, position: [0, 0.45, mobile ? 58 : 24] }}
        className={styles.canvasSurface}
        dpr={budget.dpr}
        frameloop={reducedMotion ? 'demand' : 'always'}
        gl={{ antialias: quality !== 'lite', alpha: true }}
      >
        <FrameQualityMonitor quality={quality} onDegrade={onDegrade} />
        {WorldScene ? (
          <WorldScene quality={worldSceneQuality} progress={worldProgress} reducedMotion={reducedMotion} />
        ) : scenePath === '/' ? <UniverseScene quality={quality} mobile={mobile} reducedMotion={reducedMotion} /> : null}
        <PostProcessingStack profile={profile} quality={quality} />
      </Canvas>
    </div>
  )
}
