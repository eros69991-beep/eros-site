import { demoObjects, formatUsd } from './objects'
import { filterObjects, getObject, getWorld, searchObjects } from './selectors'
import { celestials, worlds } from './worlds'
import { validateCatalog } from './validate'

const mistShell = demoObjects.find((object) => object.id === 'demo-spring-001')
if (!mistShell) throw new Error('Missing Mist Shell demonstration fixture')

const mistShellMedia = mistShell.media.find((media) => media.role === 'primary')
if (!mistShellMedia) throw new Error('Missing Mist Shell primary media')

describe('EROS domain', () => {
  it('contains exactly four ordered seasonal Worlds and one Studio body', () => {
    expect(worlds.map((world) => world.id)).toEqual(['spring', 'summer', 'autumn', 'winter'])
    expect(celestials.map((body) => body.id)).toEqual(['spring', 'summer', 'autumn', 'winter', 'studio'])
  })

  it('marks every fixture as demonstrational', () => {
    expect(demoObjects.length).toBeGreaterThanOrEqual(8)
    expect(demoObjects.every((object) => object.prototype === true)).toBe(true)
    expect(() => validateCatalog(worlds, demoObjects)).not.toThrow()
  })

  it('formats prototype prices as whole USD amounts', () => {
    expect(formatUsd(mistShell.price)).toBe('$480')
    expect(formatUsd(520)).toBe('$520')
  })

  it('rejects a non-demonstration object', () => {
    expect(() => validateCatalog(worlds, [{ ...mistShell, prototype: false }])).toThrow('Non-demonstration object: demo-spring-001')
  })

  it('rejects an object assigned to an unknown World', () => {
    expect(() => validateCatalog(worlds, [{ ...mistShell, world: 'studio' }])).toThrow('Unknown World: studio')
  })

  it('rejects duplicate object IDs', () => {
    expect(() => validateCatalog(worlds, [mistShell, { ...mistShell, slug: 'unique-slug' }])).toThrow('Duplicate object id: demo-spring-001')
  })

  it('rejects duplicate object slugs', () => {
    expect(() => validateCatalog(worlds, [mistShell, { ...mistShell, id: 'unique-id' }])).toThrow('Duplicate object slug: prototype-spring-001')
  })

  it('rejects media without a demonstrational alt prefix', () => {
    expect(() => validateCatalog(worlds, [{ ...mistShell, media: [{ ...mistShellMedia, alt: 'Product image: Mist Shell.' }] }])).toThrow(
      'Non-demonstration media: demo-spring-001',
    )
  })

  it('finds a World and object by their public identifiers', () => {
    expect(getWorld('autumn').concept).toBe('FADE')
    expect(getObject('prototype-winter-001')?.name).toBe('Still Field')
    expect(getObject('missing-object')).toBeUndefined()
  })

  it('filters with OR inside groups and AND between groups', () => {
    expect(filterObjects({ world: ['spring'], type: [], material: ['mesh', 'resin'], color: [] }).map((object) => object.name)).toEqual([
      'Mist Shell',
      'Dew Spine',
    ])
    expect(filterObjects({ world: ['spring', 'summer'], type: ['outerwear'], material: ['mesh'], color: [] }).map((object) => object.name)).toEqual([
      'Mist Shell',
    ])
  })

  it('treats empty filter groups as unrestricted', () => {
    expect(filterObjects({ world: [], type: [], material: [], color: [] })).toHaveLength(8)
  })

  it.each([
    ['  heated SILVER  ', ['Heat Trace']],
    ['PROTOTYPE 007', ['Still Field']],
    ['winter', ['Still Field', 'Cold Signal']],
    ['porous', ['Mist Shell']],
    ['outerwear', ['Mist Shell', 'Erosion Layer']],
  ])('searches trim-insensitively across catalog fields for %s', (query, expectedNames) => {
    expect(searchObjects(query).map((object) => object.name)).toEqual(expectedNames)
  })
})
