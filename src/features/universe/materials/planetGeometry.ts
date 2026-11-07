import { SphereGeometry } from 'three'
import type { PortalPbrId } from './portalPbrProfiles'

let sharedSphere: SphereGeometry | null = null

/** 所有星球共用一个高细分球体；表面贴图由程序化烘焙生成，不再下载 glb 模型和贴图。 */
export function getPlanetSphere() {
  sharedSphere ??= new SphereGeometry(1, 160, 120)
  return sharedSphere
}

/** 烘焙贴图宽度（高度为一半）。近景大星球用更高分辨率，手机减半。 */
export function getPlanetBakeWidth(id: PortalPbrId, mobile: boolean) {
  if (id === 'winter') return mobile ? 1024 : 2048
  if (id === 'core') return 512
  return mobile ? 512 : 1024
}
