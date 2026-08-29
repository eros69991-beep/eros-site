import { Color, FogExp2, Scene } from 'three'
import {
  createSummerExposureController,
  getSummerBoundaryChromaticStrength,
  getSummerRuntimeFrame,
  installSummerSceneEnvironment,
} from './summerSceneRuntime'

describe('Summer scene runtime', () => {
  it('applies the latest progress to renderer exposure and hard-shadow opacity without a React rerender', () => {
    const early = getSummerRuntimeFrame(0, false, 'high', 12)
    const late = getSummerRuntimeFrame(1, false, 'high', 12)
    const renderer = { toneMappingExposure: 0.93 }
    const exposure = createSummerExposureController(renderer)

    exposure.apply(early.atmosphere)
    expect(renderer.toneMappingExposure).toBe(early.atmosphere.exposure)

    exposure.apply(late.atmosphere)
    expect(renderer.toneMappingExposure).toBe(late.atmosphere.exposure)
    expect(late.atmosphere.exposure).toBeGreaterThan(early.atmosphere.exposure)
    expect(late.shadowOpacity).toBeLessThan(early.shadowOpacity)

    exposure.restore()
    expect(renderer.toneMappingExposure).toBe(0.93)
  })

  it('installs Summer background and fog on the Three scene and restores the prior environment', () => {
    const scene = new Scene()
    const previousBackground = new Color('#101112')
    const previousFog = new FogExp2('#101112', 0.04)
    scene.background = previousBackground
    scene.fog = previousFog

    const restore = installSummerSceneEnvironment(scene)

    expect(scene.background).toBeInstanceOf(Color)
    expect((scene.background as Color).getStyle()).toBe('rgb(229,228,222)')
    expect(scene.fog).toBeInstanceOf(FogExp2)
    expect((scene.fog as FogExp2).density).toBeCloseTo(0.026)

    restore()
    expect(scene.background).toBe(previousBackground)
    expect(scene.fog).toBe(previousFog)
  })

  it('does not restore Summer environment over a successor scene owner', () => {
    const scene = new Scene()
    const restore = installSummerSceneEnvironment(scene)
    const successorBackground = new Color('#29333A')
    const successorFog = new FogExp2('#29333A', 0.018)

    scene.background = successorBackground
    scene.fog = successorFog
    restore()

    expect(scene.background).toBe(successorBackground)
    expect(scene.fog).toBe(successorFog)
  })

  it('does not restore Summer exposure over a successor renderer owner', () => {
    const renderer = { toneMappingExposure: 0.93 }
    const exposure = createSummerExposureController(renderer)
    exposure.apply(getSummerRuntimeFrame(0.5, false, 'high', 12).atmosphere)
    renderer.toneMappingExposure = 1.02

    exposure.restore()

    expect(renderer.toneMappingExposure).toBe(1.02)
  })

  it.each([
    ['high', false, 0.0007],
    ['balanced', false, 0.0005],
    ['lite', false, 0],
    ['high', true, 0],
  ] as const)('keeps chromatic separation local and off for %s reduced=%s', (quality, reducedMotion, expected) => {
    expect(getSummerBoundaryChromaticStrength(quality, reducedMotion)).toBe(expected)
  })
})
