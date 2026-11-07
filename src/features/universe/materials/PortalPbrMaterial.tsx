import { useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  ClampToEdgeWrapping,
  NoColorSpace,
  SRGBColorSpace,
  Vector2,
  type ColorSpace,
  type MeshPhysicalMaterial,
} from 'three'
import { createPortalPbrProfile, type PortalPbrId } from './portalPbrProfiles'

export function PortalPbrMaterial({
  id,
  reducedMotion: _reducedMotion,
  selected,
}: {
  id: PortalPbrId
  reducedMotion: boolean
  selected: boolean
}) {
  void _reducedMotion
  const renderer = useThree((state) => state.gl)
  const materialRef = useRef<MeshPhysicalMaterial>(null)
  const profile = useMemo(() => createPortalPbrProfile(id, selected), [id, selected])
  const textures = useTexture(profile.maps)

  const preparedTextures = useMemo(() => {
    const prepare = (source: typeof textures.color, colorSpace: ColorSpace) => {
      const texture = source.clone()
      texture.colorSpace = colorSpace
      texture.wrapS = ClampToEdgeWrapping
      texture.wrapT = ClampToEdgeWrapping
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
      texture.needsUpdate = true
      return texture
    }
    return {
      color: prepare(textures.color, SRGBColorSpace),
      emissive: prepare(textures.emissive, SRGBColorSpace),
      normal: prepare(textures.normal, NoColorSpace),
      orm: prepare(textures.orm, NoColorSpace),
      height: prepare(textures.height, NoColorSpace),
    }
  }, [renderer, textures])

  useFrame(({ clock }) => {
    if (id !== 'summer' || _reducedMotion || !materialRef.current) return
    materialRef.current.emissiveIntensity = profile.emissiveIntensity * (0.94 + Math.sin(clock.elapsedTime * 0.32) * 0.06)
  })

  return (
    <meshPhysicalMaterial
      clearcoat={profile.clearcoat}
      clearcoatRoughness={profile.clearcoatRoughness}
      color={profile.color}
      attenuationColor={profile.attenuationColor}
      attenuationDistance={profile.attenuationDistance}
      displacementBias={profile.displacementBias}
      displacementMap={preparedTextures.height}
      displacementScale={profile.displacementScale}
      emissive={profile.emissive}
      emissiveIntensity={profile.emissiveIntensity}
      emissiveMap={preparedTextures.emissive}
      envMapIntensity={id === 'studio' ? 0.8 : 1.35}
      ior={profile.ior}
      metalness={profile.metalness}
      metalnessMap={preparedTextures.orm}
      map={preparedTextures.color}
      ref={materialRef}
      normalMap={preparedTextures.normal}
      normalScale={new Vector2(profile.normalScale, profile.normalScale)}
      roughness={profile.roughness}
      roughnessMap={preparedTextures.orm}
      sheen={profile.sheen}
      sheenColor={profile.sheenColor}
      sheenRoughness={profile.sheenRoughness}
      thickness={profile.thickness}
      transmission={profile.transmission}
      transparent={false}
      toneMapped
    />
  )
}
