import { selectHomepageLod } from './homepageAssetSelection'

describe('homepage asset LOD selection', () => {
  it('keeps mobile light and reserves detail for the Core and selected desktop world', () => {
    expect(selectHomepageLod({ core: true, mobile: false, quality: 'high', selected: true })).toBe('high')
    expect(selectHomepageLod({ core: false, mobile: false, quality: 'high', selected: false })).toBe('low')
    expect(selectHomepageLod({ core: false, mobile: false, quality: 'balanced', selected: true })).toBe('medium')
    expect(selectHomepageLod({ core: true, mobile: true, quality: 'high', selected: true })).toBe('low')
  })
})
