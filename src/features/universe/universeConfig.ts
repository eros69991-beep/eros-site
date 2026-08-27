import { worlds } from '../../domain/worlds'
import type { CelestialId } from '../../domain/types'

export const CORE_POSITION: [number, number, number] = [-0.6, 0.05, 0]

export const CELESTIAL_LABELS: Record<CelestialId, string> = {
  spring: 'Spring / Awakening',
  summer: 'Summer / Burn',
  autumn: 'Autumn / Fade',
  winter: 'Winter / Freeze',
  studio: 'Studio',
}

export const CELESTIAL_COLORS: Record<CelestialId, string> = {
  spring: worlds[0]?.palette.accent ?? '#7FA28C',
  summer: '#CFC2A8',
  autumn: worlds[2]?.palette.accent ?? '#7C4937',
  winter: worlds[3]?.palette.accent ?? '#83909A',
  studio: '#111318',
}

export const STAR_FIELD_SHARE = 0.65
