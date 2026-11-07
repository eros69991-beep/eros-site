import { act, lazy, type ComponentProps, type ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import type { WorldSceneComponent, WorldSceneProps } from './contracts'
import { AUTUMN_EFFECTS } from '../features/worlds/autumn/autumnAtmosphere'
import {
  SCENE_EFFECT_PROFILES,
  getEffectProfileForPath,
} from './contracts'
import { PostProcessingStack, RealtimeSceneLayer } from './PostProcessingStack'

const fiberMocks = vi.hoisted(() => ({ invalidate: vi.fn() }))

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, dpr }: { children: ReactNode; dpr: number }) => (
    <div data-testid="scene-canvas" data-dpr={String(dpr)}>{children}</div>
  ),
  useFrame: () => undefined,
  useThree: (selector: (state: { invalidate: () => void }) => unknown) => (
    selector({ invalidate: fiberMocks.invalidate })
  ),
}))

vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: { children: ReactNode }) => (
    <div data-testid="effect-composer">{children}</div>
  ),
  Bloom: (props: Record<string, unknown>) => (
    <i
      data-testid="bloom"
      data-intensity={String(props.intensity)}
      data-threshold={String(props.luminanceThreshold)}
    />
  ),
  DepthOfField: () => <i data-testid="depth-of-field" />,
  Noise: (props: Record<string, unknown>) => (
    <i data-testid="noise" data-opacity={String(props.opacity)} />
  ),
  ToneMapping: () => <i data-testid="tone-mapping" />,
  Vignette: (props: Record<string, unknown>) => (
    <i
      data-testid="vignette"
      data-offset={String(props.offset)}
      data-darkness={String(props.darkness)}
    />
  ),
}))

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

      expect(screen.getByTestId('effect-composer')).toBeInTheDocument()
      expect(screen.getByTestId('tone-mapping')).toBeInTheDocument()
    },
  )

  it('reduces Product bloom, noise, and vignette without changing the source World profile', () => {
    const worldProfile = SCENE_EFFECT_PROFILES.winter
    const normal = render(<PostProcessingStack profile={worldProfile} quality="high" />)
    const normalBloom = Number(screen.getByTestId('bloom').dataset.intensity)
    const normalNoise = Number(screen.getByTestId('noise').dataset.opacity)
    const normalVignette = Number(screen.getByTestId('vignette').dataset.darkness)

    normal.unmount()
    render(
      <PostProcessingStack
        profile={worldProfile}
        quality="high"
        {...{ quiet: true }}
      />,
    )

    expect(Number(screen.getByTestId('bloom').dataset.intensity)).toBeLessThan(normalBloom)
    expect(Number(screen.getByTestId('noise').dataset.opacity)).toBeLessThan(normalNoise)
    expect(Number(screen.getByTestId('vignette').dataset.darkness)).toBeLessThan(normalVignette)
    expect(screen.queryByTestId('depth-of-field')).not.toBeInTheDocument()
    expect(SCENE_EFFECT_PROFILES.winter).toEqual(worldProfile)
  })

  it('applies the balanced Bloom and noise multiplier', () => {
    renderStack('balanced')

    expect(Number(screen.getByTestId('bloom').dataset.intensity)).toBeCloseTo(0.32 * 0.8)
    expect(Number(screen.getByTestId('noise').dataset.opacity)).toBeCloseTo(0.012 * 0.8)
  })

  it('keeps restrained Bloom and tone mapping in Lite while omitting depth of field', () => {
    renderStack('lite')

    expect(Number(screen.getByTestId('bloom').dataset.intensity)).toBeCloseTo(0.32 * 0.55)
    expect(Number(screen.getByTestId('noise').dataset.opacity)).toBeCloseTo(0.012 * 0.55)
    expect(screen.getByTestId('tone-mapping')).toBeInTheDocument()
    expect(screen.queryByTestId('depth-of-field')).not.toBeInTheDocument()
  })

  it('does not mount a full-frame chromatic pass for Summer', () => {
    render(<PostProcessingStack profile={SCENE_EFFECT_PROFILES.summer} quality="high" />)

    expect(screen.queryByTestId('chromatic-aberration')).not.toBeInTheDocument()
    expect(screen.getByTestId('tone-mapping')).toBeInTheDocument()
    expect(screen.getByTestId('bloom')).toBeInTheDocument()
  })

  it('keeps Autumn tone neutral and removes depth of field only for Lite', () => {
    const high = render(<PostProcessingStack profile={AUTUMN_EFFECTS} quality="high" />)

    expect(screen.getByTestId('tone-mapping')).toBeInTheDocument()
    expect(screen.getByTestId('depth-of-field')).toBeInTheDocument()
    expect(Number(screen.getByTestId('bloom').dataset.intensity)).toBeCloseTo(0.22)
    expect(Number(screen.getByTestId('noise').dataset.opacity)).toBeCloseTo(0.024)

    high.unmount()
    render(<PostProcessingStack profile={AUTUMN_EFFECTS} quality="lite" />)

    expect(screen.getByTestId('tone-mapping')).toBeInTheDocument()
    expect(screen.queryByTestId('depth-of-field')).not.toBeInTheDocument()
    expect(screen.queryByTestId('chromatic-aberration')).not.toBeInTheDocument()
  })

  it('preserves thresholds and vignette tuning when scaling a tier', () => {
    renderStack('lite')

    expect(screen.getByTestId('bloom')).toHaveAttribute('data-threshold', '0.78')
    expect(screen.getByTestId('vignette')).toHaveAttribute('data-offset', '0.24')
    expect(screen.getByTestId('vignette')).toHaveAttribute('data-darkness', '0.36')
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
      { bloomIntensity: 0.32, bloomThreshold: 0.78, noiseOpacity: 0.012, vignetteOffset: 0.24, vignetteDarkness: 0.36, depthOfField: true },
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
    expect(screen.getByTestId('depth-of-field')).toBeInTheDocument()
    expect(Number(screen.getByTestId('bloom').dataset.intensity)).toBeCloseTo(0.28 * 0.8)
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

describe('PostProcessingStack depth-of-field switches', () => {
  it('rebuilds the composer when depth of field turns off, so a world frame cannot linger behind Archive', () => {
    const { rerender } = render(<PostProcessingStack profile={SCENE_EFFECT_PROFILES.autumn} quality="high" />)
    const worldComposer = screen.getByTestId('effect-composer')
    expect(screen.getByTestId('depth-of-field')).toBeInTheDocument()

    rerender(<PostProcessingStack profile={SCENE_EFFECT_PROFILES.neutral} quality="high" />)

    const archiveComposer = screen.getByTestId('effect-composer')
    expect(archiveComposer).not.toBe(worldComposer)
    expect(screen.queryByTestId('depth-of-field')).not.toBeInTheDocument()
  })

  it('keeps the same composer when moving between profiles that both use depth of field', () => {
    const { rerender } = render(<PostProcessingStack profile={SCENE_EFFECT_PROFILES.autumn} quality="high" />)
    const autumnComposer = screen.getByTestId('effect-composer')

    rerender(<PostProcessingStack profile={SCENE_EFFECT_PROFILES.spring} quality="high" />)

    expect(screen.getByTestId('effect-composer')).toBe(autumnComposer)
  })
})
