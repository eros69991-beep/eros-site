import type { QualityTier } from '../../../domain/types'
import type { EffectProfile } from '../../../scene/contracts'

export const AUTUMN_EFFECTS = {
  bloomIntensity: 0.22,
  bloomThreshold: 0.82,
  noiseOpacity: 0.024,
  vignetteOffset: 0.3,
  vignetteDarkness: 0.44,
  depthOfField: true,
} as const satisfies EffectProfile

export const AUTUMN_PALETTE = {
  environment: '#302C2A',
  ground: '#554C47',
  substrate: '#8D8278',
  warmLight: '#C47D52',
  dust: '#BBAA97',
} as const

export interface AutumnAtmosphere {
  sunElevation: number
  warmLightContribution: number
  shadowLength: number
  dustSpeed: number
  surfaceWeathering: number
  particleCount: number
}

const MAX_DUST_SPEED = 0.045
const DUST_TRAVEL_MULTIPLIER = 12
const DUST_CYCLE_SECONDS = 96

export const AUTUMN_DUST_OFFSET_LIMIT = MAX_DUST_SPEED * DUST_TRAVEL_MULTIPLIER

function normalizeTime(time: number, cycleSeconds: number) {
  if (!Number.isFinite(time)) return 0
  return ((time % cycleSeconds) + cycleSeconds) % cycleSeconds
}

export function getAutumnAtmosphere(
  progress: number,
  reducedMotion: boolean,
  quality: Exclude<QualityTier, 'static'>,
): AutumnAtmosphere {
  const value = Math.min(1, Math.max(0, progress))
  const particleCount = quality === 'high' ? 2400 : quality === 'balanced' ? 1400 : 800

  return {
    sunElevation: 0.38 - value * 0.23,
    warmLightContribution: 0.64 - value * 0.38,
    shadowLength: 3 + value * 5.4,
    dustSpeed: reducedMotion ? 0 : MAX_DUST_SPEED - value * 0.018,
    surfaceWeathering: 0.28 + value * 0.44,
    particleCount,
  }
}

export function getAutumnDustOffset(time: number, dustSpeed: number): number {
  const cycleTime = normalizeTime(time, DUST_CYCLE_SECONDS)
  const boundedSpeed = Math.min(MAX_DUST_SPEED, Math.max(0, dustSpeed))

  return Math.sin((cycleTime / DUST_CYCLE_SECONDS) * Math.PI * 2)
    * boundedSpeed
    * DUST_TRAVEL_MULTIPLIER
}
