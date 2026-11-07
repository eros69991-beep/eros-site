import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import { Color, MeshPhysicalMaterial, ObjectSpaceNormalMap, Vector3, type Camera } from 'three'
import { getSceneTime } from '../../../scene/sceneClock'
import { getPlanetBakeWidth } from './planetGeometry'
import { pumpPlanetBakes, requestPlanetBake, type BakedPlanet } from './planetBake'
import { PROCEDURAL_PLANET_SPECS } from './proceduralPlanet'
import type { PortalPbrId } from './portalPbrProfiles'

/** 主光方向（世界坐标），和 UniverseScene 里的主光位置一致。 */
const KEY_LIGHT_DIRECTION = new Vector3(12, 6, -2).normalize()
const EMISSIVE_SCALE = 4
/** 网站上每颗星球使用的方案编号（春天：4 = 柳絮薄雾）。 */
const SITE_VARIANTS: Partial<Record<PortalPbrId, number>> = { spring: 4 }

function createRuntimeMaterial(id: PortalPbrId, baked: BakedPlanet) {
  const spec = PROCEDURAL_PLANET_SPECS[id]
  const uniforms = {
    uEroRimColor: { value: new Color(spec.rimColor) },
    uEroRimStrength: { value: spec.rimStrength },
    uEroRimPower: { value: spec.rimPower },
    uEroLightDir: { value: KEY_LIGHT_DIRECTION.clone() },
  }
  const material = new MeshPhysicalMaterial({
    map: baked.map,
    roughnessMap: baked.orm,
    metalnessMap: baked.orm,
    normalMap: baked.normal,
    normalMapType: ObjectSpaceNormalMap,
    emissiveMap: baked.emissive,
    emissive: baked.emissive ? '#ffffff' : '#000000',
    emissiveIntensity: EMISSIVE_SCALE,
    roughness: 1,
    metalness: 1,
    clearcoat: spec.clearcoat,
    clearcoatRoughness: spec.clearcoatRoughness,
    sheen: spec.sheen,
    sheenColor: new Color(spec.sheenColor),
    sheenRoughness: spec.sheenRoughness,
    envMapIntensity: 0.9,
  })
  material.customProgramCacheKey = () => 'eros-baked-planet'
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform vec3 uEroRimColor;
        uniform float uEroRimStrength;
        uniform float uEroRimPower;
        uniform vec3 uEroLightDir;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        // 大气边缘光：只在朝光的一侧明显
        float eroFresnel = pow(1.0 - clamp(dot(nonPerturbedNormal, normalize(vViewPosition)), 0.0, 1.0), uEroRimPower);
        float eroLitSide = 0.2 + 0.8 * smoothstep(-0.25, 0.6, dot(nonPerturbedNormal, uEroLightDir));
        totalEmissiveRadiance += uEroRimColor * eroFresnel * uEroRimStrength * eroLitSide;`)
  }
  return { material, uniforms }
}

/**
 * 运行时材质和烘焙贴图一样缓存起来，不随首页卸载而释放：
 * 从季节页回到首页时着色器程序还在，不用重新编译（否则回首页的第一帧会卡 100ms 以上）。
 */
const runtimeCache = new WeakMap<BakedPlanet, ReturnType<typeof createRuntimeMaterial>>()

function getRuntimeMaterial(id: PortalPbrId, baked: BakedPlanet) {
  let runtime = runtimeCache.get(baked)
  if (!runtime) {
    runtime = createRuntimeMaterial(id, baked)
    runtimeCache.set(baked, runtime)
  }
  return runtime
}

function updateRuntimeMaterial(
  runtime: ReturnType<typeof createRuntimeMaterial>,
  camera: Camera,
  emissiveIntensity: number,
) {
  runtime.uniforms.uEroLightDir.value.copy(KEY_LIGHT_DIRECTION).transformDirection(camera.matrixWorldInverse)
  runtime.material.emissiveIntensity = emissiveIntensity
}

export function ProceduralPlanetMaterial({
  id,
  mobile = false,
  reducedMotion,
  selected,
  variant,
}: {
  id: PortalPbrId
  mobile?: boolean
  /** 只用于本地比较候选方案。 */
  variant?: number
  reducedMotion: boolean
  selected: boolean
}) {
  const gl = useThree((state) => state.gl)
  const width = getPlanetBakeWidth(id, mobile)
  const [baked, setBaked] = useState<BakedPlanet | null>(null)

  const activeVariant = variant ?? SITE_VARIANTS[id] ?? 0

  useEffect(() => requestPlanetBake(gl, id, width, setBaked, activeVariant), [activeVariant, gl, id, width])

  const runtime = useMemo(() => (baked ? getRuntimeMaterial(id, baked) : null), [baked, id])
  useFrame(({ camera, clock }) => {
    pumpPlanetBakes(gl, clock.elapsedTime)
    if (!runtime) return
    const pulse = id === 'summer' && !reducedMotion ? 0.9 + Math.sin(getSceneTime() * 0.6) * 0.1 : 1
    updateRuntimeMaterial(runtime, camera, EMISSIVE_SCALE * pulse * (selected ? 1.15 : 1))
  })

  // 烘焙完成前先不显示（通常不到一秒）
  if (!runtime) return <meshBasicMaterial depthWrite={false} opacity={0} transparent />
  return <primitive attach="material" object={runtime.material} />
}
