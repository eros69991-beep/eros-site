import type { CelestialId, WorldId } from '../../domain/types'

export const PORTAL_ORDER = ['spring', 'summer', 'autumn', 'winter', 'studio'] as const
export const PORTAL_SETTLE_MS = 1_050

export const PORTAL_BODIES = {
  spring: { index: '01', label: 'SPRING / AWAKENING', world: 'spring', route: '/world/spring', material: 'crystal' },
  summer: { index: '02', label: 'SUMMER / BURN', world: 'summer', route: '/world/summer', material: 'burned-metal' },
  autumn: { index: '03', label: 'AUTUMN / FADE', world: 'autumn', route: '/world/autumn', material: 'oxidized-mineral' },
  winter: { index: '04', label: 'WINTER / FREEZE', world: 'winter', route: '/world/winter', material: 'milky-ice' },
  studio: { index: '05', label: 'STUDIO / UNKNOWN', world: null, route: '/studio', material: 'absorbing-matter' },
} as const satisfies Record<CelestialId, {
  index: string
  label: string
  world: WorldId | null
  route: `/world/${WorldId}` | '/studio'
  material: string
}>

export function getPortalBody(id: CelestialId) {
  return PORTAL_BODIES[id]
}

export function getSwipeDestination(current: CelestialId, deltaX: number, viewportWidth: number): CelestialId {
  const index = PORTAL_ORDER.indexOf(current)
  const threshold = Math.max(viewportWidth * 0.16, 48)
  const next = deltaX <= -threshold ? index + 1 : deltaX >= threshold ? index - 1 : index
  return PORTAL_ORDER[Math.max(0, Math.min(PORTAL_ORDER.length - 1, next))]!
}
