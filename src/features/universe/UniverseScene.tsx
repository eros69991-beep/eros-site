import { Line } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, type Camera } from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { celestials } from '../../domain/worlds'
import type { CelestialDefinition } from '../../domain/types'
import { useSiteStore } from '../../state/siteStore'
import { getEffectiveSceneBudget } from '../../scene/quality'
import { ErosCore } from './ErosCore'
import { CelestialBody } from './CelestialBody'
import { StarField } from './StarField'

function OrbitPath({ body, active }: { body: CelestialDefinition; active: boolean }) {
  const points = useMemo(() => Array.from({ length: 74 }, (_, index) => {
    const arcSpan = active ? Math.PI * 1.38 : Math.PI * 0.34
    const theta = body.phase + 0.34 + (index / 73) * arcSpan
    return [
      Math.cos(theta) * body.orbitRadius,
      Math.sin(theta) * body.orbitRadius * body.inclination,
      Math.sin(theta) * body.depth,
    ] as [number, number, number]
  }), [active, body])

  return <Line color="#B7CAD3" lineWidth={1} opacity={active ? 0.18 : 0.025} points={points} transparent />
}

function DampedCamera({ reducedMotion, mobile }: { reducedMotion: boolean; mobile: boolean }) {
  const { camera, pointer } = useThree()
  const cameraRef = useRef<Camera | null>(null)
  useEffect(() => {
    cameraRef.current = camera
  }, [camera])

  useFrame((_state, delta) => {
    const activeCamera = cameraRef.current
    if (!activeCamera) return
    const targetX = MathUtils.clamp(pointer.x * (mobile ? 0.35 : 0.62), -0.62, 0.62)
    const targetY = MathUtils.clamp(pointer.y * (mobile ? 0.18 : 0.35), -0.35, 0.35)
    const damping = reducedMotion ? 0 : Math.min(delta * 2.2, 1)
    activeCamera.position.x = MathUtils.lerp(activeCamera.position.x, targetX, damping)
    activeCamera.position.y = MathUtils.lerp(activeCamera.position.y, 0.45 + targetY, damping)
    activeCamera.position.z = mobile ? 50 : 24
    activeCamera.lookAt(-0.6, 0.05, 0)
  })
  return null
}

export function UniverseScene({
  quality,
  mobile,
  reducedMotion,
}: {
  quality: 'high' | 'balanced' | 'lite'
  mobile: boolean
  reducedMotion: boolean
}) {
  const selected = useSiteStore((state) => state.selectedCelestial)
  const budget = getEffectiveSceneBudget(quality, mobile)

  return (
    <>
      <color attach="background" args={['#020405']} />
      <ambientLight color="#A7BAC0" intensity={0.18} />
      <directionalLight color="#C7D8DB" intensity={0.64} position={[-8, 6, 9]} />
      <pointLight color="#66888E" intensity={0.72} position={[-3, 1, 4]} />
      <pointLight color="#8A989D" distance={7} intensity={1.1} position={[7, -4, 5]} />
      <DampedCamera mobile={mobile} reducedMotion={reducedMotion} />
      <StarField particleCount={budget.maxParticles} reducedMotion={reducedMotion} />
      <ErosCore reducedMotion={reducedMotion} />
      {celestials.map((body) => <OrbitPath active={selected === body.id} body={body} key={`${body.id}-orbit`} />)}
      {celestials.map((body) => <CelestialBody body={body} key={body.id} reducedMotion={reducedMotion} />)}
    </>
  )
}
