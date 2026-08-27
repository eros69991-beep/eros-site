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
import { getDesktopParallaxTarget, getMobileObservationAngle } from './universeInteraction'
import { DISPLAY_PHASE_OFFSETS } from './universeConfig'

const CAMERA_FOV = 42
const DESKTOP_CAMERA_DISTANCE = 24
const MOBILE_CAMERA_DISTANCE = 58
const COMPOSITION_FOCUS: [number, number, number] = [-2.5, 0.25, 0]
const MOBILE_COMPOSITION_FOCUS: [number, number, number] = [-2.5, -3, 0]

function OrbitPath({ body, active }: { body: CelestialDefinition; active: boolean }) {
  const points = useMemo(() => Array.from({ length: 74 }, (_, index) => {
    const arcSpan = active ? Math.PI * 1.38 : Math.PI * 0.34
    const theta = body.phase + DISPLAY_PHASE_OFFSETS[body.id] + 0.34 + (index / 73) * arcSpan
    return [
      Math.cos(theta) * body.orbitRadius,
      Math.sin(theta) * body.orbitRadius * body.inclination,
      Math.sin(theta) * body.depth,
    ] as [number, number, number]
  }), [active, body])

  return <Line color="#B7CAD3" lineWidth={1} opacity={active ? 0.18 : 0.025} points={points} transparent />
}

function DampedCamera({ reducedMotion, mobile }: { reducedMotion: boolean; mobile: boolean }) {
  const { camera, gl, pointer, size } = useThree()
  const cameraRef = useRef<Camera | null>(null)
  const mobileDrag = useRef({ active: false, angle: 0, startAngle: 0, startX: 0 })
  useEffect(() => {
    cameraRef.current = camera
  }, [camera])

  useEffect(() => {
    if (!mobile || reducedMotion) return undefined
    const surface = gl.domElement
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return
      mobileDrag.current = {
        active: true,
        angle: mobileDrag.current.angle,
        startAngle: mobileDrag.current.angle,
        startX: event.clientX,
      }
      surface.setPointerCapture?.(event.pointerId)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!mobileDrag.current.active || event.pointerType !== 'touch') return
      mobileDrag.current.angle = getMobileObservationAngle(
        mobileDrag.current.startAngle,
        mobileDrag.current.startX,
        event.clientX,
        size.width,
      )
    }
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === 'touch') mobileDrag.current.active = false
    }

    surface.addEventListener('pointerdown', onPointerDown)
    surface.addEventListener('pointermove', onPointerMove)
    surface.addEventListener('pointerup', onPointerUp)
    surface.addEventListener('pointercancel', onPointerUp)
    return () => {
      surface.removeEventListener('pointerdown', onPointerDown)
      surface.removeEventListener('pointermove', onPointerMove)
      surface.removeEventListener('pointerup', onPointerUp)
      surface.removeEventListener('pointercancel', onPointerUp)
    }
  }, [gl, mobile, reducedMotion, size.width])

  useFrame((_state, delta) => {
    const activeCamera = cameraRef.current
    if (!activeCamera) return
    const desktopTarget = getDesktopParallaxTarget(pointer, size, CAMERA_FOV, DESKTOP_CAMERA_DISTANCE)
    const targetX = mobile
      ? Math.sin(reducedMotion ? 0 : mobileDrag.current.angle) * 2.8
      : desktopTarget.x
    const targetY = mobile ? 0 : desktopTarget.y
    const damping = reducedMotion ? 0 : Math.min(delta * 2.2, 1)
    activeCamera.position.x = MathUtils.lerp(activeCamera.position.x, targetX, damping)
    activeCamera.position.y = MathUtils.lerp(activeCamera.position.y, 0.45 + targetY, damping)
    activeCamera.position.z = mobile ? MOBILE_CAMERA_DISTANCE : DESKTOP_CAMERA_DISTANCE
    activeCamera.lookAt(...(mobile ? MOBILE_COMPOSITION_FOCUS : COMPOSITION_FOCUS))
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
      <pointLight color="#8A989D" distance={8} intensity={1.1} position={[9, 3, 6]} />
      <DampedCamera mobile={mobile} reducedMotion={reducedMotion} />
      <StarField particleCount={budget.maxParticles} reducedMotion={reducedMotion} />
      <ErosCore reducedMotion={reducedMotion} />
      {celestials.map((body) => <OrbitPath active={selected === body.id} body={body} key={`${body.id}-orbit`} />)}
      {celestials.map((body) => <CelestialBody body={body} key={body.id} reducedMotion={reducedMotion} />)}
    </>
  )
}
