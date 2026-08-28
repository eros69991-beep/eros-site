import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  Matrix4,
  type Group,
  type InstancedMesh,
} from 'three'
import type { WorldSceneProps } from '../../../scene/contracts'
import { getSceneTime } from '../../../scene/sceneClock'
import { getSpringAtmosphere } from './springAtmosphere'

interface MistTransform {
  x: number
  y: number
  z: number
  scaleX: number
  scaleY: number
}

function createMistTransforms(count: number): MistTransform[] {
  return Array.from({ length: count }, (_, index) => ({
    x: ((index * 37) % 17) - 8,
    y: ((index * 19) % 11) - 5,
    z: -2.8 + (index % 4) * 1.1,
    scaleX: 2.8 + (index % 4) * 1.35,
    scaleY: 0.32 + (index % 3) * 0.13,
  }))
}

function createCondensationGeometry(count: number) {
  const positions = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3
    positions[offset] = ((index * 47) % 1000) / 1000 * 26 - 13
    positions[offset + 1] = ((index * 83) % 1000) / 1000 * 13 - 6.5
    positions[offset + 2] = -1.8 + ((index * 29) % 1000) / 1000 * 3.4
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  return geometry
}

function MistSheets({ reducedMotion, quality, verticalDrift }: {
  reducedMotion: boolean
  quality: WorldSceneProps['quality']
  verticalDrift: number
}) {
  const meshRef = useRef<InstancedMesh>(null)
  const groupRef = useRef<Group>(null)
  const mistCount = quality === 'high' ? 16 : quality === 'balanced' ? 12 : 8
  const transforms = useMemo(() => createMistTransforms(mistCount), [mistCount])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const matrix = new Matrix4()
    transforms.forEach((transform, index) => {
      matrix.makeScale(transform.scaleX, transform.scaleY, 1)
      matrix.setPosition(transform.x, transform.y, transform.z)
      mesh.setMatrixAt(index, matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [transforms])

  useFrame(() => {
    if (reducedMotion || !groupRef.current) return
    const time = getSceneTime()
    groupRef.current.position.y = Math.sin(time * 0.18) * 0.15 + verticalDrift * time
  })

  return (
    <group ref={groupRef}>
      <instancedMesh args={[undefined, undefined, mistCount]} ref={meshRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#AFC4BA" depthWrite={false} opacity={0.035} transparent />
      </instancedMesh>
    </group>
  )
}

function Condensation({ particleCount, reducedMotion, verticalDrift }: {
  particleCount: number
  reducedMotion: boolean
  verticalDrift: number
}) {
  const pointsRef = useRef<Group>(null)
  const geometry = useMemo(() => createCondensationGeometry(particleCount), [particleCount])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    if (reducedMotion || !pointsRef.current) return
    pointsRef.current.position.y = (getSceneTime() % 28) * verticalDrift
  })

  return (
    <group ref={pointsRef}>
      <points geometry={geometry}>
        <pointsMaterial
          color="#C8D3CC"
          depthWrite={false}
          opacity={0.16}
          size={0.012}
          sizeAttenuation
          transparent
        />
      </points>
    </group>
  )
}

function FractureTrace({ livingAccent, reducedMotion, verticalDrift }: {
  livingAccent: number
  reducedMotion: boolean
  verticalDrift: number
}) {
  const groupRef = useRef<Group>(null)
  const geometry = useMemo(() => {
    const positions = new Float32Array([
      -5.6, -6.3, 0.25, -3.8, -3.8, 0.12,
      -3.8, -3.8, 0.12, -2.1, -1.5, 0.18,
      -2.1, -1.5, 0.18, -1.25, 0.8, 0.1,
      -3.8, -3.8, 0.12, -4.5, -1.9, 0.14,
      -1.25, 0.8, 0.1, -0.6, 2.9, 0.08,
    ])
    const next = new BufferGeometry()
    next.setAttribute('position', new BufferAttribute(positions, 3))
    return next
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    if (reducedMotion || !groupRef.current) return
    groupRef.current.position.y = Math.sin(getSceneTime() * 0.11) * 0.08 + verticalDrift * 2
  })

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="#8AC6A8" opacity={livingAccent} transparent />
      </lineSegments>
    </group>
  )
}

export default function SpringScene({ quality, reducedMotion, progress }: WorldSceneProps) {
  const atmosphere = getSpringAtmosphere(progress.current, reducedMotion, quality)

  return (
    <group>
      <color attach="background" args={['#0C100E']} />
      <fogExp2 attach="fog" args={['#0C100E', atmosphere.fogDensity]} />
      <ambientLight color="#C8D3CC" intensity={0.17} />
      <directionalLight color="#9EBCAD" intensity={0.42} position={[-7, 5, 7]} />
      <pointLight color="#8AC6A8" distance={7} intensity={atmosphere.livingAccent * 5} position={[-3.8, -3.5, 2]} />
      <mesh position={[0, -2.9, -1.8]}>
        <planeGeometry args={[34, 18]} />
        <meshStandardMaterial color="#1B2420" metalness={0.44} roughness={0.42} />
      </mesh>
      <mesh position={[0, -2.9, -1.72]}>
        <planeGeometry args={[34, 18]} />
        <meshPhysicalMaterial
          color="#C8D3CC"
          clearcoat={1}
          clearcoatRoughness={0.18}
          metalness={0.22}
          opacity={atmosphere.wetReflection}
          roughness={0.18}
          transparent
        />
      </mesh>
      <MistSheets quality={quality} reducedMotion={reducedMotion} verticalDrift={atmosphere.verticalDrift} />
      <Condensation
        particleCount={atmosphere.particleCount}
        reducedMotion={reducedMotion}
        verticalDrift={atmosphere.verticalDrift}
      />
      <FractureTrace
        livingAccent={atmosphere.livingAccent}
        reducedMotion={reducedMotion}
        verticalDrift={atmosphere.verticalDrift}
      />
    </group>
  )
}
