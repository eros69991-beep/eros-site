import { EffectComposer } from '@react-three/postprocessing'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  BlendFunction,
  BloomEffect,
  DepthOfFieldEffect,
  MaskFunction,
  NoiseEffect,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from 'postprocessing'
import { Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import type { Camera } from 'three'
import type { QualityTier } from '../domain/types'
import styles from '../features/fallback/fallback.module.css'
import { UniverseScene } from '../features/universe/UniverseScene'
import { createQualityMonitor, getEffectiveSceneBudget } from './quality'
import { isSceneTimeFrozen, subscribeSceneClock } from './sceneClock'
import {
  resolveEffectProfile,
  type EffectProfile,
  type WorldSceneComponent,
} from './contracts'

type RealtimeQualityTier = Exclude<QualityTier, 'static'>

interface PostProcessingStackProps {
  profile: EffectProfile
  quality: RealtimeQualityTier
  quiet?: boolean
}

interface StableEffects {
  toneMapping: ToneMappingEffect
  bloom: BloomEffect
  noise: NoiseEffect
  vignette: VignetteEffect
  depthOfField: DepthOfFieldEffect
}

function createStableEffects(camera: Camera): StableEffects {
  const depthOfField = new DepthOfFieldEffect(camera, { focusDistance: 0.02, focalLength: 0.025, bokehScale: 1.5 })
  // 与 @react-three/postprocessing 的 <DepthOfField> 一致（maskPass 不在类型声明里）
  ;(depthOfField as unknown as { maskPass: { maskFunction: MaskFunction } }).maskPass.maskFunction = MaskFunction.MULTIPLY_RGB_SET_ALPHA
  return {
    // 库的默认模式是 AgX，会把饱和度和高光一起压低，银河的暖金银心和冷色旋臂被压成灰米色。
    // Neutral 基本原样保留着色器里写的颜色，只在接近过曝时才压高光。
    toneMapping: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    bloom: new BloomEffect({ blendFunction: BlendFunction.ADD, mipmapBlur: true, luminanceSmoothing: 0.12 }),
    noise: new NoiseEffect({ blendFunction: BlendFunction.COLOR_DODGE }),
    vignette: new VignetteEffect(),
    depthOfField,
  }
}

function applyEffectSettings(effects: StableEffects, settings: ReturnType<typeof resolveEffectProfile>) {
  effects.bloom.intensity = settings.bloomIntensity
  effects.bloom.luminanceMaterial.threshold = settings.bloomThreshold
  effects.noise.blendMode.opacity.value = settings.noiseOpacity
  effects.vignette.offset = settings.vignetteOffset
  effects.vignette.darkness = settings.vignetteDarkness
  const dofBlend = settings.depthOfField ? BlendFunction.NORMAL : BlendFunction.SKIP
  if (effects.depthOfField.blendMode.blendFunction !== dofBlend) effects.depthOfField.blendMode.blendFunction = dofBlend
}

function disposeStableEffects(effects: StableEffects) {
  for (const effect of Object.values(effects)) effect.dispose()
}

export function PostProcessingStack({ profile, quality, quiet = false }: PostProcessingStackProps) {
  const effects = resolveEffectProfile(profile, quality)
  const quietEffects = quiet ? {
    ...effects,
    bloomIntensity: effects.bloomIntensity * 0.5,
    noiseOpacity: effects.noiseOpacity * 0.5,
    vignetteDarkness: effects.vignetteDarkness * 0.5,
    depthOfField: false,
  } : effects
  const multisampling = quality === 'high' ? 4 : quality === 'balanced' ? 2 : 0
  const camera = useThree((state) => state.camera)
  const invalidate = useThree((state) => state.invalidate)

  // 效果实例在整个画布生命周期里只创建一次，页面切换时只改参数。
  // 以前每次切页都会按新参数重建 Bloom/Vignette/景深，重新编译约 9 个着色器，进入季节页时卡 100–200ms。
  // 景深也一直挂着，不需要时用 SKIP 混合关掉；不再把它从管线里拿掉（拿掉会残留上一帧画面）。
  const stable = useMemo(() => createStableEffects(camera), [camera])
  useEffect(() => () => disposeStableEffects(stable), [stable])

  const { bloomIntensity, bloomThreshold, noiseOpacity, vignetteOffset, vignetteDarkness, depthOfField } = quietEffects
  useLayoutEffect(() => {
    applyEffectSettings(stable, { bloomIntensity, bloomThreshold, noiseOpacity, vignetteOffset, vignetteDarkness, depthOfField })
    invalidate()
  }, [bloomIntensity, bloomThreshold, depthOfField, invalidate, noiseOpacity, stable, vignetteDarkness, vignetteOffset])

  // children 保持同一个引用，EffectComposer 才不会每次渲染都拆掉重建效果通道
  const children = useMemo(() => [
    <primitive key="tone-mapping" object={stable.toneMapping} />,
    <primitive key="bloom" object={stable.bloom} />,
    <primitive key="noise" object={stable.noise} />,
    <primitive key="vignette" object={stable.vignette} />,
    <primitive key="depth-of-field" object={stable.depthOfField} />,
  ], [stable])

  return <EffectComposer multisampling={multisampling}>{children}</EffectComposer>
}

function FrameQualityMonitor({
  quality,
  onDegrade,
}: {
  quality: RealtimeQualityTier
  onDegrade(tier: QualityTier): void
}) {
  const monitor = useMemo(() => createQualityMonitor(quality, onDegrade), [onDegrade, quality])
  useFrame((_state, delta) => monitor.recordFrameTime(delta * 1_000))
  return null
}

interface RealtimeSceneLayerProps {
  profile: EffectProfile
  worldScene?: WorldSceneComponent | undefined
  quality: RealtimeQualityTier
  mobile: boolean
  reducedMotion: boolean
  worldProgress?: { current: number }
  onDegrade(tier: QualityTier): void
  scenePath?: string
  quiet?: boolean
  /** 当前页面没有 3D 场景（Archive、Studio 等）。 */
  idle?: boolean
  onContextLost?(): void
}

const DEFAULT_WORLD_PROGRESS = { current: 0 }

function ContextLossRecovery({ onContextLost }: { onContextLost?(): void }) {
  const gl = useThree((state) => state.gl)
  useEffect(() => {
    if (!onContextLost) return undefined
    const recover = (event: Event) => { event.preventDefault(); onContextLost() }
    gl.domElement.addEventListener('webglcontextlost', recover)
    return () => gl.domElement.removeEventListener('webglcontextlost', recover)
  }, [gl, onContextLost])
  return null
}

function SceneClockInvalidator() {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => subscribeSceneClock(() => invalidate()), [invalidate])

  return null
}

