export type OrbitSpec = Readonly<{
  radius: number
  periodSeconds: number
  phaseRadians: number
  inclinationRadians: number
  nodeRadians: number
}>

export type MutableVec3 = { x: number; y: number; z: number }

export function validateOrbit(spec: OrbitSpec): void {
  const values = [
    spec.radius,
    spec.periodSeconds,
    spec.phaseRadians,
    spec.inclinationRadians,
    spec.nodeRadians,
  ]
  if (!values.every(Number.isFinite) || spec.radius <= 0 || spec.periodSeconds <= 0) {
    throw new Error('Invalid homepage orbit configuration')
  }
}

export function writeOrbitPosition(
  out: MutableVec3,
  spec: OrbitSpec,
  elapsedSeconds: number,
): void {
  const phase = spec.phaseRadians
    + ((elapsedSeconds % spec.periodSeconds) / spec.periodSeconds) * Math.PI * 2
  const x = spec.radius * Math.cos(phase)
  const z = spec.radius * Math.sin(phase)
  const tiltedY = -z * Math.sin(spec.inclinationRadians)
  const tiltedZ = z * Math.cos(spec.inclinationRadians)
  const c = Math.cos(spec.nodeRadians)
  const s = Math.sin(spec.nodeRadians)
  out.x = c * x + s * tiltedZ
  out.y = tiltedY
  out.z = -s * x + c * tiltedZ
}
