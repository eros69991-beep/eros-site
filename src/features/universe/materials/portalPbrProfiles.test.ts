import { createPortalPbrProfile, PORTAL_PBR_IDS } from './portalPbrProfiles'

describe('homepage portal PBR profiles', () => {
  it('gives every body a complete physical texture set', () => {
    expect(PORTAL_PBR_IDS).toEqual(['core', 'spring', 'summer', 'autumn', 'winter', 'studio'])

    for (const id of PORTAL_PBR_IDS) {
      const profile = createPortalPbrProfile(id)
      expect(profile.maps.color).toContain(`/materials/${id}/color.webp`)
      expect(profile.maps.normal).toContain(`/materials/${id}/normal.png`)
      expect(profile.maps.orm).toContain(`/materials/${id}/orm.webp`)
      expect(profile.maps.height).toContain(`/materials/${id}/height.webp`)
      expect(profile.maps.emissive).toContain(`/materials/${id}/emissive.webp`)
      expect(profile.displacementScale).toBeGreaterThan(0)
    }
  })

  it('separates the five worlds through physical response instead of hue alone', () => {
    const spring = createPortalPbrProfile('spring')
    const summer = createPortalPbrProfile('summer')
    const autumn = createPortalPbrProfile('autumn')
    const winter = createPortalPbrProfile('winter')
    const studio = createPortalPbrProfile('studio')

    expect(spring.transmission).toBeGreaterThan(0.25)
    expect(spring.clearcoat).toBeGreaterThan(0.5)
    expect(summer.metalness).toBeGreaterThan(0.6)
    expect(summer.emissiveIntensity).toBeGreaterThan(0)
    expect(autumn.roughness).toBeGreaterThan(0.7)
    expect(autumn.displacementScale).toBeGreaterThan(spring.displacementScale)
    expect(winter.transmission).toBeGreaterThan(0.15)
    expect(winter.thickness).toBeGreaterThan(spring.thickness)
    expect(studio.roughness).toBeGreaterThan(0.85)
    expect(studio.sheen).toBeGreaterThan(0)
  })

  it('keeps the selected state as a restrained material response', () => {
    const idle = createPortalPbrProfile('summer', false)
    const selected = createPortalPbrProfile('summer', true)

    expect(selected.emissiveIntensity).toBeGreaterThan(idle.emissiveIntensity)
    expect(selected.displacementScale).toBe(idle.displacementScale)
    expect(selected.roughness).toBe(idle.roughness)
  })
})
