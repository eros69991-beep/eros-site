import type { QualityTier } from '../../../domain/types'
import type { EffectProfile } from '../../../scene/contracts'

export const SUMMER_EFFECTS = {
  bloomIntensity: 0.18,
  bloomThreshold: 0.9,
  noiseOpacity: 0.008,
  vignetteOffset: 0.12,
  vignetteDarkness: 0.16,
  depthOfField: true,
} as const satisfies EffectProfile

export const SUMMER_PALETTE = {
  environment: '#E5E4DE',
  ground: '#D4D2C8',
  particle: '#F0EEE6',
} as const

export interface SummerAtmosphere {
  exposure: number
  shadowCompression: number
  heatAmplitude: number
  airDrift: number
  particleCount: number
}

const READABLE_OVERLAY_EXPOSURE_CEILING = 1.16
const MAX_AIR_DRIFT = 0.04

export function getSummerAtmosphere(
  progress: number,
  reducedMotion: boolean,
  quality: Exclude<QualityTier, 'static'>,
): SummerAtmosphere {
  const value = Math.min(1, Math.max(0, progress))
  const heatAmplitude = quality === 'high' ? 0.01 : quality === 'balanced' ? 0.007 : 0.004
  const particleCount = quality === 'high' ? 1800 : quality === 'balanced' ? 1200 : 900

  return {
    exposure: Math.min(READABLE_OVERLAY_EXPOSURE_CEILING, 1.04 + value * 0.12),
    shadowCompression: 0.68 - value * 0.32,
    heatAmplitude: reducedMotion ? 0 : heatAmplitude,
    airDrift: reducedMotion ? 0 : 0.018 + value * (MAX_AIR_DRIFT - 0.018),
    particleCount,
  }
}

export function getSummerAirOffset(time: number, airDrift: number): number {
  const stableTime = Number.isFinite(time) ? time : 0
  const boundedDrift = Math.min(MAX_AIR_DRIFT, Math.max(0, airDrift))
  const cycleTime = ((stableTime % 96) + 96) % 96

  return Math.sin(cycleTime * 0.18) * boundedDrift
}
