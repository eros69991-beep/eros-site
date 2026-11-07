export const PORTAL_PBR_IDS = ['core', 'spring', 'summer', 'autumn', 'winter', 'studio'] as const

export type PortalPbrId = typeof PORTAL_PBR_IDS[number]

export interface PortalPbrProfile {
  maps: {
    color: string
    normal: string
    orm: string
    height: string
    emissive: string
  }
  color: string
  emissive: string
  roughness: number
  metalness: number
  transmission: number
  thickness: number
  ior: number
  clearcoat: number
  clearcoatRoughness: number
  sheen: number
  sheenColor: string
  sheenRoughness: number
  displacementScale: number
  displacementBias: number
  emissiveIntensity: number
  normalScale: number
  attenuationColor: string
  attenuationDistance: number
}

type ProfileValues = Omit<PortalPbrProfile, 'maps'>

const PROFILE_VALUES: Record<PortalPbrId, ProfileValues> = {
  core: {
    color: '#ffffff', emissive: '#b88b55', roughness: 0.58, metalness: 0.38,
    transmission: 0, thickness: 0, ior: 1.48, clearcoat: 0.42, clearcoatRoughness: 0.34,
    sheen: 0.12, sheenColor: '#7d8588', sheenRoughness: 0.78,
    displacementScale: 0.016, displacementBias: -0.006, emissiveIntensity: 0.08,
    normalScale: 0.48, attenuationColor: '#1b2327', attenuationDistance: 0.65,
  },
  spring: {
    color: '#ffffff', emissive: '#a9d8bf', roughness: 0.82, metalness: 0.04,
    transmission: 0.28, thickness: 0.72, ior: 1.42, clearcoat: 0.52, clearcoatRoughness: 0.24,
    sheen: 0.16, sheenColor: '#dbe9e3', sheenRoughness: 0.48,
    displacementScale: 0.004, displacementBias: -0.0015, emissiveIntensity: 0.055,
    normalScale: 0.18, attenuationColor: '#607f70', attenuationDistance: 0.82,
  },
  summer: {
    color: '#ffffff', emissive: '#ff5b18', roughness: 0.74, metalness: 0.78,
    transmission: 0, thickness: 0, ior: 1.5, clearcoat: 0.22, clearcoatRoughness: 0.48,
    sheen: 0.05, sheenColor: '#9b7360', sheenRoughness: 0.8,
    displacementScale: 0.03, displacementBias: -0.01, emissiveIntensity: 0.9,
    normalScale: 0.68, attenuationColor: '#24140e', attenuationDistance: 0.5,
  },
  autumn: {
    color: '#ffffff', emissive: '#4b2719', roughness: 0.86, metalness: 0.24,
    transmission: 0, thickness: 0, ior: 1.47, clearcoat: 0.08, clearcoatRoughness: 0.82,
    sheen: 0.11, sheenColor: '#9b6b4d', sheenRoughness: 0.9,
    displacementScale: 0.032, displacementBias: -0.011, emissiveIntensity: 0.025,
    normalScale: 0.72, attenuationColor: '#40281f', attenuationDistance: 0.55,
  },
  winter: {
    color: '#ffffff', emissive: '#b8d0db', roughness: 0.9, metalness: 0.02,
    transmission: 0.2, thickness: 1.08, ior: 1.31, clearcoat: 0.36, clearcoatRoughness: 0.34,
    sheen: 0.22, sheenColor: '#e7f0f3', sheenRoughness: 0.38,
    displacementScale: 0.016, displacementBias: -0.006, emissiveIntensity: 0.045,
    normalScale: 0.62, attenuationColor: '#aabec5', attenuationDistance: 1.4,
  },
  studio: {
    color: '#ffffff', emissive: '#151c24', roughness: 0.94, metalness: 0.08,
    transmission: 0, thickness: 0, ior: 1.5, clearcoat: 0.05, clearcoatRoughness: 0.9,
    sheen: 0.32, sheenColor: '#74899a', sheenRoughness: 0.64,
    displacementScale: 0.014, displacementBias: -0.005, emissiveIntensity: 0.08,
    normalScale: 0.42, attenuationColor: '#07090c', attenuationDistance: 0.45,
  },
}

export function createPortalPbrProfile(id: PortalPbrId, selected = false): PortalPbrProfile {
  const root = `/assets/homepage/materials/${id}`
  const values = PROFILE_VALUES[id]
  return {
    ...values,
    maps: {
      color: `${root}/color.webp?v=6`,
      normal: `${root}/normal.png?v=6`,
      orm: `${root}/orm.webp?v=6`,
      height: `${root}/height.webp?v=6`,
      emissive: `${root}/emissive.webp?v=6`,
    },
    emissiveIntensity: values.emissiveIntensity * (selected ? 1.18 : 1),
  }
}
