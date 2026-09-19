import { useFrame } from '@react-three/fiber'
import { type Group } from 'three'
import { useRef } from 'react'
import type { CelestialDefinition } from '../../domain/types'
import { getSceneTime } from '../../scene/sceneClock'
import { useSiteStore } from '../../state/siteStore'
import { useWorldEntry } from '../transitions/useWorldEntry'
import { selectHomepageLod } from './assets/homepageAssetSelection'
import { useHomepageGeometry } from './assets/useHomepageGeometry'
import { PortalPlanetMaterial } from './materials/PortalPlanetMaterial'
import { getPortalBody } from './portalModel'
import { HOME_BODY_LAYOUT } from './homeComposition'

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
  const layout = HOME_BODY_LAYOUT[body.id]

  useFrame(() => {
    const group = groupRef.current
    if (!group || reducedMotion) return
    group.rotation.y = (getSceneTime() / body.rotationPeriodSeconds) * Math.PI * 2
  })

  return (
    <group
      ref={groupRef}
      position={layout.position}
      scale={layout.scale * (isSelected ? 1.035 : 1)}
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
