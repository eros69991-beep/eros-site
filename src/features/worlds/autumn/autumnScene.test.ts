import { Color, FogExp2, Scene } from 'three'
import { sceneRegistry } from '../sceneRegistry'
import {
  AUTUMN_DUST_OFFSET_LIMIT,
  AUTUMN_EFFECTS,
  AUTUMN_PALETTE,
  getAutumnAtmosphere,
  getAutumnDustOffset,
} from './autumnAtmosphere'
import {
  getAutumnRuntimeFrame,
  installAutumnSceneEnvironment,
} from './autumnSceneRuntime'

function readHexChannels(color: string) {
  const value = color.slice(1)
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ] as const
}

describe('Autumn atmosphere', () => {
  it('recedes from residual warmth into a lower sun, longer shadow, and weathered surface', () => {
    const residual = getAutumnAtmosphere(0, false, 'high')
    const dusk = getAutumnAtmosphere(1, false, 'high')

    expect(dusk.sunElevation).toBeLessThan(residual.sunElevation)
    expect(dusk.warmLightContribution).toBeLessThan(residual.warmLightContribution)
    expect(dusk.warmLightContribution).toBeGreaterThan(0)
    expect(dusk.shadowLength).toBeGreaterThan(residual.shadowLength)
    expect(dusk.surfaceWeathering).toBeGreaterThan(residual.surfaceWeathering)
  })

  it('clamps scroll progress before mapping the visual clock', () => {
    expect(getAutumnAtmosphere(-10, false, 'balanced')).toEqual(
      getAutumnAtmosphere(0, false, 'balanced'),
    )
    expect(getAutumnAtmosphere(10, false, 'balanced')).toEqual(
      getAutumnAtmosphere(1, false, 'balanced'),
    )
  })

  it('stops lateral dust when motion is reduced', () => {
    expect(getAutumnAtmosphere(0.6, true, 'balanced').dustSpeed).toBe(0)
  })

  it.each([
    ['high', 2400],
    ['balanced', 1400],
    ['lite', 800],
  ] as const)('uses the exact %s particle budget', (quality, particleCount) => {
    expect(getAutumnAtmosphere(0.5, false, quality).particleCount).toBe(particleCount)
  })

  it('keeps environmental color neutral-warm and localizes rust to materials and light', () => {
    const [environmentRed, environmentGreen, environmentBlue] = readHexChannels(
      AUTUMN_PALETTE.environment,
    )
    const [warmRed, warmGreen, warmBlue] = readHexChannels(AUTUMN_PALETTE.warmLight)

    expect(Math.max(environmentRed, environmentGreen, environmentBlue)
      - Math.min(environmentRed, environmentGreen, environmentBlue)).toBeLessThanOrEqual(12)
    expect(environmentRed).toBeGreaterThan(environmentBlue)
    expect(warmRed).toBeGreaterThan(warmGreen)
    expect(warmGreen).toBeGreaterThan(warmBlue)
    expect(AUTUMN_EFFECTS).not.toHaveProperty('globalTint')
  })

  it('keeps dust and erosion motion finite and bounded over long sessions', () => {
    const frames = [0, 47, 1_000_000, 1_000_000_000].map((time) => (
      getAutumnRuntimeFrame(0.8, false, 'high', time)
    ))

    expect(frames.every((frame) => Number.isFinite(frame.dustOffset))).toBe(true)
    expect(frames.every((frame) => Math.abs(frame.dustOffset) <= AUTUMN_DUST_OFFSET_LIMIT)).toBe(true)
    expect(frames.every((frame) => frame.erosionPhase >= 0 && frame.erosionPhase <= 1)).toBe(true)
  })

  it('samples the latest mutable progress inputs into each runtime frame', () => {
    const early = getAutumnRuntimeFrame(0, false, 'balanced', 23)
    const late = getAutumnRuntimeFrame(1, false, 'balanced', 23)

    expect(late.atmosphere.shadowLength).toBeGreaterThan(early.atmosphere.shadowLength)
    expect(late.atmosphere.warmLightContribution).toBeLessThan(
      early.atmosphere.warmLightContribution,
    )
    expect(late.atmosphere.surfaceWeathering).toBeGreaterThan(
      early.atmosphere.surfaceWeathering,
    )
  })

  it('freezes all continuous runtime displacement for reduced motion', () => {
    const early = getAutumnRuntimeFrame(0.5, true, 'high', 12)
    const late = getAutumnRuntimeFrame(0.5, true, 'high', 1_000_000)

    expect(early.dustOffset).toBe(0)
    expect(late.dustOffset).toBe(0)
    expect(early.erosionPhase).toBe(late.erosionPhase)
  })

  it('recycles the pure lateral dust transform inside its scene boundary', () => {
    const offsets = [0, 53, 1_000_000, 1_000_000_000].map((time) => (
      getAutumnDustOffset(time, 0.045)
    ))

    expect(offsets.every(Number.isFinite)).toBe(true)
    expect(offsets.every((offset) => Math.abs(offset) <= AUTUMN_DUST_OFFSET_LIMIT)).toBe(true)
  })

  it('installs Autumn background and fog and restores the prior environment', () => {
    const scene = new Scene()
    const previousBackground = new Color('#101112')
    const previousFog = new FogExp2('#101112', 0.04)
    scene.background = previousBackground
    scene.fog = previousFog

    const restore = installAutumnSceneEnvironment(scene)

    expect(scene.background).toBeInstanceOf(Color)
    expect((scene.background as Color).getStyle()).toBe('rgb(48,44,42)')
    expect(scene.fog).toBeInstanceOf(FogExp2)

    restore()
    expect(scene.background).toBe(previousBackground)
    expect(scene.fog).toBe(previousFog)
  })

  it('does not restore Autumn environment over a successor scene owner', () => {
    const scene = new Scene()
    const restore = installAutumnSceneEnvironment(scene)
    const successorBackground = new Color('#AEB7B5')
    const successorFog = new FogExp2('#AEB7B5', 0.018)

    scene.background = successorBackground
    scene.fog = successorFog
    restore()

    expect(scene.background).toBe(successorBackground)
    expect(scene.fog).toBe(successorFog)
  })

  it('registers Autumn as a lazy scene with the approved localized effects', async () => {
    const descriptor = sceneRegistry.autumn

    expect(descriptor?.effects).toEqual(AUTUMN_EFFECTS)
    await expect(descriptor?.load()).resolves.toMatchObject({ default: expect.any(Function) })
  })
})
