import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  type DirectionalLight,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
  type PointLight,
} from 'three'
import type { WorldSceneProps } from '../../../scene/contracts'
import { getSceneTime } from '../../../scene/sceneClock'
import { AUTUMN_PALETTE, getAutumnAtmosphere } from './autumnAtmosphere'
import {
  getAutumnRuntimeFrame,
  installAutumnSceneEnvironment,
} from './autumnSceneRuntime'

function createDustGeometry(count: number) {
  const positions = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3
    positions[offset] = ((index * 71) % 1000) / 1000 * 30 - 15
    positions[offset + 1] = ((index * 41) % 1000) / 1000 * 8 - 3.8
    positions[offset + 2] = -3 + ((index * 37) % 1000) / 1000 * 5.2
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  return geometry
}

function LateralDust({ particleCount, progress, quality, reducedMotion }: {
  particleCount: number
  progress: WorldSceneProps['progress']
  quality: WorldSceneProps['quality']
  reducedMotion: boolean
}) {
  const groupRef = useRef<Group>(null)
  const geometry = useMemo(() => createDustGeometry(particleCount), [particleCount])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    if (!groupRef.current) return
    const frame = getAutumnRuntimeFrame(
      progress.current,
      reducedMotion,
      quality,
      getSceneTime(),
    )
    groupRef.current.position.x = frame.dustOffset
  })

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <pointsMaterial
          color={AUTUMN_PALETTE.dust}
          depthWrite={false}
          opacity={0.17}
          size={0.014}
          sizeAttenuation
          transparent
        />
      </points>
    </group>
  )
}

function LowSun({ progress, quality, reducedMotion }: {
  progress: WorldSceneProps['progress']
  quality: WorldSceneProps['quality']
  reducedMotion: boolean
}) {
  const directionalRef = useRef<DirectionalLight>(null)
  const localWarmthRef = useRef<PointLight>(null)

  useFrame(() => {
    const directional = directionalRef.current
    const localWarmth = localWarmthRef.current
    if (!directional || !localWarmth) return

    const { atmosphere } = getAutumnRuntimeFrame(
      progress.current,
      reducedMotion,
      quality,
      getSceneTime(),
    )
    directional.position.y = 1.2 + atmosphere.sunElevation * 12
    directional.intensity = 0.48 + atmosphere.warmLightContribution * 1.35
    localWarmth.intensity = atmosphere.warmLightContribution * 2.1
  })

  return (
    <>
      <directionalLight
        ref={directionalRef}
        color={AUTUMN_PALETTE.warmLight}
        intensity={0.9}
        position={[-10, 4.5, 6]}
      />
      <pointLight
        ref={localWarmthRef}
        color={AUTUMN_PALETTE.warmLight}
        distance={9}
        intensity={1}
        position={[-5.5, -0.8, 2.5]}
      />
    </>
  )
}

function DirectionalShadow({ progress, quality, reducedMotion }: {
  progress: WorldSceneProps['progress']
  quality: WorldSceneProps['quality']
  reducedMotion: boolean
}) {
  const shadowRef = useRef<Mesh>(null)
  const materialRef = useRef<MeshBasicMaterial>(null)

  useFrame(() => {
    const shadow = shadowRef.current
    const material = materialRef.current
    if (!shadow || !material) return

    const { atmosphere } = getAutumnRuntimeFrame(
      progress.current,
      reducedMotion,
      quality,
      getSceneTime(),
    )
    shadow.scale.x = atmosphere.shadowLength
    material.opacity = 0.13 + atmosphere.surfaceWeathering * 0.12
  })

  return (
    <mesh
      ref={shadowRef}
      position={[-1.7, -2.88, 0.4]}
      rotation={[-Math.PI / 2, 0, -0.16]}
      scale={[3, 0.82, 1]}
    >
      <circleGeometry args={[1, 48]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#171513"
        depthWrite={false}
        opacity={0.16}
        transparent
      />
    </mesh>
  )
}

function WeatheredPlanes({ progress, quality, reducedMotion }: {
  progress: WorldSceneProps['progress']
  quality: WorldSceneProps['quality']
  reducedMotion: boolean
}) {
  const upperLayerRef = useRef<Mesh>(null)
  const lowerLayerRef = useRef<Mesh>(null)
  const upperMaterialRef = useRef<MeshStandardMaterial>(null)
  const lowerMaterialRef = useRef<MeshStandardMaterial>(null)

  useFrame(() => {
    const upperLayer = upperLayerRef.current
    const lowerLayer = lowerLayerRef.current
    const upperMaterial = upperMaterialRef.current
    const lowerMaterial = lowerMaterialRef.current
    if (!upperLayer || !lowerLayer || !upperMaterial || !lowerMaterial) return

    const frame = getAutumnRuntimeFrame(
      progress.current,
      reducedMotion,
      quality,
      getSceneTime(),
    )
    const weathering = frame.atmosphere.surfaceWeathering
    const erosionDisplacement = (frame.erosionPhase - 0.5) * 0.14

    upperLayer.position.x = -2.6 - weathering * 0.5 + erosionDisplacement
    lowerLayer.position.z = -1.2 + weathering * 0.32 - erosionDisplacement * 0.5
    upperMaterial.roughness = 0.62 + weathering * 0.28
    upperMaterial.metalness = 0.18 - weathering * 0.08
    lowerMaterial.roughness = 0.7 + weathering * 0.2
  })

  return (
    <group>
      <mesh position={[0, -3.12, -1.4]}>
        <boxGeometry args={[36, 0.38, 24]} />
        <meshStandardMaterial color={AUTUMN_PALETTE.ground} metalness={0.08} roughness={0.88} />
      </mesh>
      <mesh ref={lowerLayerRef} position={[3.8, -2.84, -0.95]} rotation={[0, 0.08, 0]}>
        <boxGeometry args={[17, 0.13, 11]} />
        <meshStandardMaterial
          ref={lowerMaterialRef}
          color={AUTUMN_PALETTE.substrate}
          metalness={0.04}
          roughness={0.82}
        />
      </mesh>
      <mesh ref={upperLayerRef} position={[-2.8, -2.64, 0.35]} rotation={[0, -0.08, -0.015]}>
        <boxGeometry args={[18, 0.16, 10]} />
        <meshStandardMaterial
          ref={upperMaterialRef}
          color="#6A4638"
          metalness={0.14}
          roughness={0.74}
        />
      </mesh>
      <mesh position={[7.4, -2.48, 1.5]} rotation={[0, -0.12, 0.025]}>
        <boxGeometry args={[8, 0.12, 7]} />
        <meshStandardMaterial color="#776A61" metalness={0.05} roughness={0.9} />
      </mesh>
    </group>
  )
}

function AutumnEnvironmentOwner() {
  const { scene } = useThree()

  useEffect(() => installAutumnSceneEnvironment(scene), [scene])
  return null
}

export default function AutumnScene({ quality, reducedMotion, progress }: WorldSceneProps) {
  const particleCount = getAutumnAtmosphere(0, reducedMotion, quality).particleCount

  return (
    <group>
      <AutumnEnvironmentOwner />
      <ambientLight color="#B8AEA5" intensity={0.24} />
      <LowSun progress={progress} quality={quality} reducedMotion={reducedMotion} />
      <WeatheredPlanes progress={progress} quality={quality} reducedMotion={reducedMotion} />
      <DirectionalShadow progress={progress} quality={quality} reducedMotion={reducedMotion} />
      <LateralDust
        particleCount={particleCount}
        progress={progress}
        quality={quality}
        reducedMotion={reducedMotion}
      />
    </group>
  )
}
