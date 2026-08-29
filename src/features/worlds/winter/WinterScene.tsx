import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  type Group,
  type MeshBasicMaterial,
  type PointLight,
} from 'three'
import type { WorldSceneProps } from '../../../scene/contracts'
import { getSceneTime } from '../../../scene/sceneClock'
import {
  WINTER_PALETTE,
  type WinterSceneEnvironment,
  getWinterAtmosphere,
  getWinterRuntimeFrame,
  installWinterSceneEnvironment,
} from './winterAtmosphere'

function createIceDustGeometry(count: number) {
  const positions = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3
    positions[offset] = ((index * 59) % 1000) / 1000 * 34 - 17
    positions[offset + 1] = ((index * 43) % 1000) / 1000 * 10 - 4.8
    positions[offset + 2] = -3.8 + ((index * 31) % 1000) / 1000 * 6.4
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  return geometry
}

function WinterEnvironmentOwner({ progress, quality, reducedMotion }: {
  progress: WorldSceneProps['progress']
  quality: WorldSceneProps['quality']
  reducedMotion: boolean
}) {
  const { scene } = useThree()
  const environmentRef = useRef<WinterSceneEnvironment>(null)

  useEffect(() => {
    const environment = installWinterSceneEnvironment(scene)
    environmentRef.current = environment
    return () => {
      environment.restore()
      if (environmentRef.current === environment) environmentRef.current = null
    }
  }, [scene])

  useFrame(() => {
    const frame = getWinterRuntimeFrame(progress.current, reducedMotion, quality, getSceneTime())
    environmentRef.current?.applyFogDensity(frame.atmosphere.remoteFogDensity)
  })

  return null
}

function DistantColdLight({ progress, quality, reducedMotion }: {
  progress: WorldSceneProps['progress']
  quality: WorldSceneProps['quality']
  reducedMotion: boolean
}) {
  const lightRef = useRef<PointLight>(null)

  useFrame(() => {
    const light = lightRef.current
    if (!light) return

    const { atmosphere } = getWinterRuntimeFrame(
      progress.current,
      reducedMotion,
      quality,
      getSceneTime(),
    )
    light.distance = atmosphere.lightDistance
  })

  return <pointLight ref={lightRef} color="#D4D7D7" distance={20} intensity={0.72} position={[-6, 4.2, 4]} />
}

function IceDust({ particleCount, progress, quality, reducedMotion }: {
  particleCount: number
  progress: WorldSceneProps['progress']
  quality: WorldSceneProps['quality']
  reducedMotion: boolean
}) {
  const groupRef = useRef<Group>(null)
  const geometry = useMemo(() => createIceDustGeometry(particleCount), [particleCount])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    const frame = getWinterRuntimeFrame(progress.current, reducedMotion, quality, getSceneTime())
    group.position.x = frame.iceDustOffset
  })

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <pointsMaterial
          color={WINTER_PALETTE.dust}
          depthWrite={false}
          opacity={0.12}
          size={0.012}
          sizeAttenuation
          transparent
        />
      </points>
    </group>
  )
}

function FrostBoundary({ progress, quality, reducedMotion }: {
  progress: WorldSceneProps['progress']
  quality: WorldSceneProps['quality']
  reducedMotion: boolean
}) {
  const leftMaterialRef = useRef<MeshBasicMaterial>(null)
  const rightMaterialRef = useRef<MeshBasicMaterial>(null)
  const boundaryRef = useRef<Group>(null)

  useFrame(() => {
    const leftMaterial = leftMaterialRef.current
    const rightMaterial = rightMaterialRef.current
    const boundary = boundaryRef.current
    if (!leftMaterial || !rightMaterial || !boundary) return

    const frame = getWinterRuntimeFrame(progress.current, reducedMotion, quality, getSceneTime())
    leftMaterial.opacity = frame.atmosphere.frostOpacity * 0.36
    rightMaterial.opacity = frame.atmosphere.frostOpacity * 0.2
    boundary.position.x = frame.frostShift
  })

  return (
    <group ref={boundaryRef}>
      <mesh position={[-8.2, -0.8, -1.4]} rotation={[0, 0, -0.045]}>
        <planeGeometry args={[3.2, 12]} />
        <meshBasicMaterial
          ref={leftMaterialRef}
          color={WINTER_PALETTE.frost}
          depthWrite={false}
          opacity={0.05}
          transparent
        />
      </mesh>
      <mesh position={[7.7, 1.5, -2.2]} rotation={[0, 0, 0.035]}>
        <planeGeometry args={[1.4, 8.5]} />
        <meshBasicMaterial
          ref={rightMaterialRef}
          color={WINTER_PALETTE.frost}
          depthWrite={false}
          opacity={0.03}
          transparent
        />
      </mesh>
    </group>
  )
}

function RemoteFogLayers() {
  return (
    <group>
      <mesh position={[-3.4, 1.8, -3.6]} rotation={[0, 0, -0.02]}>
        <planeGeometry args={[16, 5.5]} />
        <meshBasicMaterial color={WINTER_PALETTE.fog} depthWrite={false} opacity={0.028} transparent />
      </mesh>
      <mesh position={[4.2, -0.4, -3.4]} rotation={[0, 0, 0.014]}>
        <planeGeometry args={[15, 3.8]} />
        <meshBasicMaterial color={WINTER_PALETTE.fog} depthWrite={false} opacity={0.02} transparent />
      </mesh>
    </group>
  )
}

export default function WinterScene({ quality, reducedMotion, progress }: WorldSceneProps) {
  const particleCount = getWinterAtmosphere(0, reducedMotion, quality).particleCount

  return (
    <group>
      <WinterEnvironmentOwner progress={progress} quality={quality} reducedMotion={reducedMotion} />
      <ambientLight color="#C7CCCD" intensity={0.22} />
      <DistantColdLight progress={progress} quality={quality} reducedMotion={reducedMotion} />
      <mesh position={[0, -3.08, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[38, 24]} />
        <meshStandardMaterial color={WINTER_PALETTE.ground} metalness={0.2} roughness={0.9} />
      </mesh>
      <RemoteFogLayers />
      <FrostBoundary progress={progress} quality={quality} reducedMotion={reducedMotion} />
      <IceDust
        particleCount={particleCount}
        progress={progress}
        quality={quality}
        reducedMotion={reducedMotion}
      />
    </group>
  )
}
