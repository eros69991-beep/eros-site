import type { QualityTier } from '../../../domain/types'
import type { EffectProfile } from '../../../scene/contracts'

export const SPRING_EFFECTS = {
  bloomIntensity: 0.28,
  bloomThreshold: 0.78,
  noiseOpacity: 0.018,
  vignetteOffset: 0.22,
  vignetteDarkness: 0.32,
  depthOfField: true,
} as const satisfies EffectProfile

export interface SpringAtmosphere {
  fogDensity: number
  wetReflection: number
  livingAccent: number
  verticalDrift: number
  particleCount: number
}

const MIST_BASE_SWAY = 0.15
const MAX_VERTICAL_DRIFT = 0.025
const MIST_DRIFT_MULTIPLIER = 4

export const SPRING_MIST_OFFSET_LIMIT = MIST_BASE_SWAY + MAX_VERTICAL_DRIFT * MIST_DRIFT_MULTIPLIER

export function getSpringAtmosphere(
  progress: number,
  reducedMotion: boolean,
  quality: Exclude<QualityTier, 'static'>,
): SpringAtmosphere {
  const value = Math.min(1, Math.max(0, progress))
  const particleCount = quality === 'high' ? 4000 : quality === 'balanced' ? 2200 : 1200

  return {
    fogDensity: reducedMotion ? 0.032 : 0.045 - value * 0.018,
    wetReflection: 0.18 + value * 0.16,
    livingAccent: Math.min(0.1, 0.02 + value * 0.08),
    verticalDrift: reducedMotion ? 0 : value * 0.025,
    particleCount,
  }
}

export function sampleSpringAtmosphere(
  progress: { current: number },
  reducedMotion: boolean,
  quality: Exclude<QualityTier, 'static'>,
) {
  return getSpringAtmosphere(progress.current, reducedMotion, quality)
}

export function getSpringMistOffset(time: number, verticalDrift: number): number {
  const stableTime = Number.isFinite(time) ? time : 0
  const boundedDrift = Math.min(MAX_VERTICAL_DRIFT, Math.max(0, verticalDrift))

  return Math.sin(stableTime * 0.18) * MIST_BASE_SWAY
    + Math.sin(stableTime * 0.071) * boundedDrift * MIST_DRIFT_MULTIPLIER
}
