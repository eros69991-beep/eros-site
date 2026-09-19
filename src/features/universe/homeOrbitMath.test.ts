import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import { HOME_BODY_LAYOUT } from './homeComposition'
import { HOME_ORBIT_SPECS } from './homeOrbitConfig'
import { validateOrbit, writeOrbitPosition } from './homeOrbitMath'

describe('homepage analytical orbits', () => {
  it.each(Object.entries(HOME_ORBIT_SPECS))('%s starts at the approved fixed-time composition', (id, spec) => {
    const out = new Vector3()
    writeOrbitPosition(out, spec, 0)
    out.add(new Vector3(...HOME_BODY_LAYOUT.core.position))

    expect(out.toArray()).toEqual(expect.arrayContaining(
      HOME_BODY_LAYOUT[id as keyof typeof HOME_ORBIT_SPECS].position.map((value) => expect.closeTo(value, 6)),
    ))
  })

  it.each(Object.entries(HOME_ORBIT_SPECS))('%s closes the orbit without a jump', (_id, spec) => {
    const start = new Vector3()
    const end = new Vector3()
    writeOrbitPosition(start, spec, 0)
    writeOrbitPosition(end, spec, spec.periodSeconds)

    expect(start.distanceTo(end)).toBeLessThan(1e-6)
  })

  it.each(Object.entries(HOME_ORBIT_SPECS))('%s stays at a constant radius', (_id, spec) => {
    for (const time of [0, 17, spec.periodSeconds * 0.37, spec.periodSeconds * 0.91]) {
      const out = new Vector3()
      writeOrbitPosition(out, spec, time)
      expect(out.length()).toBeCloseTo(spec.radius, 6)
    }
  })

  it.each([
    { radius: 0, periodSeconds: 10, phaseRadians: 0, inclinationRadians: 0, nodeRadians: 0 },
    { radius: 2, periodSeconds: -1, phaseRadians: 0, inclinationRadians: 0, nodeRadians: 0 },
    { radius: 2, periodSeconds: 10, phaseRadians: Number.NaN, inclinationRadians: 0, nodeRadians: 0 },
  ])('rejects invalid orbit configuration', (spec) => {
    expect(() => validateOrbit(spec)).toThrow('Invalid homepage orbit configuration')
  })
})
