import type { ObjectDefinition } from './types'
import { mediaManifest, type DemoMediaKey } from '../media/mediaManifest'

export const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export const formatUsd = (price: number): string => usdFormatter.format(price)

const demonstrationMedia = (key: DemoMediaKey): ObjectDefinition['media'] => {
  const media = mediaManifest[key]
  const source = media.sources.webp[2]

  return [{
    src: source.src,
    alt: media.alt,
    width: media.width,
    height: media.height,
    role: 'primary',
  }]
}

export const demoObjects: ObjectDefinition[] = [
  { id: 'demo-spring-001', slug: 'prototype-spring-001', name: 'Mist Shell', objectNumber: 'PROTOTYPE 001', prototype: true, world: 'spring', feel: ['sheltered', 'porous'], type: 'outerwear', material: ['coated cotton', 'mesh'], color: ['graphite', 'mist'], price: 480, currency: 'USD', sizes: ['S', 'M', 'L'], media: demonstrationMedia('spring-object-001'), editorialCopy: 'Demonstration fixture for a sheltered, porous outer layer.', designConcept: 'A shell that opens through a porous surface.', constructionNotes: ['Coated cotton shell', 'Mesh ventilation panels'] },
  { id: 'demo-spring-002', slug: 'prototype-spring-002', name: 'Dew Spine', objectNumber: 'PROTOTYPE 002', prototype: true, world: 'spring', feel: ['wet', 'emerging'], type: 'accessory', material: ['stainless steel', 'resin'], color: ['silver', 'moss'], price: 190, currency: 'USD', sizes: ['One Size'], media: demonstrationMedia('spring-object-002'), editorialCopy: 'Demonstration fixture for an emerging, wet accessory.', designConcept: 'A modular spine in resin and steel.', constructionNotes: ['Resin body', 'Stainless steel hardware'] },
  { id: 'demo-summer-001', slug: 'prototype-summer-001', name: 'Noon Veil', objectNumber: 'PROTOTYPE 003', prototype: true, world: 'summer', feel: ['exposed', 'direct'], type: 'top', material: ['technical nylon', 'mesh'], color: ['bone', 'smoke'], price: 260, currency: 'USD', sizes: ['XS', 'S', 'M', 'L'], media: demonstrationMedia('summer-object-001'), editorialCopy: 'Demonstration fixture for an exposed, direct top.', designConcept: 'A veil that offers minimal separation from light.', constructionNotes: ['Technical nylon base', 'Mesh face panel'] },
  { id: 'demo-summer-002', slug: 'prototype-summer-002', name: 'Heat Trace', objectNumber: 'PROTOTYPE 004', prototype: true, world: 'summer', feel: ['sharp', 'overheated'], type: 'accessory', material: ['aluminum', 'elastomer'], color: ['heated silver', 'carbon'], price: 160, currency: 'USD', sizes: ['One Size'], media: demonstrationMedia('summer-object-002'), editorialCopy: 'Demonstration fixture for a sharp, overheated accessory.', designConcept: 'A heat-marked line held against the body.', constructionNotes: ['Brushed aluminum spine', 'Elastomer restraint'] },
  { id: 'demo-autumn-001', slug: 'prototype-autumn-001', name: 'Erosion Layer', objectNumber: 'PROTOTYPE 005', prototype: true, world: 'autumn', feel: ['weathered', 'residual'], type: 'outerwear', material: ['waxed cotton', 'recycled wool'], color: ['umber', 'ash'], price: 520, currency: 'USD', sizes: ['S', 'M', 'L'], media: demonstrationMedia('autumn-object-001'), editorialCopy: 'Demonstration fixture for a weathered, residual outer layer.', designConcept: 'A layered coat that records abrasion.', constructionNotes: ['Waxed cotton face', 'Recycled wool lining'] },
  { id: 'demo-autumn-002', slug: 'prototype-autumn-002', name: 'Afterlight Strap', objectNumber: 'PROTOTYPE 006', prototype: true, world: 'autumn', feel: ['receding', 'dry'], type: 'accessory', material: ['oxidized brass', 'leather'], color: ['rust', 'black'], price: 180, currency: 'USD', sizes: ['One Size'], media: demonstrationMedia('autumn-object-002'), editorialCopy: 'Demonstration fixture for a receding, dry accessory.', designConcept: 'A strap shaped by a diminishing point of light.', constructionNotes: ['Oxidized brass clasp', 'Vegetable-tanned leather'] },
  { id: 'demo-winter-001', slug: 'prototype-winter-001', name: 'Still Field', objectNumber: 'PROTOTYPE 007', prototype: true, world: 'winter', feel: ['isolated', 'severe'], type: 'bottom', material: ['wool', 'nylon'], color: ['frost', 'graphite'], price: 340, currency: 'USD', sizes: ['XS', 'S', 'M', 'L'], media: demonstrationMedia('winter-object-001'), editorialCopy: 'Demonstration fixture for an isolated, severe bottom.', designConcept: 'A quiet field of structured wool.', constructionNotes: ['Dense wool layer', 'Nylon reinforcement'] },
  { id: 'demo-winter-002', slug: 'prototype-winter-002', name: 'Cold Signal', objectNumber: 'PROTOTYPE 008', prototype: true, world: 'winter', feel: ['distant', 'mechanical'], type: 'accessory', material: ['stainless steel', 'cable'], color: ['silver', 'black'], price: 210, currency: 'USD', sizes: ['One Size'], media: demonstrationMedia('winter-object-002'), editorialCopy: 'Demonstration fixture for a distant, mechanical accessory.', designConcept: 'A cable signal kept at a deliberate distance.', constructionNotes: ['Stainless steel terminal', 'Coated cable loop'] },
]
