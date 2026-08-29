import { sceneRegistry } from '../sceneRegistry'
import { getAutumnAtmosphere } from '../autumn/autumnAtmosphere'
import { getSpringAtmosphere } from '../spring/springAtmosphere'
import { getSummerAtmosphere } from '../summer/summerAtmosphere'

interface WinterAtmosphere {
  iceDustSpeed: number
  particleCount: number
  stillnessInterval: number
}

interface WinterRuntimeFrame {
  frostShift: number
  iceDustOffset: number
}

interface WinterSceneModule {
  WINTER_EFFECTS: Record<string, unknown>
  WINTER_PALETTE: { environment: string }
  getWinterAtmosphere(progress: number, reducedMotion: boolean, quality: 'high' | 'balanced' | 'lite'): WinterAtmosphere
  getWinterRuntimeFrame(progress: number, reducedMotion: boolean, quality: 'high' | 'balanced' | 'lite', time: number): WinterRuntimeFrame
  installWinterSceneEnvironment(scene: import('three').Scene): () => void
}

async function getWinterSceneModule(): Promise<WinterSceneModule | null> {
  try {
    const modulePath = './winterAtmosphere'
    return await import(/* @vite-ignore */ modulePath) as WinterSceneModule
  } catch {
    return null
  }
}

function readHexChannels(color: string) {
  const value = color.slice(1)
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ] as const
}

describe('Winter atmosphere', () => {
  it('keeps ice-dust motion below every other World at the same quality', async () => {
    const winterScene = await getWinterSceneModule()

    expect(winterScene).not.toBeNull()
    if (!winterScene) return
    const winter = winterScene.getWinterAtmosphere(0.5, false, 'high')
    expect(winter.iceDustSpeed).toBeLessThan(getSpringAtmosphere(1, false, 'high').verticalDrift)
    expect(winter.iceDustSpeed).toBeLessThan(getSummerAtmosphere(1, false, 'high').airDrift)
    expect(winter.iceDustSpeed).toBeLessThan(getAutumnAtmosphere(1, false, 'high').dustSpeed)
  })

  it('locks every continuous transform when motion is reduced', async () => {
    const winterScene = await getWinterSceneModule()

    expect(winterScene).not.toBeNull()
    if (!winterScene) return
    const atmosphere = winterScene.getWinterAtmosphere(0.8, true, 'balanced')
    const earlyAtmosphere = winterScene.getWinterAtmosphere(0, true, 'balanced')
    const lateAtmosphere = winterScene.getWinterAtmosphere(1, true, 'balanced')
    const early = winterScene.getWinterRuntimeFrame(0.8, true, 'balanced', 12)
    const late = winterScene.getWinterRuntimeFrame(0.8, true, 'balanced', 1_000_000)

    expect(atmosphere.iceDustSpeed).toBe(0)
    expect(early.iceDustOffset).toBe(0)
    expect(late.iceDustOffset).toBe(0)
    expect(early.frostShift).toBe(late.frostShift)
    expect(earlyAtmosphere).toEqual(lateAtmosphere)
  })

  it.each([
    ['high', 1200],
    ['balanced', 800],
    ['lite', 400],
  ] as const)('uses the approved %s ice-dust budget', async (quality, particleCount) => {
    const winterScene = await getWinterSceneModule()

    expect(winterScene).not.toBeNull()
    if (!winterScene) return
    expect(winterScene.getWinterAtmosphere(0.5, false, quality).particleCount).toBe(particleCount)
  })

  it('stays in cold neutral greys without a blue-neon global tint', async () => {
    const winterScene = await getWinterSceneModule()

    expect(winterScene).not.toBeNull()
    if (!winterScene) return
    const [red, green, blue] = readHexChannels(winterScene.WINTER_PALETTE.environment)
    expect(Math.max(red, green, blue) - Math.min(red, green, blue)).toBeLessThanOrEqual(14)
    expect(blue - red).toBeLessThanOrEqual(14)
    expect(winterScene.WINTER_EFFECTS).not.toHaveProperty('globalTint')
    expect(winterScene.WINTER_EFFECTS).not.toHaveProperty('chromaticAberration')
  })

  it('uses long cycles with a discrete interval of complete stillness', async () => {
    const winterScene = await getWinterSceneModule()

    expect(winterScene).not.toBeNull()
    if (!winterScene) return
    const atmosphere = winterScene.getWinterAtmosphere(0.5, false, 'high')
    const active = winterScene.getWinterRuntimeFrame(0.5, false, 'high', 24)
    const still = winterScene.getWinterRuntimeFrame(0.5, false, 'high', 150)
    expect(atmosphere.stillnessInterval).toBeGreaterThanOrEqual(48)
    expect(active.iceDustOffset).not.toBe(0)
    expect(still.iceDustOffset).toBe(0)
  })

  it('owns only its installed scene environment and yields to a successor owner', async () => {
    const { Color, FogExp2, Scene } = await import('three')
    const winterScene = await getWinterSceneModule()
    const scene = new Scene()
    const previousBackground = new Color('#111214')
    const previousFog = new FogExp2('#111214', 0.04)
    scene.background = previousBackground
    scene.fog = previousFog

    expect(winterScene).not.toBeNull()
    if (!winterScene) return
    const restore = winterScene.installWinterSceneEnvironment(scene)

    expect(scene.background).toBeInstanceOf(Color)
    expect(scene.fog).toBeInstanceOf(FogExp2)

    restore()
    expect(scene.background).toBe(previousBackground)
    expect(scene.fog).toBe(previousFog)
  })

  it('does not restore Winter environment over a successor scene owner', async () => {
    const { Color, FogExp2, Scene } = await import('three')
    const winterScene = await getWinterSceneModule()
    const scene = new Scene()

    expect(winterScene).not.toBeNull()
    if (!winterScene) return
    const restore = winterScene.installWinterSceneEnvironment(scene)
    const successorBackground = new Color('#2A2E31')
    const successorFog = new FogExp2('#2A2E31', 0.018)
    scene.background = successorBackground
    scene.fog = successorFog

    restore()

    expect(scene.background).toBe(successorBackground)
    expect(scene.fog).toBe(successorFog)
  })

  it('registers Winter lazily with its local postprocessing profile', async () => {
    const winterScene = await getWinterSceneModule()
    const descriptor = sceneRegistry.winter

    expect(winterScene).not.toBeNull()
    if (!winterScene) return
    expect(descriptor?.effects).toEqual(winterScene.WINTER_EFFECTS)
    await expect(descriptor?.load()).resolves.toMatchObject({ default: expect.any(Function) })
  })
})
