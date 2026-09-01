import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useRef } from 'react'
import { CORE_POSITION } from './universeConfig'

export function ErosCore({ reducedMotion }: { reducedMotion: boolean }) {
  const liquidRef = useRef<Group>(null)

  useFrame((_state, delta) => {
    if (!reducedMotion && liquidRef.current) liquidRef.current.rotation.y += delta * 0.018
  })

  return (
    <group position={CORE_POSITION}>
      <mesh scale={[5.1, 4.5, 4.2]}>
        <icosahedronGeometry args={[1, 5]} />
        <meshPhysicalMaterial color="#263332" emissive="#07110f" emissiveIntensity={0.2} metalness={0.45} roughness={0.46} transmission={0.06} thickness={1.1} />
      </mesh>
      <group ref={liquidRef}>
        <mesh rotation={[0.28, -0.4, 0.1]} scale={[2.4, 0.7, 1.45]}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial color="#536261" metalness={0.22} roughness={0.88} transparent opacity={0.62} />
        </mesh>
      </group>
      <mesh position={[-0.8, 0.45, 1.65]} scale={[0.42, 1.9, 0.5]}>
        <octahedronGeometry args={[1, 3]} />
        <meshPhysicalMaterial color="#c7d4d2" transmission={0.44} roughness={0.18} thickness={0.7} transparent opacity={0.32} />
      </mesh>
    </group>
  )
}