export function RealtimeSceneLayer({
  profile,
  worldScene: WorldScene,
  quality,
  mobile,
  reducedMotion,
  worldProgress = DEFAULT_WORLD_PROGRESS,
  onDegrade,
  scenePath = '/',
  quiet = false,
  idle = false,
  onContextLost,
}: RealtimeSceneLayerProps) {
  const budget = getEffectiveSceneBudget(quality, mobile)
  const worldSceneQuality: RealtimeQualityTier = mobile ? 'lite' : quality
  const [sceneTimeFrozen, setSceneTimeFrozen] = useState(isSceneTimeFrozen)

  useEffect(() => subscribeSceneClock(() => setSceneTimeFrozen(isSceneTimeFrozen())), [])

  return (
    <div className={styles.sceneLayer} aria-hidden="true" data-quiet={quiet || undefined} data-scene-idle={idle || undefined}>
      <Canvas
        camera={{ fov: 42, position: [0, 0.45, mobile ? 58 : 24] }}
        className={styles.canvasSurface}
        dpr={budget.dpr}
        frameloop={reducedMotion || sceneTimeFrozen ? 'demand' : 'always'}
        gl={{ antialias: quality !== 'lite', alpha: true }}
      >
        {onContextLost ? <ContextLossRecovery onContextLost={onContextLost} /> : null}
        <SceneClockInvalidator />
        <FrameQualityMonitor quality={quality} onDegrade={onDegrade} />
        <Suspense fallback={null}>
          {WorldScene ? (
            <WorldScene quality={worldSceneQuality} progress={worldProgress} reducedMotion={reducedMotion} />
          ) : scenePath === '/' ? <UniverseScene quality={quality} mobile={mobile} reducedMotion={reducedMotion} /> : null}
        </Suspense>
        <PostProcessingStack profile={profile} quality={quality} quiet={quiet} />
      </Canvas>
    </div>
  )
}
