import { describe, expect, it } from 'vitest'
import { PORTAL_BODIES, PORTAL_ORDER, getPortalBody, getSwipeDestination } from './portalModel'

describe('portal model', () => {
  it('defines the fixed five-body portal order and maps every body to its real route', () => {
    expect(PORTAL_ORDER).toEqual(['spring', 'summer', 'autumn', 'winter', 'studio'])
    expect(PORTAL_BODIES.studio).toMatchObject({ index: '05', label: 'STUDIO / UNKNOWN', route: '/studio' })
    expect(getPortalBody('winter')).toMatchObject({ index: '04', world: 'winter', route: '/world/winter' })
  })

  it('advances and clamps destinations from a horizontal swipe', () => {
    expect(getSwipeDestination('spring', -220, 390)).toBe('summer')
    expect(getSwipeDestination('studio', -220, 390)).toBe('studio')
    expect(getSwipeDestination('spring', 220, 390)).toBe('spring')
  })
})
