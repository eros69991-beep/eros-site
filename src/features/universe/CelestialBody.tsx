import { useFrame } from '@react-three/fiber'
import { MathUtils, type Group } from 'three'
import { useRef } from 'react'
import type { CelestialDefinition } from '../../domain/types'
import { getSceneTime } from '../../scene/sceneClock'
import { useSiteStore } from '../../state/siteStore'
import { useWorldEntry } from '../transitions/useWorldEntry'
import { selectHomepageLod } from './assets/homepageAssetSelection'
import { useHomepageGeometry } from './assets/useHomepageGeometry'
import { PortalPlanetMaterial } from './materials/PortalPlanetMaterial'
import { getPortalBodyTransform } from './portalMotion'
import { getPortalBody } from './portalModel'

interface CelestialBodyProps {
  body: CelestialDefinition
  mobile: boolean
  quality: 'high' | 'balanced' | 'lite'
  reducedMotion: boolean
}

export function CelestialBody({ body, mobile, quality, reducedMotion }: CelestialBodyProps) {
  const groupRef = useRef<Group>(null)
  const selected = useSiteStore((state) => state.selectedCelestial)
  const selectCelestial = useSiteStore((state) => state.selectCelestial)
  const { enterWorld } = useWorldEntry()
  const isSelected = (selected ?? 'spring') === body.id
  const lod = selectHomepageLod({ core: false, mobile, quality, selected: isSelected })
  const geometry = useHomepageGeometry(body.id, lod)

  useFrame((_state, delta) => {
    const group = groupRef.current
    if (!group) return
    const transform = getPortalBodyTransform(body.id, getSceneTime(), {
      mobile,
      reducedMotion,
      selected: isSelected,
    })
    const damping = reducedMotion ? 100 : isSelected ? 4.8 : 1.35
    group.position.x = MathUtils.damp(group.position.x, transform.position[0], damping, delta)
    group.position.y = MathUtils.damp(group.position.y, transform.position[1], damping, delta)
    group.position.z = MathUtils.damp(group.position.z, transform.position[2], damping, delta)
    group.rotation.y = transform.rotationY
    const targetScale = body.scale * (mobile ? (isSelected ? 2.2 : 0.72) : (isSelected ? 1.16 : 1))
    const scale = MathUtils.damp(group.scale.x, targetScale, 4.5, delta)
    group.scale.setScalar(scale)
  })

  return (
    <group
      ref={groupRef}
      onClick={(event) => {
        event.stopPropagation()
        const portalBody = getPortalBody(body.id)
        if (isSelected && portalBody.world) enterWorld(portalBody.world, 'universe')
        else selectCelestial(body.id)
      }}
      onPointerOver={() => {
        selectCelestial(body.id)
        document.body.style.setProperty('cursor', 'pointer')
      }}
      onPointerOut={() => document.body.style.removeProperty('cursor')}
    >
      <mesh geometry={geometry} rotation={[body.phase * 0.08, 0, body.phase * 0.035]}>
        <PortalPlanetMaterial id={body.id} reducedMotion={reducedMotion} selected={isSelected} />
      </mesh>
    </group>
  )
}
