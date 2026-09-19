import type { CelestialId } from '../../domain/types'
import { PORTAL_BODY_POSITIONS } from './universeConfig'

export interface PortalOrbit {
  periodSeconds: number
  phase: number
  radius: number
  depth: number
}

export const PORTAL_ORBITS = {
  spring: { periodSeconds: 210, phase: 3.12, radius: 1.45, depth: 0.7 },
  summer: { periodSeconds: 240, phase: 2.42, radius: 1.2, depth: 0.9 },
  autumn: { periodSeconds: 280, phase: 3.78, radius: 1.65, depth: 1.2 },
  winter: { periodSeconds: 320, phase: 5.0, radius: 1.35, depth: 1.35 },
  studio: { periodSeconds: 360, phase: 5.72, radius: 1.1, depth: 1.5 },
} as const satisfies Record<CelestialId, PortalOrbit>

export const MOBILE_BODY_POSITIONS = {
  spring: [-0.1, -3.25, 1.0],
  summer: [-1.65, 0.65, -1.8],
  autumn: [1.0, -1.55, -3.2],
  winter: [-1.15, 2.15, -4.8],
  studio: [0.95, -4.75, -6.4],
} as const satisfies Record<CelestialId, readonly [number, number, number]>

export interface PortalTransformOptions {
  mobile: boolean
  reducedMotion: boolean
  selected: boolean
}

export interface PortalBodyTransform {
  position: [number, number, number]
  rotationY: number
}

export function getPortalBodyTransform(
  id: CelestialId,
  elapsedSeconds: number,
  options: PortalTransformOptions,
): PortalBodyTransform {
  const base = options.mobile ? MOBILE_BODY_POSITIONS[id] : PORTAL_BODY_POSITIONS[id]
  const orbit = PORTAL_ORBITS[id]
  const staticPosition: [number, number, number] = options.mobile && options.selected
    ? [0, -3.15, 1.25]
    : [...base]

  if (options.reducedMotion || options.selected) {
    return { position: staticPosition, rotationY: 0 }
  }

  const theta = orbit.phase + (elapsedSeconds / orbit.periodSeconds) * Math.PI * 2
  const phaseCos = Math.cos(orbit.phase)
  const phaseSin = Math.sin(orbit.phase)
  const xDrift = (Math.cos(theta) - phaseCos) * orbit.radius
  const planeDrift = (Math.sin(theta) - phaseSin) * orbit.radius

  return {
    position: [
      base[0] + xDrift,
      base[1] - xDrift * 0.42 + planeDrift * 0.3,
      base[2] + planeDrift * orbit.depth,
    ],
    rotationY: (elapsedSeconds / (orbit.periodSeconds * 0.42)) * Math.PI * 2,
  }
}
