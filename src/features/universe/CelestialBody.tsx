import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { useRef } from 'react'
import type { CelestialDefinition } from '../../domain/types'
import { useSiteStore } from '../../state/siteStore'
import { getSceneTime } from '../../scene/sceneClock'
import { CELESTIAL_COLORS, DISPLAY_PHASE_OFFSETS } from './universeConfig'
import { getOrbitTransform } from './universeMath'

interface CelestialBodyProps {
  body: CelestialDefinition
  reducedMotion: boolean
}

export function CelestialBody({ body, reducedMotion }: CelestialBodyProps) {
  const meshRef = useRef<Mesh>(null)
  const selected = useSiteStore((state) => state.selectedCelestial)
  const selectCelestial = useSiteStore((state) => state.selectCelestial)
  const isStudio = body.id === 'studio'

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const transform = getOrbitTransform(
      body,
      reducedMotion ? 0 : getSceneTime(),
      DISPLAY_PHASE_OFFSETS[body.id],
    )
    mesh.position.set(...transform.position)
    mesh.rotation.y = transform.rotationY
  })

  return (
    <mesh
      ref={meshRef}
      onClick={(event) => {
        event.stopPropagation()
        selectCelestial(body.id)
      }}
      onPointerOver={() => document.body.style.setProperty('cursor', 'pointer')}
      onPointerOut={() => document.body.style.removeProperty('cursor')}
    >
      <icosahedronGeometry args={[body.scale, 4]} />
      <meshStandardMaterial
        color={CELESTIAL_COLORS[body.id]}
        emissive={isStudio ? '#000000' : CELESTIAL_COLORS[body.id]}
        emissiveIntensity={selected === body.id && !isStudio ? 0.16 : 0.035}
        metalness={isStudio ? 0.04 : 0.16}
        roughness={isStudio ? 0.9 : 0.72}
      />
      {isStudio ? (
        <mesh scale={1.06}>
          <icosahedronGeometry args={[body.scale, 4]} />
          <meshBasicMaterial color="#111318" opacity={0.82} toneMapped={false} transparent />
        </mesh>
      ) : null}
    </mesh>
  )
}
