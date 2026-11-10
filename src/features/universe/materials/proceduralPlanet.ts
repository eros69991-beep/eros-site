import { PROCEDURAL_NOISE_GLSL } from './proceduralNoise.glsl'
import type { PortalPbrId } from './portalPbrProfiles'

/**
 * 程序化星球：表面（颜色、粗糙度、金属度、高度、自发光）由噪声函数在三维坐标上生成，
 * 没有 UV 接缝和极点拉伸。开场时烘焙成贴图（见 bakePlanetSurface），运行时只是普通的物理材质采样贴图。
 */
export interface ProceduralPlanetSpec {
  define: string
  /** 物理材质的基础参数。 */
  clearcoat: number
  clearcoatRoughness: number
  sheen: number
  sheenColor: string
  sheenRoughness: number
  /** 凹凸强度（越大越立体）。 */
  bumpStrength: number
  /** 边缘大气光颜色和强度。 */
  rimColor: string
  rimStrength: number
  rimPower: number
}

export const PROCEDURAL_PLANET_SPECS: Record<PortalPbrId, ProceduralPlanetSpec> = {
  winter: {
    define: 'ERO_WINTER', clearcoat: 0.25, clearcoatRoughness: 0.35,
    sheen: 0.25, sheenColor: '#dfeef5', sheenRoughness: 0.45,
    bumpStrength: 0.18, rimColor: '#bcdcea', rimStrength: 0.55, rimPower: 3.2,
  },
  summer: {
    define: 'ERO_SUMMER', clearcoat: 0.15, clearcoatRoughness: 0.5,
    sheen: 0, sheenColor: '#000000', sheenRoughness: 1,
    bumpStrength: 1.0, rimColor: '#ff7a3a', rimStrength: 0.35, rimPower: 3.6,
  },
  autumn: {
    define: 'ERO_AUTUMN', clearcoat: 0, clearcoatRoughness: 1,
    sheen: 0.2, sheenColor: '#b07a55', sheenRoughness: 0.8,
    bumpStrength: 0.6, rimColor: '#e8b48a', rimStrength: 0.45, rimPower: 3.0,
  },
  spring: {
    define: 'ERO_SPRING', clearcoat: 0, clearcoatRoughness: 1,
    sheen: 0.45, sheenColor: '#ffe4c4', sheenRoughness: 0.5,
    bumpStrength: 0.5, rimColor: '#c8eeb0', rimStrength: 0.7, rimPower: 2.6,
  },
  studio: {
    define: 'ERO_STUDIO', clearcoat: 0, clearcoatRoughness: 1,
    sheen: 0.6, sheenColor: '#4d6577', sheenRoughness: 0.55,
    bumpStrength: 0.8, rimColor: '#6f8fa6', rimStrength: 0.65, rimPower: 2.4,
  },
  core: {
    define: 'ERO_CORE', clearcoat: 0.4, clearcoatRoughness: 0.3,
    sheen: 0, sheenColor: '#000000', sheenRoughness: 1,
    bumpStrength: 1.4, rimColor: '#ffd29a', rimStrength: 0.7, rimPower: 2.6,
  },
}

