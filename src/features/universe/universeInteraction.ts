export interface ScreenPointer {
  x: number
  y: number
}

export interface ViewportSize {
  width: number
  height: number
}

const MAX_DESKTOP_PARALLAX_CSS_PIXELS = 8
const MAX_MOBILE_OBSERVATION_ANGLE = 0.18

export function getDesktopParallaxTarget(
  pointer: ScreenPointer,
  viewport: ViewportSize,
  fovDegrees: number,
  cameraDistance: number,
): ScreenPointer {
  const worldUnitsPerCssPixel = (
    2 * cameraDistance * Math.tan((fovDegrees * Math.PI) / 360)
  ) / Math.max(viewport.height, 1)
  const bound = MAX_DESKTOP_PARALLAX_CSS_PIXELS * worldUnitsPerCssPixel

  return {
    x: Math.max(-1, Math.min(1, pointer.x)) * bound,
    y: Math.max(-1, Math.min(1, pointer.y)) * bound,
  }
}

export function getMobileObservationAngle(
  startingAngle: number,
  startingX: number,
  currentX: number,
  viewportWidth: number,
): number {
  const dragRatio = (currentX - startingX) / Math.max(viewportWidth, 1)
  return Math.max(
    -MAX_MOBILE_OBSERVATION_ANGLE,
    Math.min(MAX_MOBILE_OBSERVATION_ANGLE, startingAngle + dragRatio * MAX_MOBILE_OBSERVATION_ANGLE),
  )
}
