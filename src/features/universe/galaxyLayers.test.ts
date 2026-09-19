import { describe, expect, it } from 'vitest'
import { GALAXY_BACKDROP_URL, GALAXY_LAYERS, getGalaxyLayerSeed } from './galaxyLayers'

describe('layered homepage galaxy', () => {
  it('uses a planet-free homepage-only backdrop asset', () => {
    expect(GALAXY_BACKDROP_URL).toMatch(/^\/assets\/homepage\//)
  })

  it('uses stable far, middle, and near dust layers with real depth separation', () => {
    expect(GALAXY_LAYERS.map((layer) => layer.id)).toEqual(['far', 'middle', 'near'])
    expect(GALAXY_LAYERS[0]!.position[2]).toBeLessThan(GALAXY_LAYERS[1]!.position[2])
    expect(GALAXY_LAYERS[1]!.position[2]).toBeLessThan(GALAXY_LAYERS[2]!.position[2])
    expect(GALAXY_LAYERS.every((layer) => layer.rotation > 0)).toBe(true)
  })

  it('keeps the bright spine subordinate to the worlds', () => {
    expect(Math.max(...GALAXY_LAYERS.map((layer) => layer.opacity))).toBeLessThanOrEqual(0.42)
    expect(GALAXY_LAYERS[0]!.height).toBeGreaterThan(GALAXY_LAYERS[1]!.height)
  })

  it('derives deterministic, distinct seeds for every layer', () => {
    const first = GALAXY_LAYERS.map((layer) => getGalaxyLayerSeed(layer.id))
    const second = GALAXY_LAYERS.map((layer) => getGalaxyLayerSeed(layer.id))

    expect(first).toEqual(second)
    expect(new Set(first).size).toBe(GALAXY_LAYERS.length)
  })
})