/** 表面函数（GLSL）。需要外部提供 ERO_* 宏，以及 uEroTime 这个 uniform。 */
export const PLANET_SURFACE_GLSL = /* glsl */ `
#ifndef ERO_VARIANT
#define ERO_VARIANT 0
#endif
${PROCEDURAL_NOISE_GLSL}

struct EroSurface {
  vec3 albedo;
  float roughness;
  float metalness;
  float height;
  vec3 emissive;
  /** 额外的法线偏移（物体空间），用于晶面这类不连续的倾斜面。 */
  vec3 tilt;
};

float eroCrack(vec2 f, float width) {
  return 1.0 - smoothstep(0.0, width, f.y - f.x);
}

EroSurface eroSurface(vec3 p) {
  EroSurface s;
  s.emissive = vec3(0.0);
  s.tilt = vec3(0.0);
#if defined(ERO_WINTER)
  // 冰卫星（参考木卫二 Europa）：蓝白冰壳 + 跨越整个星球的长条裂纹带 + 混乱地形斑块
  vec3 warp = vec3(eroFbm(p * 1.3, 4), eroFbm(p * 1.3 + 11.0, 4), eroFbm(p * 1.3 + 23.0, 4)) - 0.5;
  float tone = eroFbm(p * 1.8 + warp, 5);
  float frost = eroFbm(p * 11.0, 4);
  float lineA = eroRidged(p * vec3(1.1, 3.2, 1.1) + warp * 1.6, 5);
  float lineB = eroRidged(p.zxy * vec3(1.4, 2.6, 1.4) + warp.yzx * 1.8 + 4.0, 5);
  float lineaeMajor = smoothstep(0.62, 0.74, lineA);
  float lineaeMinor = smoothstep(0.66, 0.78, lineB) * 0.75;
  float lineaeFine = smoothstep(0.68, 0.8, eroRidged(p * 5.5 + warp * 3.0, 3)) * 0.5;
  float lineae = max(max(lineaeMajor, lineaeMinor), lineaeFine);
  float chaos = smoothstep(0.62, 0.78, eroFbm(p * 2.6 + warp * 2.0 + 7.0, 5));
  vec3 ice = mix(vec3(0.66, 0.74, 0.80), vec3(0.92, 0.95, 0.97), smoothstep(0.3, 0.75, tone));
  ice = mix(ice, vec3(0.98, 0.99, 1.0), smoothstep(0.6, 0.85, frost) * 0.45);
  vec3 chaosColor = vec3(0.56, 0.52, 0.50) * (0.8 + frost * 0.3);
  vec3 lineColor = mix(vec3(0.48, 0.38, 0.33), vec3(0.30, 0.36, 0.42), lineaeFine);
  s.albedo = mix(mix(ice, chaosColor, chaos * 0.75), lineColor, lineae * 0.85);
  s.roughness = mix(0.38, 0.7, frost * 0.6 + chaos * 0.4);
  s.metalness = 0.0;
  s.height = tone * 0.4 + frost * 0.12 + chaos * eroFbm(p * 18.0, 2) * 0.5 - lineaeMajor * 0.35 + lineaeMinor * 0.25;
#elif defined(ERO_SUMMER)
  // 熔岩世界（参考木卫一 Io + 焦黑金属）：黑色玄武岩板块、发光的裂谷、火山口、硫磺与灰烬沉积
  vec3 warp = vec3(eroFbm(p * 1.6, 4), eroFbm(p * 1.6 + 7.0, 4), eroFbm(p * 1.6 + 19.0, 4)) - 0.5;
  float plates = eroFbm(p * 2.2 + warp * 1.5, 6);
  float rift = smoothstep(0.74, 0.84, eroRidged(p * 1.7 + warp * 2.2, 5));
  float riftFine = smoothstep(0.78, 0.86, eroRidged(p * 4.5 + warp * 3.0 + 3.0, 4)) * 0.6;
  vec2 calderaCells = eroCellular(p * 4.0 + warp);
  float caldera = (1.0 - smoothstep(0.08, 0.2, calderaCells.x)) * step(0.62, eroHash33(floor(p * 4.0 + warp)).x);
  float ash = smoothstep(0.55, 0.8, eroFbm(p * 3.0 + warp * 2.5 + 5.0, 5));
  float sulfur = smoothstep(0.62, 0.82, eroFbm(p * 2.4 + 31.0, 4)) * (1.0 - ash);
  vec3 basalt = mix(vec3(0.035, 0.03, 0.028), vec3(0.17, 0.12, 0.09), smoothstep(0.35, 0.75, plates));
  basalt = mix(basalt, vec3(0.38, 0.34, 0.30), ash * 0.55);
  basalt = mix(basalt, vec3(0.52, 0.36, 0.14), sulfur * 0.4);
  float heat = max(rift, riftFine) * (0.6 + 0.4 * eroFbm(p * 6.0 - uEroTime * 0.03, 3)) + caldera * 0.9;
  heat *= 0.88 + 0.12 * sin(uEroTime * 0.6 + plates * 9.0);
  s.albedo = mix(basalt, vec3(0.06, 0.02, 0.01), clamp(heat, 0.0, 1.0));
  s.roughness = mix(0.45, 0.9, ash + plates * 0.3);
  s.metalness = mix(0.7, 0.05, clamp(ash + heat, 0.0, 1.0));
  s.height = plates * 0.7 - rift * 0.6 - caldera * 0.5 + ash * 0.1;
  vec3 lava = mix(vec3(0.85, 0.10, 0.02), vec3(1.0, 0.68, 0.22), smoothstep(0.55, 1.0, heat));
  s.emissive = lava * heat * 2.4;
#elif defined(ERO_AUTUMN)
  // 气态巨行星（参考木星）：宽窄不一的锈色云带、带边的湍流和花彩、一个大红斑式的风暴
  vec3 stormCenter = normalize(vec3(0.45, -0.38, 0.81));
  float stormRadius = 0.27;
  vec3 toStorm = p - stormCenter;
  float stormDist = length(toStorm * vec3(1.0, 1.75, 1.0)) / stormRadius;
  // 风暴内部按到中心的距离旋转（在切平面里），越靠中心转得越多
  vec3 axisU = normalize(cross(stormCenter, vec3(0.0, 1.0, 0.0)));
  vec3 axisV = cross(stormCenter, axisU);
  vec2 local = vec2(dot(toStorm, axisU), dot(toStorm, axisV));
  float twist = (1.0 - smoothstep(0.0, 1.4, stormDist)) * 3.2;
  vec2 twisted = mat2(cos(twist), -sin(twist), sin(twist), cos(twist)) * local;
  vec3 q = p + axisU * (twisted.x - local.x) + axisV * (twisted.y - local.y);

  vec3 flowP = vec3(q.x * 3.5, q.y * 18.0, q.z * 3.5) + vec3(uEroTime * 0.004, 0.0, 0.0);
  float warpA = eroFbm(flowP, 5);
  float warpB = eroFbm(vec3(q.x * 8.0, q.y * 40.0, q.z * 8.0) + warpA * 1.5, 4);
  float lat = q.y + (warpA - 0.5) * 0.07 + (warpB - 0.5) * 0.025;
  float bandValue = eroFbm(vec3(0.0, lat * 5.5, 0.0) + 3.0, 5);
  float bandFine = eroFbm(vec3(0.0, lat * 21.0, 0.0) + 9.0, 3);
  float streaks = eroFbm(vec3(q.x * 14.0, q.y * 90.0, q.z * 14.0) + warpB, 3);

  vec3 cream = vec3(0.88, 0.82, 0.70);
  vec3 tanColor = vec3(0.76, 0.58, 0.40);
  vec3 rust = vec3(0.60, 0.31, 0.15);
  vec3 umber = vec3(0.30, 0.18, 0.11);
  vec3 col = mix(umber, rust, smoothstep(0.3, 0.42, bandValue));
  col = mix(col, tanColor, smoothstep(0.44, 0.54, bandValue));
  col = mix(col, cream, smoothstep(0.56, 0.66, bandValue));
  col = mix(col, col * vec3(1.08, 0.95, 0.85), smoothstep(0.4, 0.7, bandFine) * 0.6);
  col *= 0.84 + streaks * 0.32;
  // 带边的小涡旋（白色椭圆）
  vec2 ovalCells = eroCellular(vec3(q.x * 7.0, q.y * 16.0, q.z * 7.0) + 41.0);
  float ovals = (1.0 - smoothstep(0.12, 0.3, ovalCells.x)) * step(0.82, eroHash33(floor(vec3(q.x * 7.0, q.y * 16.0, q.z * 7.0) + 41.0)).y);
  col = mix(col, cream * 1.05, ovals * 0.7);
  // 极区偏暗偏灰
  col = mix(col, vec3(0.40, 0.35, 0.31) * (0.8 + warpA * 0.4), smoothstep(0.62, 0.95, abs(p.y)) * 0.65);
  // 风暴本体 + 浅色外环
  float stormCore = 1.0 - smoothstep(0.55, 0.95, stormDist);
  float stormRing = smoothstep(0.8, 1.0, stormDist) * (1.0 - smoothstep(1.0, 1.35, stormDist));
  vec3 stormColor = mix(vec3(0.66, 0.26, 0.12), vec3(0.84, 0.50, 0.30), warpB);
  col = mix(col, stormColor, stormCore * 0.9);
  col = mix(col, cream, stormRing * 0.5);
  s.albedo = col;
  s.roughness = 0.92;
  s.metalness = 0.0;
  s.height = streaks * 0.1 + warpB * 0.1;
#elif defined(ERO_SPRING)
  // 自创：万物苏醒的春之星。没有裂纹和硬边，只有柔和流动的色带（ERO_VARIANT 用于比较候选方案）。
  vec3 q = vec3(eroFbm(p * 0.9, 3), eroFbm(p * 0.9 + 5.2, 3), eroFbm(p * 0.9 + 9.7, 3));
  vec3 r = vec3(eroFbm(p * 0.9 + q * 2.2 + 1.7, 3), eroFbm(p * 0.9 + q * 2.2 + 8.3, 3), eroFbm(p * 0.9 + q * 2.2 + 3.1, 3));
  vec3 bandP = vec3(p.x * 0.8, p.y * 3.2, p.z * 0.8);
  float f = eroFbm(bandP + r * 1.1, 4);
  float accent = eroFbm(bandP * 1.3 + r * 1.5 + 13.0, 3);
  float soft = eroFbm(p * 4.0 + r, 3);
  vec3 col;
#if ERO_VARIANT == 1
  // 樱花云海：以樱花粉为主的柔和云带，夹着奶油白和极少的嫩绿
  vec3 sakuraDeep = vec3(0.86, 0.46, 0.56);
  vec3 sakura = vec3(0.97, 0.70, 0.76);
  vec3 cream = vec3(0.99, 0.93, 0.86);
  col = mix(sakuraDeep, sakura, smoothstep(0.36, 0.5, f));
  col = mix(col, cream, smoothstep(0.54, 0.66, f));
  col = mix(col, vec3(0.70, 0.82, 0.48), smoothstep(0.6, 0.72, accent) * (1.0 - smoothstep(0.5, 0.6, f)) * 0.6);
#elif ERO_VARIANT == 2
  // 春芽草甸：暖黄绿的草甸，大片油菜花黄，零星白云
  vec3 meadow = vec3(0.36, 0.58, 0.20);
  vec3 sprout = vec3(0.66, 0.80, 0.30);
  vec3 rapeseed = vec3(0.96, 0.84, 0.30);
  float patches = eroFbm(p * 2.0 + r * 2.0, 4);
  col = mix(meadow, sprout, smoothstep(0.4, 0.56, patches));
  col = mix(col, rapeseed, smoothstep(0.58, 0.68, accent) * 0.9);
  float cloud = smoothstep(0.62, 0.78, eroFbm(vec3(p.x * 2.0, p.y * 5.0, p.z * 2.0) + r * 1.4 + 21.0, 4));
  col = mix(col, vec3(0.99, 0.98, 0.94), cloud * 0.7);
#elif ERO_VARIANT == 3
  // 晨曦花海：杏色、珊瑚、蜜桃的日出渐变，夹一点薰衣草紫
  vec3 coral = vec3(0.93, 0.50, 0.42);
  vec3 apricot = vec3(0.98, 0.72, 0.48);
  vec3 honey = vec3(1.0, 0.88, 0.66);
  vec3 lavender = vec3(0.74, 0.66, 0.86);
  col = mix(coral, apricot, smoothstep(0.36, 0.5, f));
  col = mix(col, honey, smoothstep(0.54, 0.68, f));
  col = mix(col, lavender, smoothstep(0.6, 0.72, accent) * smoothstep(0.42, 0.55, f) * 0.7);
#elif ERO_VARIANT == 4
  // 柳絮薄雾：极淡的青柠、奶白，整颗星球笼着一圈流动的白雾，安静克制
  vec3 deepGreen = vec3(0.30, 0.56, 0.24);
  vec3 lime = vec3(0.56, 0.76, 0.32);
  vec3 celadon = vec3(0.74, 0.86, 0.56);
  vec3 milk = vec3(0.95, 0.97, 0.88);
  col = mix(deepGreen, lime, smoothstep(0.34, 0.48, f));
  col = mix(col, celadon, smoothstep(0.5, 0.62, f));
  col = mix(col, milk, smoothstep(0.64, 0.76, f) * 0.7);
  // 白雾：轮廓更清楚的流动雾带
  float mist = smoothstep(0.56, 0.68, eroFbm(vec3(p.x * 1.6, p.y * 7.0, p.z * 1.6) + r * 1.6 + 7.0, 4));
  col = mix(col, vec3(0.99, 1.0, 0.96), mist * 0.6);
  // Neutral 色调映射原样保留饱和度，这套配色会偏艳；把饱和度收回一部分，保持"安静克制"。
  col = mix(vec3(dot(col, vec3(0.2126, 0.7152, 0.0722))), col, 0.62);
#else
  // 当前方案：新叶绿、嫩黄、奶油白、樱花粉
  vec3 leaf = vec3(0.30, 0.58, 0.20);
  vec3 sprout = vec3(0.68, 0.84, 0.34);
  vec3 cream = vec3(0.98, 0.93, 0.80);
  vec3 blossom = vec3(0.98, 0.62, 0.70);
  vec3 peach = vec3(0.99, 0.80, 0.66);
  col = mix(leaf, sprout, smoothstep(0.36, 0.5, f));
  col = mix(col, cream, smoothstep(0.52, 0.64, f));
  col = mix(col, peach, smoothstep(0.62, 0.72, f) * 0.6);
  // 粉色只开在奶油色区域里，避免和绿色直接混成灰色
  float pink = smoothstep(0.48, 0.6, accent) * smoothstep(0.54, 0.64, f);
  col = mix(col, blossom, pink * 0.9);
#endif
  col *= 0.97 + soft * 0.06;
  s.albedo = col;
  s.roughness = 0.72;
  s.metalness = 0.0;
  s.height = f * 0.25;
#elif defined(ERO_STUDIO)
  // 吸光物质：近乎纯黑的暗色气态球，只有极淡的流纹
  float flow = eroFbm(vec3(p.x * 2.0, p.y * 10.0, p.z * 2.0) + vec3(uEroTime * 0.003, 0.0, 0.0), 5);
  float lat = p.y + (flow - 0.5) * 0.12;
  float bands = 0.5 + 0.5 * sin(lat * 26.0);
  s.albedo = vec3(0.012, 0.014, 0.018) + vec3(0.02, 0.026, 0.034) * bands * flow;
  s.roughness = 0.9;
  s.metalness = 0.0;
  s.height = flow * 0.15;
#else
  // Core：熔金
  float flow = eroFbm(p * 2.6 + vec3(uEroTime * 0.02), 5);
  float cells = eroCellular(p * 4.0).x;
  vec3 gold = mix(vec3(0.42, 0.26, 0.10), vec3(0.92, 0.70, 0.40), smoothstep(0.35, 0.8, flow));
  s.albedo = gold;
  s.roughness = mix(0.22, 0.5, flow);
  s.metalness = 0.9;
  s.height = flow * 0.6 + cells * 0.3;
  s.emissive = vec3(1.0, 0.6, 0.25) * smoothstep(0.6, 0.9, flow) * 0.6;
#endif
  return s;
}
`
