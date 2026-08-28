import type { ComponentProps, ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import type { WorldSceneProps } from './contracts'
import {
  SCENE_EFFECT_PROFILES,
  getEffectProfileForPath,
} from './contracts'
import { PostProcessingStack, RealtimeSceneLayer } from './PostProcessingStack'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, dpr }: { children: ReactNode; dpr: number }) => (
    <div data-testid="scene-canvas" data-dpr={String(dpr)}>{children}</div>
  ),
  useFrame: () => undefined,
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
})
