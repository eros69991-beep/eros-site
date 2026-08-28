import type { ComponentType } from 'react'
import type { QualityTier } from '../domain/types'

export interface EffectProfile {
  bloomIntensity: number
  bloomThreshold: number
  noiseOpacity: number
  vignetteOffset: number
  vignetteDarkness: number
  depthOfField: boolean
  chromaticAberration?: readonly [number, number]
}

export interface WorldSceneProps {
  quality: Exclude<QualityTier, 'static'>
  reducedMotion: boolean
  progress: { current: number }
}

export type WorldSceneComponent = ComponentType<WorldSceneProps>

export interface WorldSceneDescriptor {
  load: () => Promise<{ default: WorldSceneComponent }>
  effects: EffectProfile
}

export const SCENE_EFFECT_PROFILES = {
  universe: { bloomIntensity: 0.32, bloomThreshold: 0.78, noiseOpacity: 0.012, vignetteOffset: 0.24, vignetteDarkness: 0.36, depthOfField: true },
  spring: { bloomIntensity: 0.28, bloomThreshold: 0.78, noiseOpacity: 0.018, vignetteOffset: 0.22, vignetteDarkness: 0.32, depthOfField: true },
  summer: { bloomIntensity: 0.18, bloomThreshold: 0.90, noiseOpacity: 0.008, vignetteOffset: 0.12, vignetteDarkness: 0.16, depthOfField: true, chromaticAberration: [0.0007, 0.00035] },
  autumn: { bloomIntensity: 0.22, bloomThreshold: 0.82, noiseOpacity: 0.024, vignetteOffset: 0.30, vignetteDarkness: 0.44, depthOfField: true },
  winter: { bloomIntensity: 0.16, bloomThreshold: 0.88, noiseOpacity: 0.006, vignetteOffset: 0.22, vignetteDarkness: 0.30, depthOfField: false },
  neutral: { bloomIntensity: 0.10, bloomThreshold: 0.92, noiseOpacity: 0.004, vignetteOffset: 0.16, vignetteDarkness: 0.18, depthOfField: false },
} as const satisfies Record<string, EffectProfile>

const TIER_MULTIPLIERS: Record<Exclude<QualityTier, 'static'>, number> = {
  high: 1,
  balanced: 0.8,
  lite: 0.55,
}

export function getEffectProfileForPath(pathname: string): EffectProfile {
  if (pathname === '/') return SCENE_EFFECT_PROFILES.universe
  if (pathname.startsWith('/world/spring')) return SCENE_EFFECT_PROFILES.spring
  if (pathname.startsWith('/world/summer')) return SCENE_EFFECT_PROFILES.summer
  if (pathname.startsWith('/world/autumn')) return SCENE_EFFECT_PROFILES.autumn
  if (pathname.startsWith('/world/winter')) return SCENE_EFFECT_PROFILES.winter
  return SCENE_EFFECT_PROFILES.neutral
}

export function resolveEffectProfile(
  profile: EffectProfile,
  quality: Exclude<QualityTier, 'static'>,
): EffectProfile {
  const multiplier = TIER_MULTIPLIERS[quality]
  const { chromaticAberration, ...baseProfile } = profile

  return {
    ...baseProfile,
    bloomIntensity: profile.bloomIntensity * multiplier,
    noiseOpacity: profile.noiseOpacity * multiplier,
    depthOfField: quality !== 'lite' && profile.depthOfField,
    ...(quality !== 'lite' && chromaticAberration ? { chromaticAberration } : {}),
  }
}
