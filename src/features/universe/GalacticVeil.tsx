import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, type ShaderMaterial } from 'three'
import { getSceneTime } from '../../scene/sceneClock'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
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
    float center = 1.0 - abs(vUv.y * 2.0 - 1.0);
    float falloff = pow(max(center, 0.0), 2.6);
    float edgeFade = smoothstep(0.0, 0.13, vUv.x) * smoothstep(0.0, 0.13, 1.0 - vUv.x);
    float cloud = fbm(vUv * vec2(13.0, 8.0) + vec2(uTime * 0.00012, 0.0));
    float filament = fbm(vUv * vec2(34.0, 18.0) - vec2(uTime * 0.00008, 0.0));
    float alpha = edgeFade * falloff * (0.018 + cloud * 0.075 + filament * 0.028);
    vec3 color = mix(vec3(0.14, 0.145, 0.15), vec3(0.42, 0.40, 0.38), cloud);
    gl_FragColor = vec4(color, alpha);
  }
`

export function GalacticVeil({ reducedMotion }: { reducedMotion: boolean }) {
  const materialRef = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame(() => {
    const liveMaterial = materialRef.current
    if (!reducedMotion && liveMaterial) {
      liveMaterial.uniforms.uTime!.value = getSceneTime()
    }
  })

  return (
    <mesh position={[-0.8, -0.2, -8]} rotation={[0, 0, -0.4]} scale={[1, 1, 1]}>
      <planeGeometry args={[42, 6]} />
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
