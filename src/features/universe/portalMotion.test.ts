import { PORTAL_ORBITS, getPortalBodyTransform } from './portalMotion'

describe('portal orbital motion', () => {
  it('uses five distinct slow periods in the approved 180–360 second range', () => {
    const periods = Object.values(PORTAL_ORBITS).map((orbit) => orbit.periodSeconds)

    expect(new Set(periods).size).toBe(5)
    expect(Math.min(...periods)).toBeGreaterThanOrEqual(180)
    expect(Math.max(...periods)).toBeLessThanOrEqual(360)
  })

  it('moves unselected bodies while holding selected and reduced-motion bodies stable', () => {
    const movingStart = getPortalBodyTransform('summer', 0, { mobile: false, reducedMotion: false, selected: false })
    const movingLater = getPortalBodyTransform('summer', 40, { mobile: false, reducedMotion: false, selected: false })
    const selectedStart = getPortalBodyTransform('summer', 0, { mobile: false, reducedMotion: false, selected: true })
    const selectedLater = getPortalBodyTransform('summer', 40, { mobile: false, reducedMotion: false, selected: true })
    const staticLater = getPortalBodyTransform('summer', 40, { mobile: false, reducedMotion: true, selected: false })

    expect(movingLater.position).not.toEqual(movingStart.position)
    expect(selectedLater.position).toEqual(selectedStart.position)
    expect(staticLater.position).toEqual(movingStart.position)
  })
})
