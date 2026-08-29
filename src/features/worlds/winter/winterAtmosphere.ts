import { Color, FogExp2, type Scene } from 'three'
import type { QualityTier } from '../../../domain/types'
import type { EffectProfile } from '../../../scene/contracts'

export const WINTER_EFFECTS = {
  bloomIntensity: 0.16,
  bloomThreshold: 0.88,
  noiseOpacity: 0.006,
  vignetteOffset: 0.22,
  vignetteDarkness: 0.30,
  depthOfField: false,
} as const satisfies EffectProfile

export const WINTER_PALETTE = {
  environment: '#696F73',
  ground: '#7D8386',
  fog: '#A6ACAe',
  frost: '#D4D7D7',
  dust: '#C6CBCB',
} as const

export interface WinterAtmosphere {
  remoteFogDensity: number
  iceDustSpeed: number
  frostOpacity: number
  lightDistance: number
  stillnessInterval: number
  particleCount: number
}

export interface WinterRuntimeFrame {
  atmosphere: WinterAtmosphere
  frostShift: number
  iceDustOffset: number
}

const WINTER_FOG_DENSITY = 0.022
const MOTION_CYCLE_SECONDS = 180
const MOVEMENT_WINDOW_SECONDS = 108
const STILLNESS_INTERVAL = MOTION_CYCLE_SECONDS - MOVEMENT_WINDOW_SECONDS
const MAX_ICE_DUST_SPEED = 0.006
const ICE_DUST_TRAVEL = 8

function normalizeTime(time: number) {
  if (!Number.isFinite(time)) return 0
  return ((time % MOTION_CYCLE_SECONDS) + MOTION_CYCLE_SECONDS) % MOTION_CYCLE_SECONDS
}

export function getWinterAtmosphere(
  progress: number,
  reducedMotion: boolean,
  quality: Exclude<QualityTier, 'static'>,
): WinterAtmosphere {
  const value = Math.min(1, Math.max(0, progress))
  const atmosphereProgress = reducedMotion ? 1 : value
  const particleCount = quality === 'high' ? 1200 : quality === 'balanced' ? 800 : 400

  return {
    remoteFogDensity: WINTER_FOG_DENSITY + atmosphereProgress * 0.012,
    iceDustSpeed: reducedMotion ? 0 : MAX_ICE_DUST_SPEED - atmosphereProgress * 0.0015,
    frostOpacity: 0.09 + atmosphereProgress * 0.16,
    lightDistance: 18 + atmosphereProgress * 5,
    stillnessInterval: STILLNESS_INTERVAL,
    particleCount,
  }
}

export function getWinterIceDustOffset(time: number, iceDustSpeed: number): number {
  const cycleTime = normalizeTime(time)
  const boundedSpeed = Math.min(MAX_ICE_DUST_SPEED, Math.max(0, iceDustSpeed))
  if (cycleTime >= MOVEMENT_WINDOW_SECONDS) return 0

  return Math.sin((cycleTime / MOVEMENT_WINDOW_SECONDS) * Math.PI) * boundedSpeed * ICE_DUST_TRAVEL
}

export function getWinterRuntimeFrame(
  progress: number,
  reducedMotion: boolean,
  quality: Exclude<QualityTier, 'static'>,
  time: number,
): WinterRuntimeFrame {
  const atmosphere = getWinterAtmosphere(progress, reducedMotion, quality)
  const cycleTime = normalizeTime(time)
  const moving = !reducedMotion && cycleTime < MOVEMENT_WINDOW_SECONDS

  return {
    atmosphere,
    iceDustOffset: moving ? getWinterIceDustOffset(cycleTime, atmosphere.iceDustSpeed) : 0,
    frostShift: moving ? Math.sin((cycleTime / MOVEMENT_WINDOW_SECONDS) * Math.PI) * 0.018 : 0,
  }
}

export function installWinterSceneEnvironment(scene: Pick<Scene, 'background' | 'fog'>) {
  const previousBackground = scene.background
  const previousFog = scene.fog
  const winterBackground = new Color(WINTER_PALETTE.environment)
  const winterFog = new FogExp2(WINTER_PALETTE.fog, WINTER_FOG_DENSITY)

  scene.background = winterBackground
  scene.fog = winterFog

  return () => {
    if (scene.background === winterBackground) scene.background = previousBackground
    if (scene.fog === winterFog) scene.fog = previousFog
  }
}
