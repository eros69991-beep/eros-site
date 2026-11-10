import { act, Children, lazy, type ComponentProps, type ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import type { WorldSceneComponent, WorldSceneProps } from './contracts'
import { AUTUMN_EFFECTS } from '../features/worlds/autumn/autumnAtmosphere'
import {
  SCENE_EFFECT_PROFILES,
  getEffectProfileForPath,
} from './contracts'
import { PostProcessingStack, RealtimeSceneLayer } from './PostProcessingStack'

const fiberMocks = vi.hoisted(() => ({ invalidate: vi.fn(), camera: {} }))

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, dpr }: { children: ReactNode; dpr: number }) => (
    <div data-testid="scene-canvas" data-dpr={String(dpr)}>{children}</div>
  ),
  useFrame: () => undefined,
  useThree: (selector: (state: { invalidate: () => void; camera: object }) => unknown) => (
    selector({ invalidate: fiberMocks.invalidate, camera: fiberMocks.camera })
  ),
}))

vi.mock('@react-three/postprocessing', () => ({
  // 效果实例以 <primitive> 传入；测试里不渲染它们，只记录数量
  EffectComposer: ({ children }: { children: ReactNode }) => (
    <div data-testid="effect-composer" data-effect-count={String(Children.count(children))} />
  ),
}))

type FakeEffect = {
  kind: string
  blendMode: { blendFunction: number; opacity: { value: number } }
  intensity?: number
  luminanceMaterial?: { threshold: number }
  offset?: number
  darkness?: number
  mode?: number
  dispose: () => void
}

const effectMocks = vi.hoisted(() => ({ created: [] as FakeEffect[] }))

vi.mock('postprocessing', () => {
  const BlendFunction = { ADD: 0, COLOR_DODGE: 5, NORMAL: 23, SKIP: 9 }
  class FakeEffectBase {
    blendMode: { blendFunction: number; opacity: { value: number } }
    dispose = vi.fn()
    constructor(public kind: string, options: { blendFunction?: number } = {}) {
      this.blendMode = { blendFunction: options.blendFunction ?? BlendFunction.NORMAL, opacity: { value: 1 } }
      effectMocks.created.push(this as unknown as FakeEffect)
    }
  }
  return {
    BlendFunction,
    MaskFunction: { MULTIPLY_RGB_SET_ALPHA: 3 },
    BloomEffect: class extends FakeEffectBase {
      intensity = 0
      luminanceMaterial = { threshold: 0 }
      constructor(options: { blendFunction?: number }) { super('bloom', options) }
    },
    DepthOfFieldEffect: class extends FakeEffectBase {
      maskPass = { maskFunction: 0 }
      constructor(_camera: unknown, options: { blendFunction?: number }) { super('depth-of-field', options) }
    },
    NoiseEffect: class extends FakeEffectBase {
      constructor(options: { blendFunction?: number }) { super('noise', options) }
    },
    ToneMappingMode: { AGX: 7, NEUTRAL: 8 },
    ToneMappingEffect: class extends FakeEffectBase {
      mode: number | undefined
      constructor(options: { mode?: number } = {}) {
        super('tone-mapping')
        this.mode = options.mode
      }
    },
    VignetteEffect: class extends FakeEffectBase {
      offset = 0
      darkness = 0
      constructor() { super('vignette') }
    },
  }
})

const SKIP = 9

function effect(kind: string) {
  const found = [...effectMocks.created].reverse().find((candidate) => candidate.kind === kind)
  if (!found) throw new Error(`No ${kind} effect was created`)
  return found
}

const bloom = () => effect('bloom')
const noiseOpacity = () => effect('noise').blendMode.opacity.value
const vignette = () => effect('vignette')
const depthOfFieldEnabled = () => effect('depth-of-field').blendMode.blendFunction !== SKIP

beforeEach(() => {
  effectMocks.created.length = 0
})

vi.mock('../features/universe/UniverseScene', () => ({
  UniverseScene: () => null,
}))

function renderStack(quality: ComponentProps<typeof PostProcessingStack>['quality']) {
  return render(
    <PostProcessingStack profile={SCENE_EFFECT_PROFILES.universe} quality={quality} />,
  )
}

