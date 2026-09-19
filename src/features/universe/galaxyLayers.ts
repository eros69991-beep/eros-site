export type GalaxyLayerId = 'far' | 'middle' | 'near'

export const GALAXY_BACKDROP_URL = '/assets/homepage/galaxy-inside-v1.png'

export interface GalaxyLayer {
  id: GalaxyLayerId
  position: [number, number, number]
  width: number
  height: number
  rotation: number
  opacity: number
  warmth: number
  drift: number
}

export const GALAXY_LAYERS: readonly GalaxyLayer[] = [
  {
    id: 'far',
    position: [0, 0.4, -22],
    width: 58,
    height: 16,
    rotation: 0.42,
    opacity: 0.055,
    warmth: 0.18,
    drift: 0.000035,
  },
  {
    id: 'middle',
    position: [-0.5, -0.15, -11],
    width: 48,
    height: 9,
    rotation: 0.41,
    opacity: 0.085,
    warmth: 0.08,
    drift: -0.000055,
  },
  {
    id: 'near',
    position: [5, -8.2, 4],
    width: 38,
    height: 5.5,
    rotation: 0.37,
    opacity: 0.065,
    warmth: 0.34,
    drift: 0.000025,
  },
] as const

const LAYER_SEEDS: Record<GalaxyLayerId, number> = {
  far: 17.01,
  middle: 90.17,
  near: 201.33,
}

export function getGalaxyLayerSeed(id: GalaxyLayerId): number {
  return LAYER_SEEDS[id]
}
