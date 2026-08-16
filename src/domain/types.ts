export type WorldId = 'spring' | 'summer' | 'autumn' | 'winter'
export type CelestialId = WorldId | 'studio'
export type QualityTier = 'high' | 'balanced' | 'lite' | 'static'
export type CurrencyCode = 'USD'

export interface WorldDefinition {
  id: WorldId
  order: 1 | 2 | 3 | 4
  season: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER'
  concept: 'AWAKENING' | 'BURN' | 'FADE' | 'FREEZE'
  route: `/world/${WorldId}`
  gateLine: string
  palette: {
    ground: string
    foreground: string
    accent: string
    atmosphere: string
  }
}

export interface CelestialDefinition {
  id: CelestialId
  label: string
  route: `/world/${WorldId}` | '/studio'
  orbitRadius: number
  orbitPeriodSeconds: number
  rotationPeriodSeconds: number
  inclination: number
  depth: number
  scale: number
  phase: number
}

export interface ObjectMedia {
  src: string
  alt: string
  width: number
  height: number
  role: 'primary' | 'editorial' | 'detail'
}

export interface ObjectDefinition {
  id: string
  slug: string
  name: string
  objectNumber: string
  prototype: true
  world: WorldId
  feel: string[]
  type: 'outerwear' | 'top' | 'bottom' | 'accessory'
  material: string[]
  color: string[]
  price: number
  currency: CurrencyCode
  sizes: string[]
  media: ObjectMedia[]
  editorialCopy: string
  designConcept: string
  constructionNotes: string[]
}
