import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, type Camera, type PerspectiveCamera } from 'three'
import { useEffect, useRef } from 'react'
import { celestials } from '../../domain/worlds'
import type { CelestialDefinition } from '../../domain/types'
import { getEffectiveSceneBudget } from '../../scene/quality'
import { ErosCore } from './ErosCore'
import { CelestialBody } from './CelestialBody'
import { StarField } from './StarField'
import { GalacticVeil } from './GalacticVeil'
import { registerUniverseCameraAlignment } from './universeCameraAlignment'
import { getHomeCameraPreset, HOME_BODY_LAYOUT } from './homeComposition'

function DampedCamera({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera, size } = useThree()
  const cameraRef = useRef<Camera | null>(null)
  const entryAlignment = useRef<{
    body: CelestialDefinition
    resolve(): void
  } | null>(null)
  useEffect(() => {
    cameraRef.current = camera
  }, [camera])

  useEffect(() => {
    const preset = getHomeCameraPreset(size.width, size.height)
    const perspectiveCamera = camera as PerspectiveCamera
    perspectiveCamera.fov = preset.fov
    perspectiveCamera.position.set(...preset.position)
    perspectiveCamera.lookAt(...preset.target)
    perspectiveCamera.updateProjectionMatrix()
  }, [camera, size.height, size.width])

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

  useFrame((_state, delta) => {
    const activeCamera = cameraRef.current
    if (!activeCamera) return
    const alignment = entryAlignment.current
    if (alignment) {
      const [targetX, targetY, targetZ] = HOME_BODY_LAYOUT[alignment.body.id].position
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
      <ambientLight color="#A7BAC0" intensity={0.42} />
      <directionalLight color="#D6E0E0" intensity={1.08} position={[-8, 6, 9]} />
      <pointLight color="#66888E" intensity={1.15} position={[-3, 1, 4]} />
      <pointLight color="#AFC2C5" distance={16} intensity={2.2} position={[9, 3, 6]} />
      <DampedCamera reducedMotion={reducedMotion} />
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
