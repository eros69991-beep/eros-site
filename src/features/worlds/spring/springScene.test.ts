import { SPRING_EFFECTS, getSpringAtmosphere } from './springAtmosphere'

describe('Spring atmosphere', () => {
  it('moves from a darker, denser sealed state toward permeability', () => {
    const sealed = getSpringAtmosphere(0, false, 'high')
    const permeable = getSpringAtmosphere(1, false, 'high')

    expect(sealed.fogDensity).toBeGreaterThan(permeable.fogDensity)
    expect(sealed.wetReflection).toBeLessThan(permeable.wetReflection)
    expect(sealed.livingAccent).toBeLessThanOrEqual(0.1)
    expect(permeable.livingAccent).toBeLessThanOrEqual(0.1)
  })

  it('holds a stable composition without continuous drift when motion is reduced', () => {
    const early = getSpringAtmosphere(0, true, 'balanced')
    const late = getSpringAtmosphere(1, true, 'balanced')

    expect(early.verticalDrift).toBe(0)
    expect(late.verticalDrift).toBe(0)
    expect(early.fogDensity).toBe(late.fogDensity)
  })

  it.each([
    ['high', 4000],
    ['balanced', 2200],
    ['lite', 1200],
  ] as const)('respects the %s particle ceiling', (quality, ceiling) => {
    expect(getSpringAtmosphere(0.5, false, quality).particleCount).toBe(ceiling)
  })

  it('keeps Spring postprocessing restrained and quality-gates depth of field', () => {
    expect(SPRING_EFFECTS).toMatchObject({
      bloomIntensity: expect.any(Number),
      noiseOpacity: expect.any(Number),
      vignetteOffset: expect.any(Number),
      vignetteDarkness: expect.any(Number),
      depthOfField: true,
    })
    expect(SPRING_EFFECTS.bloomIntensity).toBeLessThanOrEqual(0.3)
    expect(SPRING_EFFECTS.noiseOpacity).toBeLessThanOrEqual(0.02)
  })
})
