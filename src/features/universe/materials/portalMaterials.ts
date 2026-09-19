export type PortalMaterialId = 'core' | 'spring' | 'summer' | 'autumn' | 'winter' | 'studio'

export interface PortalMaterialProfile {
  lowColor: string
  highColor: string
  seamColor: string
  rimColor: string
  macroScale: number
  detailScale: number
  seamScale: number
  seamWidth: number
  roughness: number
  metalness: number
  emission: number
  transmission: number
  crackStrength: number
  rimStrength: number
}

export const PORTAL_MATERIAL_PROFILES = {
  core: {
    lowColor: '#010203', highColor: '#11161a', seamColor: '#6c6255', rimColor: '#d0d5d4',
    macroScale: 2.1, detailScale: 38, seamScale: 2.35, seamWidth: 0.997,
    roughness: 0.78, metalness: 0.035, emission: 0, transmission: 0,
    crackStrength: 0.08, rimStrength: 1.45,
  },
  spring: {
    lowColor: '#07110e', highColor: '#718a80', seamColor: '#15231e', rimColor: '#dbe7e1',
    macroScale: 3.1, detailScale: 31, seamScale: 4.1, seamWidth: 0.988,
    roughness: 0.33, metalness: 0.02, emission: 0, transmission: 0.28,
    crackStrength: 0.18, rimStrength: 1.2,
  },
  summer: {
    lowColor: '#040302', highColor: '#30241e', seamColor: '#c74c17', rimColor: '#9a7462',
    macroScale: 3.4, detailScale: 41, seamScale: 3.7, seamWidth: 0.982,
    roughness: 0.58, metalness: 0.7, emission: 0.52, transmission: 0,
    crackStrength: 0.86, rimStrength: 0.72,
  },
  autumn: {
    lowColor: '#0a0807', highColor: '#514239', seamColor: '#25150f', rimColor: '#816a5e',
    macroScale: 2.7, detailScale: 35, seamScale: 3.0, seamWidth: 0.986,
    roughness: 0.88, metalness: 0.08, emission: 0, transmission: 0,
    crackStrength: 0.32, rimStrength: 0.62,
  },
  winter: {
    lowColor: '#10181e', highColor: '#929fa4', seamColor: '#030608', rimColor: '#edf2f1',
    macroScale: 3.5, detailScale: 34, seamScale: 3.9, seamWidth: 0.986,
    roughness: 0.4, metalness: 0.02, emission: 0, transmission: 0.16,
    crackStrength: 0.55, rimStrength: 1.32,
  },
  studio: {
    lowColor: '#000000', highColor: '#010204', seamColor: '#05080c', rimColor: '#65727e',
    macroScale: 2.5, detailScale: 27, seamScale: 4.3, seamWidth: 0.994,
    roughness: 0.92, metalness: 0.04, emission: 0, transmission: 0,
    crackStrength: 0.05, rimStrength: 1.85,
  },
} as const satisfies Record<PortalMaterialId, PortalMaterialProfile>
