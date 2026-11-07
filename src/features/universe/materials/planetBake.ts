import {
  GLSL3,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  NoColorSpace,
  OrthographicCamera,
  PlaneGeometry,
  RawShaderMaterial,
  SRGBColorSpace,
  Scene,
  WebGLRenderTarget,
  type Texture,
  type WebGLRenderer,
} from 'three'
import { PLANET_SURFACE_GLSL, PROCEDURAL_PLANET_SPECS } from './proceduralPlanet'
import type { PortalPbrId } from './portalPbrProfiles'

/**
 * 把程序化星球表面烘焙成等距柱状贴图（和 SphereGeometry 的 UV 一一对应）。
 * 每帧只烘焙一条横带，避免开场一次性卡住；烘好的贴图按渲染器缓存，回到首页时直接复用。
 */
export interface BakedPlanet {
  map: Texture
  orm: Texture
  normal: Texture
  emissive: Texture | null
}

const EMISSIVE_PLANETS = new Set<PortalPbrId>(['summer', 'core'])
/** 每帧最多烘焙的像素数。 */
const TEXELS_PER_FRAME = 1024 * 160

const vertexShader = /* glsl */ `
in vec3 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

function fragmentShader(define: string, variant: number) {
  return /* glsl */ `
precision highp float;
precision highp int;
#define ${define}
#define ERO_VARIANT ${variant}
uniform float uEroTime;
uniform float uEroBump;
uniform float uTexelAngle;
in vec2 vUv;
layout(location = 0) out vec4 outAlbedo;
layout(location = 1) out vec4 outOrm;
layout(location = 2) out vec4 outNormal;
layout(location = 3) out vec4 outEmissive;

${PLANET_SURFACE_GLSL}

// 与 three.js SphereGeometry 的顶点/UV 公式一致
vec3 directionFromUv(vec2 uv) {
  float phi = uv.x * 6.28318530718;
  float theta = (1.0 - uv.y) * 3.14159265359;
  return vec3(-cos(phi) * sin(theta), cos(theta), sin(phi) * sin(theta));
}

