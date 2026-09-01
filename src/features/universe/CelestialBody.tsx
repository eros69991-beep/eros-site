import { useFrame } from '@react-three/fiber'
import { MathUtils, type Mesh } from 'three'
import { useRef } from 'react'
import type { CelestialDefinition } from '../../domain/types'
import { useSiteStore } from '../../state/siteStore'
import { getSceneTime } from '../../scene/sceneClock'
import { PORTAL_BODY_POSITIONS } from './universeConfig'
import { getPortalBody } from './portalModel'

interface CelestialBodyProps {
  body: CelestialDefinition
  mobile: boolean
  reducedMotion: boolean
}

function BodyMaterial({ id, selected }: { id: CelestialDefinition['id']; selected: boolean }) {
  const profile = getPortalBody(id)
  const opacity = selected ? 1 : 0.56

  switch (profile.material) {
    case 'crystal':
      return <meshPhysicalMaterial color="#b4d1ca" transmission={0.42} roughness={0.2} thickness={0.9} transparent opacity={opacity} />
    case 'burned-metal':
      return <meshStandardMaterial color="#4a3730" emissive="#5a2510" emissiveIntensity={selected ? 0.16 : 0.1} metalness={0.84} roughness={0.44} transparent opacity={opacity} />
    case 'oxidized-mineral':
      return <meshStandardMaterial color="#75544a" metalness={0.32} roughness={0.88} transparent opacity={opacity} />
    case 'milky-ice':
      return <meshPhysicalMaterial color="#d6dfdc" transmission={0.34} roughness={0.28} thickness={1.25} transparent opacity={opacity} />
    case 'absorbing-matter':
      return <meshBasicMaterial color="#030303" transparent opacity={selected ? 1 : 0.78} />
  }
}

export function CelestialBody({ body, mobile, reducedMotion }: CelestialBodyProps) {
  const meshRef = useRef<Mesh>(null)
  const selected = useSiteStore((state) => state.selectedCelestial)
  const selectCelestial = useSiteStore((state) => state.selectCelestial)
  const isSelected = (selected ?? 'spring') === body.id

  useFrame((_state, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    const [x, y, z] = PORTAL_BODY_POSITIONS[body.id]
    mesh.position.set(x, y, z)
    if (!reducedMotion) mesh.rotation.y = getSceneTime() / body.rotationPeriodSeconds
    const targetScale = body.scale * (mobile ? (isSelected ? 2.8 : 0.45) : (isSelected ? 1.13 : 1))
    const scale = MathUtils.damp(mesh.scale.x, targetScale, 5, delta)
    mesh.scale.setScalar(scale)
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
      <icosahedronGeometry args={[1, 4]} />
      <BodyMaterial id={body.id} selected={isSelected} />
      {body.id === 'winter' ? <mesh scale={1.015}><icosahedronGeometry args={[1, 2]} /><meshBasicMaterial color="#08090a" transparent opacity={0.24} wireframe /></mesh> : null}
    </mesh>
  )
}
