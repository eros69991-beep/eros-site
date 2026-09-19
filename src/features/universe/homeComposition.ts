import type { CelestialId } from '../../domain/types'

export type HomeBodyId = CelestialId | 'core'

export interface HomeBodyLayout {
  position: [number, number, number]
  scale: number
}

export interface HomeCameraPreset {
  fov: number
  position: [number, number, number]
  target: [number, number, number]
}

/**
 * Authored at the handoff's reference moment. The hierarchy is intentional:
 * Winter is the close foreground anchor, while the Core is the smallest and
 * most distant object at the bright end of the galactic diagonal.
 */
export const HOME_BODY_LAYOUT: Record<HomeBodyId, HomeBodyLayout> = {
  winter: { position: [-6.2, -3.1, 2.6], scale: 3.7 },
  spring: { position: [-1.2, 2.25, -0.4], scale: 1.25 },
  summer: { position: [2.2, -2, 0.4], scale: 1.05 },
  autumn: { position: [7.5, 0.7, -1.5], scale: 1.65 },
  studio: { position: [-3.5, 5.8, -4.2], scale: 0.72 },
  core: { position: [4.8, 4.1, -7.5], scale: 0.44 },
}

export const HOME_CAMERA_PRESETS: Record<'desktop' | 'tabletPortrait' | 'mobile', HomeCameraPreset> = {
  desktop: {
    fov: 42,
    position: [0, 0.4, 20],
    target: [0, 0, 0],
  },
  tabletPortrait: {
    fov: 45,
    position: [0, 0.35, 33],
    target: [0, 0, -0.5],
  },
  mobile: {
    fov: 48,
    position: [0, 0.2, 44],
    target: [0, 0, -0.8],
  },
}

export function getHomeCameraPreset(width: number, height: number): HomeCameraPreset {
  if (width >= 900 || width / height >= 1.15) return HOME_CAMERA_PRESETS.desktop
  if (width >= 600) return HOME_CAMERA_PRESETS.tabletPortrait
  return HOME_CAMERA_PRESETS.mobile
}