void main() {
  vec3 p = directionFromUv(vUv);
  EroSurface s = eroSurface(p);
  vec3 up = abs(p.y) > 0.98 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 t1 = normalize(cross(up, p));
  vec3 t2 = cross(p, t1);
  float e = uTexelAngle * 0.75;
  float h1 = eroSurface(normalize(p + t1 * e)).height;
  float h2 = eroSurface(normalize(p + t2 * e)).height;
  vec2 grad = vec2(h1 - s.height, h2 - s.height) / e;
  vec3 n = normalize(p - (grad.x * t1 + grad.y * t2) * uEroBump * 0.02 + s.tilt);
  outAlbedo = vec4(clamp(s.albedo, 0.0, 1.0), 1.0);
  outOrm = vec4(1.0, clamp(s.roughness, 0.04, 1.0), clamp(s.metalness, 0.0, 1.0), 1.0);
  outNormal = vec4(n * 0.5 + 0.5, 1.0);
  outEmissive = vec4(clamp(s.emissive * 0.25, 0.0, 1.0), 1.0);
}
`
}

interface BakeJob {
  id: PortalPbrId
  width: number
  height: number
  nextRow: number
  target: WebGLRenderTarget
  material: RawShaderMaterial
  result: BakedPlanet
  listeners: Array<(baked: BakedPlanet) => void>
  done: boolean
}

interface RendererBakeState {
  jobs: Map<string, BakeJob>
  queue: BakeJob[]
  lastTick: number
  scene: Scene
  camera: OrthographicCamera
  quad: Mesh
}

const rendererStates = new WeakMap<WebGLRenderer, RendererBakeState>()

function getRendererState(renderer: WebGLRenderer) {
  let state = rendererStates.get(renderer)
  if (!state) {
    const quad = new Mesh(new PlaneGeometry(2, 2))
    quad.frustumCulled = false
    const scene = new Scene()
    scene.add(quad)
    state = {
      jobs: new Map(),
      queue: [],
      lastTick: -1,
      scene,
      camera: new OrthographicCamera(-1, 1, 1, -1, 0, 1),
      quad,
    }
    rendererStates.set(renderer, state)
  }
  return state
}

function createJob(renderer: WebGLRenderer, id: PortalPbrId, width: number, variant: number): BakeJob {
  const height = width / 2
  const emissive = EMISSIVE_PLANETS.has(id)
  const target = new WebGLRenderTarget(width, height, {
    count: emissive ? 4 : 3,
    depthBuffer: false,
    generateMipmaps: true,
    minFilter: LinearMipmapLinearFilter,
    magFilter: LinearFilter,
    anisotropy: Math.min(8, renderer.capabilities.getMaxAnisotropy()),
  })
  target.textures[0]!.colorSpace = SRGBColorSpace
  target.textures[1]!.colorSpace = NoColorSpace
  target.textures[2]!.colorSpace = NoColorSpace
  if (emissive) target.textures[3]!.colorSpace = SRGBColorSpace

  const material = new RawShaderMaterial({
    glslVersion: GLSL3,
    vertexShader,
    fragmentShader: fragmentShader(PROCEDURAL_PLANET_SPECS[id].define, variant),
    uniforms: {
      uEroTime: { value: 0 },
      uEroBump: { value: PROCEDURAL_PLANET_SPECS[id].bumpStrength },
      uTexelAngle: { value: (Math.PI * 2) / width },
    },
    depthTest: false,
    depthWrite: false,
  })

  return {
    id,
    width,
    height,
    nextRow: 0,
    target,
    material,
    result: {
      map: target.textures[0]!,
      orm: target.textures[1]!,
      normal: target.textures[2]!,
      emissive: emissive ? target.textures[3]! : null,
    },
    listeners: [],
    done: false,
  }
}

/** 申请烘焙；已经烘好的直接返回结果。 */
export function requestPlanetBake(
  renderer: WebGLRenderer,
  id: PortalPbrId,
  width: number,
  onReady: (baked: BakedPlanet) => void,
  variant = 0,
) {
  const state = getRendererState(renderer)
  const key = `${id}:${width}:${variant}`
  let job = state.jobs.get(key)
  if (!job) {
    job = createJob(renderer, id, width, variant)
    state.jobs.set(key, job)
    state.queue.push(job)
  }
  if (job.done) {
    onReady(job.result)
    return () => undefined
  }
  job.listeners.push(onReady)
  const activeJob = job
  return () => {
    activeJob.listeners = activeJob.listeners.filter((listener) => listener !== onReady)
  }
}

/**
 * 每帧调用（同一帧多处调用也只执行一次）：烘焙队列里下一条横带。
 * tick 用 useFrame 里的 clock.elapsedTime，同一帧内各调用方拿到的值相同。
 */
export function pumpPlanetBakes(renderer: WebGLRenderer, tick: number) {
  const state = getRendererState(renderer)
  if (state.lastTick === tick) return
  state.lastTick = tick

  const job = state.queue[0]
  if (!job) return

  const rows = Math.max(8, Math.floor(TEXELS_PER_FRAME / job.width))
  const rowCount = Math.min(rows, job.height - job.nextRow)
  state.quad.material = job.material
  job.target.scissor.set(0, job.nextRow, job.width, rowCount)
  job.target.scissorTest = true

  const previousTarget = renderer.getRenderTarget()
  const previousAutoClear = renderer.autoClear
  renderer.autoClear = false
  renderer.setRenderTarget(job.target)
  renderer.render(state.scene, state.camera)
  renderer.setRenderTarget(previousTarget)
  renderer.autoClear = previousAutoClear

  job.nextRow += rowCount
  if (job.nextRow < job.height) return

  job.done = true
  job.target.scissorTest = false
  job.material.dispose()
  state.queue.shift()
  for (const listener of job.listeners) listener(job.result)
  job.listeners = []
}
