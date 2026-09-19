import type { CelestialId } from '../../domain/types'
import { HOME_BODY_LAYOUT } from './homeComposition'
import type { OrbitSpec } from './homeOrbitMath'

const PERIODS: Record<CelestialId, number> = {
  spring: 360,
  summer: 450,
  autumn: 540,
  winter: 660,
  studio: 720,
}

function createOrbitFromApprovedPosition(id: CelestialId): OrbitSpec {
  const initial = HOME_BODY_LAYOUT[id].position
  const core = HOME_BODY_LAYOUT.core.position
  const x = initial[0] - core[0]
  const y = initial[1] - core[1]
  const z = initial[2] - core[2]
  const radius = Math.hypot(x, y, z)
  const horizontal = Math.hypot(x, z)

  if (Math.abs(y) < 1e-9) {
    return {
      radius,
      periodSeconds: PERIODS[id],
      phaseRadians: 0,
      inclinationRadians: 0,
      nodeRadians: Math.atan2(-z / radius, x / radius),
    }
  }

  const phaseRadians = y < 0 ? Math.PI / 2 : -Math.PI / 2
  const phaseSign = Math.sign(Math.sin(phaseRadians))
  return {
    radius,
    periodSeconds: PERIODS[id],
    phaseRadians,
    inclinationRadians: Math.asin(Math.abs(y) / radius),
    nodeRadians: Math.atan2(x / (phaseSign * horizontal), z / (phaseSign * horizontal)),
  }
}

export const HOME_ORBIT_SPECS: Record<CelestialId, OrbitSpec> = {
  spring: createOrbitFromApprovedPosition('spring'),
  summer: createOrbitFromApprovedPosition('summer'),
  autumn: createOrbitFromApprovedPosition('autumn'),
  winter: createOrbitFromApprovedPosition('winter'),
  studio: createOrbitFromApprovedPosition('studio'),
}
