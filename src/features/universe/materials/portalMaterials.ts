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
}

export const PORTAL_MATERIAL_PROFILES = {
  core: {
    lowColor: '#010203', highColor: '#0c1117', seamColor: '#655849', rimColor: '#aab4b8',
    macroScale: 2.1, detailScale: 38, seamScale: 2.35, seamWidth: 0.997,
    roughness: 0.78, metalness: 0.035, emission: 0, transmission: 0,
  },
  spring: {
    lowColor: '#07120e', highColor: '#789588', seamColor: '#020504', rimColor: '#d5e1dc',
    macroScale: 3.1, detailScale: 31, seamScale: 4.1, seamWidth: 0.94,
    roughness: 0.33, metalness: 0.02, emission: 0, transmission: 0.22,
  },
  summer: {
    lowColor: '#030201', highColor: '#39251d', seamColor: '#d1440b', rimColor: '#80604e',
    macroScale: 3.4, detailScale: 41, seamScale: 3.7, seamWidth: 0.955,
    roughness: 0.58, metalness: 0.7, emission: 0.48, transmission: 0,
  },
  autumn: {
    lowColor: '#070403', highColor: '#71351d', seamColor: '#0d0907', rimColor: '#755343',
    macroScale: 2.7, detailScale: 35, seamScale: 3.0, seamWidth: 0.94,
    roughness: 0.84, metalness: 0.1, emission: 0, transmission: 0,
  },
  winter: {
    lowColor: '#162229', highColor: '#aebcc0', seamColor: '#010203', rimColor: '#e1e7e8',
    macroScale: 3.5, detailScale: 34, seamScale: 3.9, seamWidth: 0.945,
    roughness: 0.4, metalness: 0.02, emission: 0, transmission: 0.12,
  },
  studio: {
    lowColor: '#000000', highColor: '#010204', seamColor: '#05080c', rimColor: '#65727e',
    macroScale: 2.5, detailScale: 27, seamScale: 4.3, seamWidth: 0.96,
    roughness: 0.92, metalness: 0.04, emission: 0, transmission: 0,
  },
} as const satisfies Record<PortalMaterialId, PortalMaterialProfile>