describe('PostProcessingStack', () => {
  it.each(['high', 'balanced', 'lite'] as const)(
    'keeps one EffectComposer active for the %s WebGL tier',
    (quality) => {
      renderStack(quality)
      expect(screen.getAllByTestId('effect-composer')).toHaveLength(1)
    },
  )

  it.each(['high', 'balanced', 'lite'] as const)(
    'keeps the composer and tone mapping active for quiet Product rendering at the %s tier',
    (quality) => {
      render(
        <PostProcessingStack
          profile={SCENE_EFFECT_PROFILES.winter}
          quality={quality}
          {...{ quiet: true }}
        />,
      )

      expect(screen.getByTestId('effect-composer')).toHaveAttribute('data-effect-count', '5')
      expect(effect('tone-mapping')).toBeDefined()
    },
  )

  it('tone maps with the Neutral operator so authored scene colours keep their saturation', () => {
    renderStack('high')
    // 8 = ToneMappingMode.NEUTRAL；库的默认值是 AgX（7），会把首页银河压成灰色
    expect(effect('tone-mapping').mode).toBe(8)
  })

  it('reduces Product bloom, noise, and vignette without changing the source World profile', () => {
    const worldProfile = SCENE_EFFECT_PROFILES.winter
    const normal = render(<PostProcessingStack profile={worldProfile} quality="high" />)
    const normalBloom = bloom().intensity!
    const normalNoise = noiseOpacity()
    const normalVignette = vignette().darkness!

    normal.unmount()
    render(
      <PostProcessingStack
        profile={worldProfile}
        quality="high"
        {...{ quiet: true }}
      />,
    )

    expect(bloom().intensity).toBeLessThan(normalBloom)
    expect(noiseOpacity()).toBeLessThan(normalNoise)
    expect(vignette().darkness).toBeLessThan(normalVignette)
    expect(depthOfFieldEnabled()).toBe(false)
    expect(SCENE_EFFECT_PROFILES.winter).toEqual(worldProfile)
  })

  it('applies the balanced Bloom and noise multiplier', () => {
    renderStack('balanced')

    expect(bloom().intensity).toBeCloseTo(0.32 * 0.8)
    expect(noiseOpacity()).toBeCloseTo(0.012 * 0.8)
  })

  it('keeps restrained Bloom and tone mapping in Lite while omitting depth of field', () => {
    renderStack('lite')

    expect(bloom().intensity).toBeCloseTo(0.32 * 0.55)
    expect(noiseOpacity()).toBeCloseTo(0.012 * 0.55)
    expect(effect('tone-mapping')).toBeDefined()
    expect(depthOfFieldEnabled()).toBe(false)
  })

  it('does not mount a full-frame chromatic pass for Summer', () => {
    render(<PostProcessingStack profile={SCENE_EFFECT_PROFILES.summer} quality="high" />)

    expect(effectMocks.created.map((created) => created.kind).sort()).toEqual(
      ['bloom', 'depth-of-field', 'noise', 'tone-mapping', 'vignette'],
    )
  })

  it('keeps Autumn tone neutral and removes depth of field only for Lite', () => {
    const high = render(<PostProcessingStack profile={AUTUMN_EFFECTS} quality="high" />)

    expect(depthOfFieldEnabled()).toBe(true)
    expect(bloom().intensity).toBeCloseTo(0.22)
    expect(noiseOpacity()).toBeCloseTo(0.024)

    high.unmount()
    render(<PostProcessingStack profile={AUTUMN_EFFECTS} quality="lite" />)

    expect(effect('tone-mapping')).toBeDefined()
    expect(depthOfFieldEnabled()).toBe(false)
  })

  it('preserves thresholds and vignette tuning when scaling a tier', () => {
    renderStack('lite')

    expect(bloom().luminanceMaterial!.threshold).toBe(0.78)
    expect(vignette().offset).toBe(0.24)
    expect(vignette().darkness).toBe(0.36)
  })

  it('maps every route family to its approved full-tier baseline', () => {
    expect([
      getEffectProfileForPath('/'),
      getEffectProfileForPath('/world/spring'),
      getEffectProfileForPath('/world/summer'),
      getEffectProfileForPath('/world/autumn'),
      getEffectProfileForPath('/world/winter'),
      getEffectProfileForPath('/product/demo'),
      getEffectProfileForPath('/archive'),
      getEffectProfileForPath('/studio'),
    ]).toEqual([
      { bloomIntensity: 0.32, bloomThreshold: 0.78, noiseOpacity: 0.012, vignetteOffset: 0.24, vignetteDarkness: 0.36, depthOfField: false },
      { bloomIntensity: 0.28, bloomThreshold: 0.78, noiseOpacity: 0.018, vignetteOffset: 0.22, vignetteDarkness: 0.32, depthOfField: true },
      { bloomIntensity: 0.18, bloomThreshold: 0.90, noiseOpacity: 0.008, vignetteOffset: 0.12, vignetteDarkness: 0.16, depthOfField: true },
      { bloomIntensity: 0.22, bloomThreshold: 0.82, noiseOpacity: 0.024, vignetteOffset: 0.30, vignetteDarkness: 0.44, depthOfField: true },
      { bloomIntensity: 0.16, bloomThreshold: 0.88, noiseOpacity: 0.006, vignetteOffset: 0.22, vignetteDarkness: 0.30, depthOfField: false },
      { bloomIntensity: 0.10, bloomThreshold: 0.92, noiseOpacity: 0.004, vignetteOffset: 0.16, vignetteDarkness: 0.18, depthOfField: false },
      { bloomIntensity: 0.10, bloomThreshold: 0.92, noiseOpacity: 0.004, vignetteOffset: 0.16, vignetteDarkness: 0.18, depthOfField: false },
      { bloomIntensity: 0.10, bloomThreshold: 0.92, noiseOpacity: 0.004, vignetteOffset: 0.16, vignetteDarkness: 0.18, depthOfField: false },
    ])
  })

  it('applies the effective mobile DPR cap to a high-tier Canvas', () => {
    render(
      <RealtimeSceneLayer
        profile={SCENE_EFFECT_PROFILES.universe}
        quality="high"
        mobile
        reducedMotion={false}
        onDegrade={() => undefined}
      />,
    )

    expect(screen.getByTestId('scene-canvas')).toHaveAttribute('data-dpr', '1.25')
  })

  it('caps a mobile Spring scene at Lite particles while retaining the balanced composer', () => {
    function SpringSceneProbe({ quality }: WorldSceneProps) {
      return <i data-testid="spring-scene" data-quality={quality} />
    }

    render(
      <RealtimeSceneLayer
        profile={SCENE_EFFECT_PROFILES.spring}
        worldScene={SpringSceneProbe}
        quality="balanced"
        mobile
        reducedMotion={false}
        onDegrade={() => undefined}
        scenePath="/world/spring"
      />,
    )

    expect(screen.getByTestId('spring-scene')).toHaveAttribute('data-quality', 'lite')
    expect(depthOfFieldEnabled()).toBe(true)
    expect(bloom().intensity).toBeCloseTo(0.28 * 0.8)
  })

  it('passes the document scroll ref through to the active World scene', () => {
    const progress = { current: 0.42 }
    let receivedProgress: WorldSceneProps['progress'] | undefined
    function WorldSceneProbe({ progress: sceneProgress }: WorldSceneProps) {
      receivedProgress = sceneProgress
      return null
    }

    render(
      <RealtimeSceneLayer
        profile={SCENE_EFFECT_PROFILES.spring}
        worldProgress={progress}
        worldScene={WorldSceneProbe}
        quality="balanced"
        mobile={false}
        reducedMotion={false}
        onDegrade={() => undefined}
        scenePath="/world/spring"
      />,
    )

    expect(receivedProgress).toBe(progress)
  })

  it('keeps Canvas and EffectComposer mounted while a lazy World scene is suspended', async () => {
    let resolveWorld!: (module: { default: WorldSceneComponent }) => void
    const delayedWorld = new Promise<{ default: WorldSceneComponent }>((resolve) => { resolveWorld = resolve })
    const DelayedWorld = lazy(() => delayedWorld)

    render(
      <RealtimeSceneLayer
        profile={SCENE_EFFECT_PROFILES.summer}
        worldScene={DelayedWorld}
        quality="balanced"
        mobile={false}
        reducedMotion={false}
        onDegrade={() => undefined}
        scenePath="/world/summer"
      />,
    )

    expect(screen.getAllByTestId('scene-canvas')).toHaveLength(1)
    expect(screen.getAllByTestId('effect-composer')).toHaveLength(1)

    await act(async () => {
      resolveWorld({ default: () => null })
      await delayedWorld
    })
  })
})

