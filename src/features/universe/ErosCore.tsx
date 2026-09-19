import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { getSceneTime } from '../../scene/sceneClock'
import { selectHomepageLod } from './assets/homepageAssetSelection'
import { useHomepageGeometry } from './assets/useHomepageGeometry'
import { PortalPlanetMaterial } from './materials/PortalPlanetMaterial'
import { CORE_MOBILE_POSITION, CORE_POSITION } from './universeConfig'

export function ErosCore({
  mobile,
  quality,
  reducedMotion,
}: {
  mobile: boolean
  quality: 'high' | 'balanced' | 'lite'
  reducedMotion: boolean
}) {
  const groupRef = useRef<Group>(null)
  const lod = selectHomepageLod({ core: true, mobile, quality, selected: true })
  const geometry = useHomepageGeometry('core', lod)
  const position = mobile ? CORE_MOBILE_POSITION : CORE_POSITION

  useFrame(() => {
    if (!groupRef.current || reducedMotion) return
    const time = getSceneTime()
    groupRef.current.rotation.y = time * 0.0064
    groupRef.current.rotation.x = 0.08 + Math.sin(time * 0.018) * 0.015
  })

  return (
    <group ref={groupRef} position={position} rotation={[0.08, -0.35, 0.12]} scale={mobile ? 6.4 : 7.1}>
      <mesh geometry={geometry} scale={[1, 1.015, 0.99]}>
        <PortalPlanetMaterial id="core" reducedMotion={reducedMotion} selected />
      </mesh>
    </group>
  )
}
