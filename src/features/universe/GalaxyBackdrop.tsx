import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import {
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderTarget,
  type WebGLRenderer,
} from 'three'
import { getHomeCameraPreset } from './homeComposition'
import { PROCEDURAL_NOISE_GLSL } from './materials/proceduralNoise.glsl'

const BACKDROP_Z = -30
/** 银河带的倾角（弧度），和 GalacticVeil 的层保持一致。 */
const BAND_ANGLE = 0.42
const MAX_BAKE_WIDTH = 3072

const bakeVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const bakeFragmentShader = /* glsl */ `
  uniform float uAspect;
  uniform float uSeed;
  uniform vec2 uResolution;
  varying vec2 vUv;

  ${PROCEDURAL_NOISE_GLSL}

  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  // 像素级的星点层：每个格子最多一颗星
  float starLayer(vec2 pixel, float cellSize, float density, float sharpness) {
    vec2 cell = floor(pixel / cellSize);
    vec2 local = fract(pixel / cellSize);
    float present = step(1.0 - density, hash21(cell + uSeed));
    vec2 center = vec2(hash21(cell + 3.1), hash21(cell + 7.7)) * 0.7 + 0.15;
    float d = length((local - center) * cellSize);
    float brightness = pow(hash21(cell + 11.3), 3.0);
    return present * brightness * exp(-d * d * sharpness);
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    float c = cos(-${BAND_ANGLE.toFixed(3)});
    float s = sin(-${BAND_ANGLE.toFixed(3)});
    vec2 b = vec2(c * p.x - s * p.y, s * p.x + c * p.y);

    // 银河带的中线随噪声起伏，越靠右上越亮越宽（银心方向）
    float warp = (eroFbm(vec3(b.x * 1.3, 0.0, uSeed), 4) - 0.5) * 0.16;
    float y = b.y + warp;
    float bulge = exp(-pow((b.x - 0.42) / 0.3, 2.0));
    float width = 0.055 + 0.055 * bulge + 0.02 * eroFbm(vec3(b.x * 3.0, 2.0, uSeed), 3);
    float band = exp(-(y * y) / (width * width));
    float halo = exp(-(y * y) / 0.06);

    vec3 q = vec3(b * vec2(3.0, 6.0), uSeed);
    vec3 domain = vec3(eroFbm(q, 4), eroFbm(q + 5.3, 4), 0.0);
    float clouds = eroFbm(vec3(b * vec2(4.0, 9.0) + domain.xy * 1.2, uSeed + 1.0), 6);
    float filaments = eroFbm(vec3(b * vec2(16.0, 34.0) + domain.xy * 2.0, uSeed + 2.0), 5);
    float lanes = eroRidged(vec3(b * vec2(3.5, 9.0) + domain.yx * 1.2, uSeed + 3.0), 3);
    float dust = smoothstep(0.5, 0.85, lanes) * exp(-pow(y / (width * 1.2), 2.0));
    dust *= 0.55 + 0.45 * smoothstep(0.35, 0.7, clouds);

    float cloudMask = smoothstep(0.35, 0.75, clouds);
    vec2 pixel = vUv * uResolution;

    // 柔光底：只占一小部分亮度，主要的"银河质感"来自下面的密集微星
    float glow = band * cloudMask * (0.35 + filaments * 0.65) * 0.2;
    glow += bulge * pow(band, 3.0) * 0.32;
    glow += halo * cloudMask * 0.012;

    // 星云由无数颗分辨不出的小星组成：用像素级颗粒按云的密度点亮
    float grainDensity = band * (0.25 + 1.4 * cloudMask * (0.5 + filaments)) + halo * 0.05;
    float grain = pow(hash21(floor(pixel) + uSeed), 6.0) * grainDensity * 0.22;
    grain += pow(hash21(floor(pixel / 2.0) + uSeed + 9.0), 24.0) * grainDensity * 0.55;

    float extinction = 1.0 - dust * 0.92;
    vec3 coreColor = vec3(1.0, 0.80, 0.58);
    vec3 armColor = vec3(0.70, 0.74, 0.86);
    vec3 tint = mix(armColor, coreColor, clamp(bulge * 1.2 + cloudMask * 0.25, 0.0, 1.0));
    vec3 color = tint * (glow + grain) * extinction;
    // 尘埃带边缘略带红棕
    color += vec3(0.20, 0.10, 0.05) * dust * band * cloudMask * 0.12;

    float knots = smoothstep(0.76, 0.88, eroFbm(vec3(b * 38.0, uSeed + 4.0), 3)) * band * cloudMask;
    color += vec3(0.85, 0.30, 0.42) * knots * 0.07 * extinction;
    float clusters = smoothstep(0.8, 0.92, eroFbm(vec3(b * 26.0, uSeed + 5.0), 3)) * band;
    color += vec3(0.5, 0.65, 1.0) * clusters * 0.05 * extinction;

    // 可分辨的星：大部分很小，少数亮星
    float density = 0.04 + band * 0.3;
    float stars = starLayer(pixel, 5.0, density, 2.2) * 0.7;
    stars += starLayer(pixel + 37.0, 13.0, 0.05 + band * 0.12, 1.1) * 1.0;
    stars += starLayer(pixel + 91.0, 41.0, 0.05, 0.6) * 1.2;
    vec3 starTint = mix(vec3(0.75, 0.83, 1.0), vec3(1.0, 0.88, 0.72), hash21(floor(pixel / 5.0) + 2.0));
    color += starTint * stars * extinction;

    gl_FragColor = vec4(color, 1.0);
  }
`

