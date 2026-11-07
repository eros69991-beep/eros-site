import { describe, expect, it } from 'vitest'
import { PORTAL_PBR_IDS } from './portalPbrProfiles'
import { PLANET_SURFACE_GLSL, PROCEDURAL_PLANET_SPECS } from './proceduralPlanet'
import { getPlanetBakeWidth } from './planetGeometry'

describe('procedural planets', () => {
  it('gives every homepage body a surface branch in the shader', () => {
    for (const id of PORTAL_PBR_IDS) {
      const { define } = PROCEDURAL_PLANET_SPECS[id]
      if (id === 'core') continue // Core 走 #else 分支
      expect(PLANET_SURFACE_GLSL).toContain(`defined(${define})`)
    }
  })

  it('bakes the close foreground body sharper and halves textures on mobile', () => {
    expect(getPlanetBakeWidth('winter', false)).toBe(2048)
    expect(getPlanetBakeWidth('winter', true)).toBe(1024)
    expect(getPlanetBakeWidth('spring', false)).toBe(1024)
    expect(getPlanetBakeWidth('spring', true)).toBe(512)
    expect(getPlanetBakeWidth('core', false)).toBe(512)
  })
})
