import { worlds } from '../../domain/worlds'
import { CELESTIAL_COLORS, CORE_POSITION, PORTAL_BODY_POSITIONS } from './universeConfig'

describe('celestial material cues', () => {
  it('derives Summer from the declared Summer accent palette', () => {
    const summer = worlds.find((world) => world.id === 'summer')
    if (!summer) throw new Error('Expected the Summer World definition')

    expect(CELESTIAL_COLORS.summer).toBe(summer.palette.accent)
  })

  it('uses the fixed asymmetric Portal composition', () => {
    expect(CORE_POSITION[0]).toBeGreaterThan(0)
    expect(CORE_POSITION[1]).toBeGreaterThan(0)
    expect(new Set(Object.values(PORTAL_BODY_POSITIONS).map(([x, , z]) => `${x}:${z}`)).size).toBe(5)
    expect(PORTAL_BODY_POSITIONS.studio[2]).toBeLessThan(PORTAL_BODY_POSITIONS.spring[2])
  })
})