/** 在 GPU 上把银河画进一张贴图（只执行一次）。 */
function bakeGalaxyTexture(renderer: WebGLRenderer, width: number, height: number, aspect: number) {
  const renderTarget = new WebGLRenderTarget(width, height, {
    depthBuffer: false,
    magFilter: LinearFilter,
    minFilter: LinearFilter,
  })
  const material = new ShaderMaterial({
    vertexShader: bakeVertexShader,
    fragmentShader: bakeFragmentShader,
    uniforms: {
      uAspect: { value: aspect },
      uSeed: { value: 3.7 },
      uResolution: { value: [width, height] },
    },
    depthTest: false,
    depthWrite: false,
  })
  const quad = new Mesh(new PlaneGeometry(2, 2), material)
  const scene = new Scene()
  scene.add(quad)
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const previousTarget = renderer.getRenderTarget()
  const previousAutoClear = renderer.autoClear
  renderer.autoClear = true
  renderer.setRenderTarget(renderTarget)
  renderer.render(scene, camera)
  renderer.setRenderTarget(previousTarget)
  renderer.autoClear = previousAutoClear

  quad.geometry.dispose()
  material.dispose()
  return renderTarget
}

/**
 * 每个渲染器只保留一张银河贴图：从季节页回到首页时直接复用，不再重新生成（生成一次约 100ms）。
 * 视口尺寸变化时才重新生成，并释放旧的那张。
 */
const galaxyCache = new WeakMap<WebGLRenderer, { key: string; target: WebGLRenderTarget }>()

function getGalaxyTexture(renderer: WebGLRenderer, width: number, height: number, aspect: number) {
  const key = `${width}x${height}`
  const cached = galaxyCache.get(renderer)
  if (cached?.key === key) return cached.target
  cached?.target.dispose()
  const target = bakeGalaxyTexture(renderer, width, height, aspect)
  galaxyCache.set(renderer, { key, target })
  return target
}

/**
 * 程序化银河背景：开场时在 GPU 上生成一次贴图（尺寸随视口），之后每帧只是贴一张图，几乎不占性能。
 */
export function GalaxyBackdrop() {
  const size = useThree((state) => state.size)
  const gl = useThree((state) => state.gl)
  const viewportDpr = useThree((state) => state.viewport.dpr)

  const dimensions = useMemo(() => {
    const preset = getHomeCameraPreset(size.width, size.height)
    const distance = preset.position[2] - BACKDROP_Z
    const visibleHeight = 2 * distance * Math.tan((preset.fov * Math.PI) / 360)
    const visibleWidth = visibleHeight * (size.width / size.height)
    // 留出余量，相机对准星球时背景不会露边
    return [visibleWidth * 1.25, visibleHeight * 1.25] as const
  }, [size.height, size.width])

  const target = useMemo(() => {
    const aspect = dimensions[0] / dimensions[1]
    const width = Math.min(MAX_BAKE_WIDTH, Math.ceil(size.width * Math.max(viewportDpr, 1.5) * 1.25))
    return getGalaxyTexture(gl, width, Math.ceil(width / aspect), aspect)
  }, [dimensions, gl, size.width, viewportDpr])

  return (
    <mesh position={[0, 0, BACKDROP_Z]} renderOrder={-10}>
      <planeGeometry args={[dimensions[0], dimensions[1]]} />
      <meshBasicMaterial depthWrite={false} map={target.texture} toneMapped={false} />
    </mesh>
  )
}
