import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import { GALAXY_BACKDROP_URL } from './galaxyLayers'
import { getHomeCameraPreset } from './homeComposition'

const BACKDROP_Z = -30
const IMAGE_ASPECT = 1672 / 941

export function GalaxyBackdrop() {
  const size = useThree((state) => state.size)
  const texture = useTexture(GALAXY_BACKDROP_URL)

  const dimensions = useMemo(() => {
    const preset = getHomeCameraPreset(size.width, size.height)
    const distance = preset.position[2] - BACKDROP_Z
    const visibleHeight = 2 * distance * Math.tan((preset.fov * Math.PI) / 360)
    const visibleWidth = visibleHeight * (size.width / size.height)
    const viewportAspect = visibleWidth / visibleHeight

    if (viewportAspect > IMAGE_ASPECT) {
      return [visibleWidth, visibleWidth / IMAGE_ASPECT] as const
    }
    return [visibleHeight * IMAGE_ASPECT, visibleHeight] as const
  }, [size.height, size.width])

  return (
    <mesh position={[0, 0, BACKDROP_Z]} renderOrder={-10}>
      <planeGeometry args={[dimensions[0], dimensions[1]]} />
      <meshBasicMaterial depthWrite={false} map={texture} opacity={0.8} toneMapped={false} transparent />
    </mesh>
  )
}
