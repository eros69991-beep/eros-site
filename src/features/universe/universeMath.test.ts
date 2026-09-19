import { celestials } from '../../domain/worlds'
import { createSeededStars, getOrbitTransform } from './universeMath'

describe('universe motion', () => {
  it('returns the same celestial transform for the same stable time', () => {
    const body = celestials.at(0)
    if (!body) throw new Error('Expected the Spring celestial definition')

    expect(getOrbitTransform(body, 137.5)).toEqual(getOrbitTransform(body, 137.5))
  })

  it('creates deterministic non-synchronized stars', () => {
    const first = createSeededStars(50, 1701)
    const second = createSeededStars(50, 1701)

    expect(first).toEqual(second)
    expect(new Set(first.map((star) => star.twinkleOffset)).size).toBeGreaterThan(40)
  })

  it('concentrates stars into the shared inclined galactic band', () => {
    const stars = createSeededStars(500, 1701)
    const meanBandDistance = stars.reduce(
      (total, star) => total + Math.abs(star.position[1] - star.position[0] * 0.42),
      0,
    ) / stars.length

    expect(meanBandDistance).toBeLessThan(3.6)
  })
})
