import { PORTAL_MATERIAL_PROFILES } from './portalMaterials'

describe('portal material profiles', () => {
  it('gives the Core and five worlds distinct material identities', () => {
    expect(Object.keys(PORTAL_MATERIAL_PROFILES)).toEqual([
      'core', 'spring', 'summer', 'autumn', 'winter', 'studio',
    ])
    expect(new Set(Object.values(PORTAL_MATERIAL_PROFILES).map((profile) => profile.highColor)).size).toBe(6)
    expect(PORTAL_MATERIAL_PROFILES.summer.emission).toBeGreaterThan(0)
    expect(PORTAL_MATERIAL_PROFILES.studio.highColor).toBe('#010204')
  })

  it('uses material behavior, not hue alone, to separate the five worlds', () => {
    expect(PORTAL_MATERIAL_PROFILES.spring.transmission).toBeGreaterThan(0.2)
    expect(PORTAL_MATERIAL_PROFILES.summer.crackStrength).toBeGreaterThan(0.7)
    expect(PORTAL_MATERIAL_PROFILES.autumn.roughness).toBeGreaterThan(0.8)
    expect(PORTAL_MATERIAL_PROFILES.winter.rimStrength).toBeGreaterThan(1)
    expect(PORTAL_MATERIAL_PROFILES.studio.rimStrength).toBeGreaterThan(1.5)
  })
})
