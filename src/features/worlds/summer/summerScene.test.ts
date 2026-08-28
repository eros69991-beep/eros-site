import {
  SUMMER_EFFECTS,
  SUMMER_PALETTE,
  getSummerAirOffset,
  getSummerAtmosphere,
} from './summerAtmosphere'
import { sceneRegistry } from '../sceneRegistry'

function readHexChannels(color: string) {
  const value = color.slice(1)
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ] as const
}

describe('Summer atmosphere', () => {
  it('exposes the scene while reducing the available shadow below the readable-overlay ceiling', () => {
    const concealed = getSummerAtmosphere(0, false, 'high')
    const exposed = getSummerAtmosphere(1, false, 'high')

    expect(exposed.shadowCompression).toBeLessThan(concealed.shadowCompression)
    expect(exposed.exposure).toBeGreaterThan(concealed.exposure)
    expect(exposed.exposure).toBeLessThanOrEqual(1.16)
    expect(concealed.exposure).toBeLessThanOrEqual(1.16)
  })

  it('holds heat distortion and air drift still when motion is reduced', () => {
    const atmosphere = getSummerAtmosphere(0.65, true, 'balanced')

    expect(atmosphere.heatAmplitude).toBe(0)
    expect(atmosphere.airDrift).toBe(0)
  })

  it.each([
    ['high', 0.01, 1800],
    ['balanced', 0.007, 1200],
    ['lite', 0.004, 900],
  ] as const)('keeps the %s heat and particle budget restrained', (quality, heatCeiling, particleCeiling) => {
    const atmosphere = getSummerAtmosphere(0.8, false, quality)

    expect(atmosphere.heatAmplitude).toBeLessThanOrEqual(heatCeiling)
    expect(atmosphere.particleCount).toBeLessThanOrEqual(particleCeiling)
  })

  it('keeps the Summer environment neutral rather than adding an orange or red global tint', () => {
    const [red, green, blue] = readHexChannels(SUMMER_PALETTE.environment)

    expect(Math.max(red, green, blue) - Math.min(red, green, blue)).toBeLessThanOrEqual(12)
    expect(SUMMER_EFFECTS).not.toHaveProperty('globalTint')
  })

  it('recycles air movement within the scene boundary during long sessions', () => {
    const offsets = [0, 36, 1_000_000, 1_000_000_000].map((time) => (
      getSummerAirOffset(time, 0.04)
    ))

    expect(offsets.every(Number.isFinite)).toBe(true)
    expect(offsets.every((offset) => Math.abs(offset) <= 0.04)).toBe(true)
  })

  it('registers Summer as a lazy scene with the approved effects', async () => {
    const descriptor = sceneRegistry.summer

    expect(descriptor?.effects).toEqual(SUMMER_EFFECTS)
    await expect(descriptor?.load()).resolves.toMatchObject({ default: expect.any(Function) })
  })
})
