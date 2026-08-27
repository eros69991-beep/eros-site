import {
  getDesktopParallaxTarget,
  getMobileObservationAngle,
} from './universeInteraction'

describe('Universe interaction bounds', () => {
  it('caps desktop parallax at eight CSS-pixel equivalents at the desktop composition', () => {
    const target = getDesktopParallaxTarget({ x: 1, y: -1 }, { width: 1440, height: 900 }, 42, 24)
    const worldUnitsPerCssPixel = (2 * 24 * Math.tan((42 * Math.PI) / 360)) / 900

    expect(Math.abs(target.x / worldUnitsPerCssPixel)).toBeLessThanOrEqual(8)
    expect(Math.abs(target.y / worldUnitsPerCssPixel)).toBeLessThanOrEqual(8)
  })

  it('uses only a bounded horizontal drag for mobile observation', () => {
    const initial = getMobileObservationAngle(0, 120, 120, 390)
    const draggedRight = getMobileObservationAngle(0, 120, 900, 390)
    const draggedLeft = getMobileObservationAngle(0, 120, -660, 390)

    expect(initial).toBe(0)
    expect(draggedRight).toBeGreaterThan(0)
    expect(draggedRight).toBeLessThanOrEqual(0.18)
    expect(draggedLeft).toBeGreaterThanOrEqual(-0.18)
  })
})