describe('PostProcessingStack page switches', () => {
  it('reuses the same effect instances when the page changes, so no shaders are rebuilt', () => {
    const { rerender } = render(<PostProcessingStack profile={SCENE_EFFECT_PROFILES.universe} quality="high" />)
    const createdOnMount = effectMocks.created.length
    expect(depthOfFieldEnabled()).toBe(false)

    rerender(<PostProcessingStack profile={SCENE_EFFECT_PROFILES.autumn} quality="high" />)
    expect(effectMocks.created).toHaveLength(createdOnMount)
    expect(depthOfFieldEnabled()).toBe(true)
    expect(bloom().intensity).toBeCloseTo(0.22)

    rerender(<PostProcessingStack profile={SCENE_EFFECT_PROFILES.neutral} quality="high" />)
    expect(effectMocks.created).toHaveLength(createdOnMount)
    expect(depthOfFieldEnabled()).toBe(false)
  })

  it('keeps depth of field in the pipeline and switches it off by blending, never by removing it', () => {
    const { rerender } = render(<PostProcessingStack profile={SCENE_EFFECT_PROFILES.autumn} quality="high" />)
    const composer = screen.getByTestId('effect-composer')

    rerender(<PostProcessingStack profile={SCENE_EFFECT_PROFILES.neutral} quality="high" />)

    expect(screen.getByTestId('effect-composer')).toBe(composer)
    expect(composer).toHaveAttribute('data-effect-count', '5')
    expect(depthOfFieldEnabled()).toBe(false)
  })
})
