import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerspectiveCamera as DreiPerspectiveCamera } from '@react-three/drei'
import { MathUtils, PerspectiveCamera as ThreePerspectiveCamera, type Camera } from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { celestials } from '../../domain/worlds'
import { getEffectiveSceneBudget } from '../../scene/quality'
import { ErosCore } from './ErosCore'
import { CelestialBody } from './CelestialBody'
import { StarField } from './StarField'
import { GalacticVeil } from './GalacticVeil'
import { GalaxyBackdrop } from './GalaxyBackdrop'
import { HomeOrbitClockDriver } from './HomeOrbitClockDriver'
import { HomeOrbitTraces } from './HomeOrbitTraces'
import { registerUniverseCameraAlignment } from './universeCameraAlignment'
import { getHomeCameraPreset, HOME_BODY_LAYOUT } from './homeComposition'
import { homeOrbitClock } from './homeOrbitClock'
import { HOME_ORBIT_SPECS } from './homeOrbitConfig'
import { writeOrbitPosition } from './homeOrbitMath'

function HomeCamera() {
  const size = useThree((state) => state.size)
  const preset = getHomeCameraPreset(size.width, size.height)
  const rotation = useMemo(() => {
    const cameraObject = new ThreePerspectiveCamera()
    cameraObject.position.set(...preset.position)
    cameraObject.lookAt(...preset.target)
    return [cameraObject.rotation.x, cameraObject.rotation.y, cameraObject.rotation.z] as const
  }, [preset])

  return (
    <DreiPerspectiveCamera
      far={100}
      fov={preset.fov}
      makeDefault
      near={0.1}
      position={preset.position}
      rotation={rotation}
    />
  )
}

function DampedCamera({ reducedMotion }: { reducedMotion: boolean }) {
  const camera = useThree((state) => state.camera)
  const cameraRef = useRef<Camera | null>(null)
  const entryAlignment = useRef<{
    target: [number, number, number]
    resolve(): void
  } | null>(null)
  useEffect(() => {
    cameraRef.current = camera
  }, [camera])

  useEffect(() => registerUniverseCameraAlignment((world) => {
    if (reducedMotion) return Promise.resolve()

    const relative = { x: 0, y: 0, z: 0 }
    writeOrbitPosition(relative, HOME_ORBIT_SPECS[world], homeOrbitClock.getElapsed())
    const core = HOME_BODY_LAYOUT.core.position
    const target: [number, number, number] = [
      relative.x + core[0],
      relative.y + core[1],
      relative.z + core[2],
    ]

    entryAlignment.current?.resolve()
    return new Promise<void>((resolve) => {
      entryAlignment.current = { target, resolve }
    })
  }), [reducedMotion])

  useEffect(() => () => {
    entryAlignment.current?.resolve()
    entryAlignment.current = null
  }, [])

  useFrame((_state, delta) => {
    const activeCamera = cameraRef.current
    if (!activeCamera) return
    const alignment = entryAlignment.current
    if (alignment) {
      const [targetX, targetY, targetZ] = alignment.target
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
      {/* 主光来自右上方银河亮端（Core 的方向），星球左侧留出明暗交界；冷色背光勾边。 */}
      <ambientLight color="#5F6E73" intensity={0.05} />
      <directionalLight color="#F4EEE2" intensity={3.4} position={[12, 6, -2]} />
      <directionalLight color="#8FA9B4" intensity={0.22} position={[-10, -3, 8]} />
      <directionalLight color="#A9C6D2" intensity={0.5} position={[-4, 3, -14]} />
      <Environment background={false} frames={1} resolution={quality === 'high' ? 256 : 128}>
        <Lightformer color="#F1ECE2" form="rect" intensity={1.7} position={[6, 3, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[5, 6, 1]} />
        <Lightformer color="#7F98A2" form="rect" intensity={0.15} position={[-6, -1, 2]} rotation={[0, Math.PI / 2, 0]} scale={[4, 6, 1]} />
        <Lightformer color="#B9D2DC" form="ring" intensity={1.1} position={[-2, 3, -6]} scale={3} />
      </Environment>
      <HomeCamera />
      <HomeOrbitClockDriver reducedMotion={reducedMotion} />
      <DampedCamera reducedMotion={reducedMotion} />
      <GalaxyBackdrop />
      <GalacticVeil reducedMotion={reducedMotion} />
      <StarField particleCount={budget.maxParticles} reducedMotion={reducedMotion} />
      <HomeOrbitTraces />
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
