import { worlds } from '../../domain/worlds'
import type { CelestialId } from '../../domain/types'

export const CORE_POSITION: [number, number, number] = [5.6, 1.45, -1.8]

export const PORTAL_BODY_POSITIONS = {
  spring: [-4.8, 1.1, 1.2],
  summer: [-1.8, 3.35, -1.5],
  autumn: [-5.9, -2.1, -2.8],
  winter: [1.6, -2.9, -4.4],
  studio: [-0.35, -4.2, -6.4],
} as const satisfies Record<CelestialId, readonly [number, number, number]>

export const CELESTIAL_LABELS: Record<CelestialId, string> = {
  spring: 'Spring / Awakening',
  summer: 'Summer / Burn',
  autumn: 'Autumn / Fade',
  winter: 'Winter / Freeze',
  studio: 'Studio',
}

export const CELESTIAL_COLORS: Record<CelestialId, string> = {
  spring: worlds[0]?.palette.accent ?? '#7FA28C',
  summer: worlds[1]?.palette.accent ?? '#E9DBBF',
  autumn: worlds[2]?.palette.accent ?? '#7C4937',
  winter: worlds[3]?.palette.accent ?? '#83909A',
  studio: '#111318',
}

export const STAR_FIELD_SHARE = 0.65
