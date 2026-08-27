import { worlds } from '../../domain/worlds'
import { CELESTIAL_COLORS } from './universeConfig'

describe('celestial material cues', () => {
  it('derives Summer from the declared Summer accent palette', () => {
    const summer = worlds.find((world) => world.id === 'summer')
    if (!summer) throw new Error('Expected the Summer World definition')

    expect(CELESTIAL_COLORS.summer).toBe(summer.palette.accent)
  })
})
