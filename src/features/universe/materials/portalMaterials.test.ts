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
})
