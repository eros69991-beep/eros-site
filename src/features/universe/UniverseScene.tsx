import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, type Camera } from 'three'
import { useEffect, useRef } from 'react'
import { celestials } from '../../domain/worlds'
import type { CelestialDefinition } from '../../domain/types'
import { getEffectiveSceneBudget } from '../../scene/quality'
import { ErosCore } from './ErosCore'
import { CelestialBody } from './CelestialBody'
import { StarField } from './StarField'
import { GalacticVeil } from './GalacticVeil'
import { getDesktopParallaxTarget, getMobileObservationAngle } from './universeInteraction'
import { PORTAL_BODY_POSITIONS } from './universeConfig'
import { registerUniverseCameraAlignment } from './universeCameraAlignment'

const CAMERA_FOV = 42
const DESKTOP_CAMERA_DISTANCE = 24
const MOBILE_CAMERA_DISTANCE = 26
const COMPOSITION_FOCUS: [number, number, number] = [-1.7, 0.1, 0]
const MOBILE_COMPOSITION_FOCUS: [number, number, number] = [0, -0.8, 0]

function DampedCamera({ reducedMotion, mobile }: { reducedMotion: boolean; mobile: boolean }) {
  const { camera, gl, pointer, size } = useThree()
  const cameraRef = useRef<Camera | null>(null)
  const mobileDrag = useRef({ active: false, angle: 0, startAngle: 0, startX: 0 })
  const entryAlignment = useRef<{
    body: CelestialDefinition
    resolve(): void
  } | null>(null)
  useEffect(() => {
    cameraRef.current = camera
  }, [camera])

  useEffect(() => registerUniverseCameraAlignment((world) => {
    const body = celestials.find((candidate) => candidate.id === world)
    if (!body || reducedMotion) return Promise.resolve()

    entryAlignment.current?.resolve()
    return new Promise<void>((resolve) => {
      entryAlignment.current = { body, resolve }
    })
  }), [reducedMotion])

  useEffect(() => () => {
    entryAlignment.current?.resolve()
    entryAlignment.current = null
  }, [])

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
    const alignment = entryAlignment.current
    if (alignment) {
      const [targetX, targetY, targetZ] = PORTAL_BODY_POSITIONS[alignment.body.id]
      const damping = Math.min(delta * 3.4, 1)
      activeCamera.position.x = MathUtils.lerp(activeCamera.position.x, targetX * 0.48, damping)
      activeCamera.position.y = MathUtils.lerp(activeCamera.position.y, targetY * 0.48, damping)
      activeCamera.position.z = MathUtils.lerp(activeCamera.position.z, Math.max(14, 20 + targetZ * 0.25), damping)
      activeCamera.lookAt(targetX, targetY, targetZ)

      if (
        Math.abs(activeCamera.position.x - targetX * 0.48) < 0.08
        && Math.abs(activeCamera.position.y - targetY * 0.48) < 0.08
      ) {
        alignment.resolve()
        entryAlignment.current = null
      }
      return
    }
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
  const budget = getEffectiveSceneBudget(quality, mobile)

  return (
    <>
      <color attach="background" args={['#020405']} />
      <ambientLight color="#A7BAC0" intensity={0.42} />
      <directionalLight color="#D6E0E0" intensity={1.08} position={[-8, 6, 9]} />
      <pointLight color="#66888E" intensity={1.15} position={[-3, 1, 4]} />
      <pointLight color="#AFC2C5" distance={16} intensity={2.2} position={[9, 3, 6]} />
      <DampedCamera mobile={mobile} reducedMotion={reducedMotion} />
      <GalacticVeil reducedMotion={reducedMotion} />
      <StarField particleCount={budget.maxParticles} reducedMotion={reducedMotion} />
      <ErosCore mobile={mobile} quality={quality} reducedMotion={reducedMotion} />
      {celestials.map((body) => (
        <CelestialBody
          body={body}
          key={body.id}
          mobile={mobile}
          quality={quality}
          reducedMotion={reducedMotion}
        />
      ))}
    </>
  )
}
