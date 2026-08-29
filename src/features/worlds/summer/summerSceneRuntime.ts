import { Color, FogExp2, type Scene } from 'three'
import type { QualityTier } from '../../../domain/types'
import {
  SUMMER_PALETTE,
  type SummerAtmosphere,
  getSummerAirOffset,
  getSummerAtmosphere,
} from './summerAtmosphere'

const SUMMER_FOG_DENSITY = 0.026
const SUMMER_SHADOW_OPACITY = 0.13

export interface SummerRuntimeFrame {
  atmosphere: SummerAtmosphere
  particleOffset: number
  heatTime: number
  shadowOpacity: number
}

export function getSummerRuntimeFrame(
  progress: number,
  reducedMotion: boolean,
  quality: Exclude<QualityTier, 'static'>,
  time: number,
): SummerRuntimeFrame {
  const atmosphere = getSummerAtmosphere(progress, reducedMotion, quality)
  const stableTime = Number.isFinite(time) ? ((time % 96) + 96) % 96 : 0

  return {
    atmosphere,
    particleOffset: getSummerAirOffset(stableTime, atmosphere.airDrift),
    heatTime: reducedMotion ? 0 : stableTime,
    shadowOpacity: atmosphere.shadowCompression * SUMMER_SHADOW_OPACITY,
  }
}

export function getSummerBoundaryChromaticStrength(
  quality: Exclude<QualityTier, 'static'>,
  reducedMotion: boolean,
): number {
  if (reducedMotion || quality === 'lite') return 0
  return quality === 'high' ? 0.0007 : 0.0005
}

export function createSummerExposureController(renderer: { toneMappingExposure: number }) {
  const initialExposure = renderer.toneMappingExposure
  let appliedExposure: number | null = null

  return {
    apply(atmosphere: SummerAtmosphere) {
      renderer.toneMappingExposure = atmosphere.exposure
      appliedExposure = atmosphere.exposure
    },
    restore() {
      if (renderer.toneMappingExposure === appliedExposure) {
        renderer.toneMappingExposure = initialExposure
      }
    },
  }
}

export function installSummerSceneEnvironment(scene: Pick<Scene, 'background' | 'fog'>) {
  const previousBackground = scene.background
  const previousFog = scene.fog
  const summerBackground = new Color(SUMMER_PALETTE.environment)
  const summerFog = new FogExp2(SUMMER_PALETTE.environment, SUMMER_FOG_DENSITY)

  scene.background = summerBackground
  scene.fog = summerFog

  return () => {
    if (scene.background === summerBackground) scene.background = previousBackground
    if (scene.fog === summerFog) scene.fog = previousFog
  }
}
