import { Color, FogExp2, type Scene } from 'three'
import type { QualityTier } from '../../../domain/types'
import {
  AUTUMN_PALETTE,
  type AutumnAtmosphere,
  getAutumnAtmosphere,
  getAutumnDustOffset,
} from './autumnAtmosphere'

const AUTUMN_FOG_DENSITY = 0.032
const EROSION_CYCLE_SECONDS = 180

export interface AutumnRuntimeFrame {
  atmosphere: AutumnAtmosphere
  dustOffset: number
  erosionPhase: number
}

export function getAutumnRuntimeFrame(
  progress: number,
  reducedMotion: boolean,
  quality: Exclude<QualityTier, 'static'>,
  time: number,
): AutumnRuntimeFrame {
  const atmosphere = getAutumnAtmosphere(progress, reducedMotion, quality)
  const stableTime = Number.isFinite(time)
    ? ((time % EROSION_CYCLE_SECONDS) + EROSION_CYCLE_SECONDS) % EROSION_CYCLE_SECONDS
    : 0

  return {
    atmosphere,
    dustOffset: reducedMotion ? 0 : getAutumnDustOffset(time, atmosphere.dustSpeed),
    erosionPhase: reducedMotion
      ? 0.5
      : 0.5 + Math.sin((stableTime / EROSION_CYCLE_SECONDS) * Math.PI * 2) * 0.5,
  }
}

export function installAutumnSceneEnvironment(scene: Pick<Scene, 'background' | 'fog'>) {
  const previousBackground = scene.background
  const previousFog = scene.fog
  const autumnBackground = new Color(AUTUMN_PALETTE.environment)
  const autumnFog = new FogExp2(AUTUMN_PALETTE.environment, AUTUMN_FOG_DENSITY)

  scene.background = autumnBackground
  scene.fog = autumnFog

  return () => {
    if (scene.background === autumnBackground) scene.background = previousBackground
    if (scene.fog === autumnFog) scene.fog = previousFog
  }
}
