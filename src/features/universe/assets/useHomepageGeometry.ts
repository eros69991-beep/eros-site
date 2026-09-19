import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import type { BufferGeometry, Mesh } from 'three'
import type { CelestialId } from '../../../domain/types'
import type { HomepageLod } from './homepageAssetSelection'

export type HomepageAssetId = 'core' | CelestialId

export function getHomepageModelUrl(assetId: HomepageAssetId, lod: HomepageLod) {
  return `/assets/homepage/models/${assetId}-${lod}.glb`
}

export function useHomepageGeometry(assetId: HomepageAssetId, lod: HomepageLod): BufferGeometry {
  const model = useGLTF(getHomepageModelUrl(assetId, lod))

  return useMemo(() => {
    let geometry: BufferGeometry | null = null
    model.scene.traverse((object) => {
      if (!geometry && (object as Mesh).isMesh) geometry = (object as Mesh).geometry
    })
    if (!geometry) throw new Error(`Homepage model ${assetId}:${lod} has no mesh geometry`)
    return geometry
  }, [assetId, lod, model.scene])
}
