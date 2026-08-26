import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import type { QualityTier } from '../domain/types'
import styles from '../features/fallback/fallback.module.css'
import { createQualityMonitor, getEffectiveSceneBudget } from './quality'
import { resolveEffectProfile, type EffectProfile } from './contracts'

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
  quality: RealtimeQualityTier
  mobile: boolean
  reducedMotion: boolean
  onDegrade(tier: QualityTier): void
}

export function RealtimeSceneLayer({
  profile,
  quality,
  mobile,
  reducedMotion,
  onDegrade,
}: RealtimeSceneLayerProps) {
  const budget = getEffectiveSceneBudget(quality, mobile)

  return (
    <div className={styles.sceneLayer} aria-hidden="true">
      <Canvas
        className={styles.canvasSurface}
        dpr={budget.dpr}
        frameloop={reducedMotion ? 'demand' : 'always'}
        gl={{ antialias: quality !== 'lite', alpha: true }}
      >
        <FrameQualityMonitor quality={quality} onDegrade={onDegrade} />
        <PostProcessingStack profile={profile} quality={quality} />
      </Canvas>
    </div>
  )
}
