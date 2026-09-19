import type { CelestialDefinition } from '../../domain/types'

export interface OrbitTransform {
  position: [number, number, number]
  rotationY: number
}

export interface SeededStar {
  position: [number, number, number]
  size: number
  luminance: number
  twinklePeriod: number
  twinkleOffset: number
  twinkleAmplitude: number
}

export function getOrbitTransform(
  body: CelestialDefinition,
  elapsedSeconds: number,
  phaseOffset = 0,
): OrbitTransform {
  const theta = body.phase + phaseOffset + (elapsedSeconds / body.orbitPeriodSeconds) * Math.PI * 2
  return {
    position: [
      Math.cos(theta) * body.orbitRadius,
      Math.sin(theta) * body.orbitRadius * body.inclination,
      Math.sin(theta) * body.depth,
    ],
    rotationY: (elapsedSeconds / body.rotationPeriodSeconds) * Math.PI * 2,
  }
}

function xorshift(seed: number) {
  let state = seed || 1
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return ((state >>> 0) % 4_294_967_296) / 4_294_967_296
  }
}

export function createSeededStars(count: number, seed: number): SeededStar[] {
  const random = xorshift(seed)
  return Array.from({ length: count }, () => {
    const x = (random() - 0.5) * 42
    const gaussian = (random() + random() + random() + random() + random() + random()) - 3
    const y = x * 0.42 + gaussian * 1.65
    const z = -9 - random() * 28
    return {
      position: [x, y, z],
      size: 0.45 + random() * 1.2,
      luminance: 0.38 + random() * 0.5,
      twinklePeriod: 8 + random() * 20,
      twinkleOffset: random() * Math.PI * 2,
      twinkleAmplitude: 0.08 + random() * 0.14,
    }
  })
}
