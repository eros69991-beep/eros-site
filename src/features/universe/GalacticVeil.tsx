import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, type ShaderMaterial } from 'three'
import { getSceneTime } from '../../scene/sceneClock'
import { GALAXY_LAYERS, getGalaxyLayerSeed, type GalaxyLayer } from './galaxyLayers'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uSeed;
  uniform float uWarmth;
  uniform float uDrift;
  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1, 0)), f.x),
      mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.55;
    for (int octave = 0; octave < 5; octave++) {
      value += noise2(p) * amplitude;
      p = p * 2.03 + vec2(4.7, 2.3);
      amplitude *= 0.48;
    }
    return value;
  }

  void main() {
    vec2 centered = vUv * 2.0 - 1.0;
    float warpedY = centered.y + (fbm(vec2(centered.x * 2.1 + uSeed, uSeed)) - 0.5) * 0.42;
    float center = exp(-pow(abs(warpedY) * 2.15, 1.38));
    float halo = exp(-pow(abs(centered.y) * 1.05, 1.65));
    float edgeFade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(0.0, 0.1, 1.0 - vUv.x);
    edgeFade *= smoothstep(0.0, 0.12, vUv.y) * smoothstep(0.0, 0.12, 1.0 - vUv.y);
    vec2 drift = vec2(uTime * uDrift, -uTime * uDrift * 0.21);
    float cloud = fbm(vUv * vec2(10.0, 7.0) + drift + uSeed);
    float filament = fbm(vUv * vec2(31.0, 18.0) - drift * 0.7 + uSeed * 0.13);
    float knots = smoothstep(0.67, 0.9, fbm(vUv * vec2(7.0, 15.0) + uSeed * 0.27));
    float darkLane = smoothstep(0.43, 0.62, fbm(vUv * vec2(18.0, 5.0) - uSeed * 0.09));
    float structure = center * (0.12 + cloud * 0.74 + filament * 0.22 + knots * 0.35);
    structure *= mix(1.0, 0.34, darkLane * center);
    float alpha = edgeFade * uOpacity * (structure + halo * cloud * 0.08);
    vec3 cold = vec3(0.24, 0.27, 0.30);
    vec3 warm = vec3(0.48, 0.43, 0.37);
    vec3 color = mix(cold, warm, clamp(uWarmth + cloud * 0.16, 0.0, 1.0));
    color *= 0.62 + filament * 0.72 + knots * 0.45;
    gl_FragColor = vec4(color, alpha);
  }
`

function VeilLayer({ layer, reducedMotion }: { layer: GalaxyLayer; reducedMotion: boolean }) {
  const materialRef = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: layer.opacity },
    uSeed: { value: getGalaxyLayerSeed(layer.id) },
    uWarmth: { value: layer.warmth },
    uDrift: { value: layer.drift },
  }), [layer])

  useFrame(() => {
    const liveMaterial = materialRef.current
    if (!reducedMotion && liveMaterial) {
      liveMaterial.uniforms.uTime!.value = getSceneTime()
    }
  })

  return (
    <mesh position={layer.position} renderOrder={layer.id === 'near' ? 2 : -2} rotation={[0, 0, layer.rotation]}>
      <planeGeometry args={[layer.width, layer.height]} />
      <shaderMaterial
        ref={materialRef}
        blending={AdditiveBlending}
        depthWrite={false}
        fragmentShader={fragmentShader}
        transparent
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </mesh>
  )
}

export function GalacticVeil({ reducedMotion }: { reducedMotion: boolean }) {
  return GALAXY_LAYERS.map((layer) => (
    <VeilLayer key={layer.id} layer={layer} reducedMotion={reducedMotion} />
  ))
}
