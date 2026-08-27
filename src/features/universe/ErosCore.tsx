import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BackSide, type Group } from 'three'
import { useMemo, useRef } from 'react'
import { createSeededStars } from './universeMath'
import { CORE_POSITION } from './universeConfig'

export function ErosCore({ reducedMotion }: { reducedMotion: boolean }) {
  const cloudRef = useRef<Group>(null)
  const surfaceLights = useMemo(() => createSeededStars(120, 2047), [])
  const surfacePositions = useMemo(() => {
    const values = new Float32Array(surfaceLights.length * 3)
    surfaceLights.forEach((light, index) => {
      const [x, y, z] = light.position
      const length = Math.hypot(x, y, z) || 1
      values.set([(x / length) * 2.38, (y / length) * 2.38, (z / length) * 2.38], index * 3)
    })
    return values
  }, [surfaceLights])

  useFrame((_state, delta) => {
    if (!reducedMotion && cloudRef.current) cloudRef.current.rotation.y += delta * 0.0025
  })

  return (
    <group position={CORE_POSITION}>
      <mesh>
        <sphereGeometry args={[2.35, 64, 64]} />
        <meshStandardMaterial color="#071015" metalness={0.08} roughness={0.72} />
      </mesh>
      <group ref={cloudRef}>
        <mesh>
          <sphereGeometry args={[2.375, 48, 48]} />
          <meshBasicMaterial color="#8FA5AA" opacity={0.11} transparent depthWrite={false} blending={AdditiveBlending} />
        </mesh>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[surfacePositions, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#C6D7D8" opacity={0.18} transparent size={0.028} sizeAttenuation depthWrite={false} />
        </points>
      </group>
      <mesh>
        <sphereGeometry args={[2.42, 64, 64]} />
        <meshBasicMaterial color="#B7CAD3" opacity={0.14} transparent side={BackSide} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
    </group>
  )
}
