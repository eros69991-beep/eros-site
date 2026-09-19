import { describe, expect, it } from 'vitest'
import { PerspectiveCamera, Vector3 } from 'three'
import {
  HOME_BODY_LAYOUT,
  HOME_CAMERA_PRESETS,
  getHomeCameraPreset,
  type HomeBodyId,
} from './homeComposition'

function projectBody(id: HomeBodyId, width: number, height: number) {
  const preset = getHomeCameraPreset(width, height)
  const camera = new PerspectiveCamera(preset.fov, width / height, 0.1, 100)
  camera.position.set(...preset.position)
  camera.lookAt(...preset.target)
  camera.updateMatrixWorld()
  camera.updateProjectionMatrix()

  const body = HOME_BODY_LAYOUT[id]
  const projected = new Vector3(...body.position).project(camera)
  const distance = camera.position.distanceTo(new Vector3(...body.position))
  const apparentRadius = body.scale / distance
  return { apparentRadius, x: projected.x, y: projected.y, z: projected.z }
}

describe('homepage inside-galaxy composition', () => {
  it.each([
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [390, 844],
    [360, 800],
  ])('keeps all five destinations and the Core inside the authored frame at %ix%i', (width, height) => {
    for (const id of Object.keys(HOME_BODY_LAYOUT) as HomeBodyId[]) {
      const body = projectBody(id, width, height)
      expect(body.x, id).toBeGreaterThan(-0.98)
      expect(body.x, id).toBeLessThan(0.98)
      expect(body.y, id).toBeGreaterThan(-0.98)
      expect(body.y, id).toBeLessThan(0.98)
      expect(body.z, id).toBeGreaterThan(-1)
      expect(body.z, id).toBeLessThan(1)
    }
  })

  it('makes Winter the foreground anchor while the Core remains a distant convergence point', () => {
    const winter = projectBody('winter', 1440, 900)
    const core = projectBody('core', 1440, 900)
    const otherWorlds = (['spring', 'summer', 'autumn', 'studio'] as const)
      .map((id) => projectBody(id, 1440, 900))

    expect(winter.x).toBeLessThan(-0.35)
    expect(winter.y).toBeLessThan(-0.18)
    expect(winter.apparentRadius).toBeGreaterThan(Math.max(...otherWorlds.map((body) => body.apparentRadius)) * 1.65)
    expect(core.x).toBeGreaterThan(0.15)
    expect(core.y).toBeGreaterThan(0.12)
    expect(core.apparentRadius).toBeLessThan(Math.min(...otherWorlds.map((body) => body.apparentRadius)))
  })

  it('uses dedicated camera presets instead of shrinking the desktop frame for phones', () => {
    expect(getHomeCameraPreset(1440, 900)).toBe(HOME_CAMERA_PRESETS.desktop)
    expect(getHomeCameraPreset(768, 1024)).toBe(HOME_CAMERA_PRESETS.tabletPortrait)
    expect(getHomeCameraPreset(390, 844)).toBe(HOME_CAMERA_PRESETS.mobile)
  })
})
