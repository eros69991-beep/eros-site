import { useFrame } from '@react-three/fiber'
import { type Group, Vector3 } from 'three'
import { useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CelestialDefinition } from '../../domain/types'
import { useSiteStore } from '../../state/siteStore'
import { useWorldEntry } from '../transitions/useWorldEntry'
import { selectHomepageLod } from './assets/homepageAssetSelection'
import { useHomepageGeometry } from './assets/useHomepageGeometry'
import { PortalPbrMaterial } from './materials/PortalPbrMaterial'
import { getPortalBody } from './portalModel'
import { HOME_BODY_LAYOUT } from './homeComposition'
import { homeOrbitClock } from './homeOrbitClock'
import { HOME_ORBIT_SPECS } from './homeOrbitConfig'
import { writeOrbitPosition } from './homeOrbitMath'

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
  const navigate = useNavigate()
  const isSelected = (selected ?? 'spring') === body.id
  const lod = selectHomepageLod({
    core: false,
    foreground: body.id === 'winter',
    mobile,
    quality,
    selected: isSelected,
  })
  const geometry = useHomepageGeometry(body.id, lod)
  const layout = HOME_BODY_LAYOUT[body.id]
  const orbitPosition = useMemo(() => new Vector3(), [])
  const corePosition = HOME_BODY_LAYOUT.core.position

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    const elapsed = homeOrbitClock.getElapsed()
    writeOrbitPosition(orbitPosition, HOME_ORBIT_SPECS[body.id], elapsed)
    group.position.set(
      orbitPosition.x + corePosition[0],
      orbitPosition.y + corePosition[1],
      orbitPosition.z + corePosition[2],
    )
    if (!reducedMotion) group.rotation.y = (elapsed / body.rotationPeriodSeconds) * Math.PI * 2
  })

  return (
    <group
      ref={groupRef}
      position={layout.position}
      scale={layout.scale * (isSelected ? 1.035 : 1)}
      onClick={(event) => {
        event.stopPropagation()
        const portalBody = getPortalBody(body.id)
        selectCelestial(body.id)
        homeOrbitClock.setPaused('navigation', true)
        if (portalBody.world) enterWorld(portalBody.world, 'universe')
        else navigate(portalBody.route)
      }}
      onPointerOver={() => {
        homeOrbitClock.setPaused('pointer', true)
        selectCelestial(body.id)
        document.body.style.setProperty('cursor', 'pointer')
      }}
      onPointerOut={() => {
        homeOrbitClock.setPaused('pointer', false)
        selectCelestial(null)
        document.body.style.removeProperty('cursor')
      }}
    >
      <mesh geometry={geometry} rotation={[body.phase * 0.08, 0, body.phase * 0.035]}>
        <PortalPbrMaterial id={body.id} reducedMotion={reducedMotion} selected={isSelected} />
      </mesh>
    </group>
  )
}
