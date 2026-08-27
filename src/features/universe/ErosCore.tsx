import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BackSide, type Group } from 'three'
import { useMemo, useRef } from 'react'
import { createSeededStars } from './universeMath'
import { CORE_POSITION } from './universeConfig'

const cloudVertexShader = `
  varying vec3 vPosition;
  varying vec3 vViewNormal;
  void main() {
    vPosition = position;
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const cloudFragmentShader = `
  varying vec3 vPosition;
  varying vec3 vViewNormal;
  uniform float uCloudOpacity;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
      mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int octave = 0; octave < 4; octave++) {
      value += noise(p) * amplitude;
      p = p * 2.03 + 5.7;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 unitPosition = normalize(vPosition);
    float broadWeather = fbm(unitPosition * 3.2 + vec3(1.7, 0.3, 4.1));
    float fineWeather = fbm(unitPosition.yzx * 8.4 + vec3(2.4, 6.1, 0.8));
    float latitude = 1.0 - abs(unitPosition.y);
    float cloudMask = smoothstep(0.56, 0.77, mix(broadWeather, fineWeather, 0.42) + latitude * 0.08);
    float facing = smoothstep(-0.22, 0.8, vViewNormal.z);
    vec3 cloudColor = mix(vec3(0.33, 0.43, 0.45), vec3(0.72, 0.80, 0.79), fineWeather);
    gl_FragColor = vec4(cloudColor, cloudMask * facing * uCloudOpacity);
  }
`

export function ErosCore({ reducedMotion }: { reducedMotion: boolean }) {
  const cloudRef = useRef<Group>(null)
  const surfaceLights = useMemo(() => createSeededStars(120, 2047), [])
  const surfacePositions = useMemo(() => {
    const values = new Float32Array(surfaceLights.length * 3)
    surfaceLights.forEach((light, index) => {
      const [x, y, z] = light.position
      const length = Math.hypot(x, y, z) || 1
      values.set([(x / length) * 2.38, (y / length) * 2.38, (z / length) * 2.38], index * 3)
    })
    return values
  }, [surfaceLights])

  useFrame((_state, delta) => {
    if (!reducedMotion && cloudRef.current) cloudRef.current.rotation.y += delta * 0.0025
  })

  return (
    <group position={CORE_POSITION}>
      <mesh>
        <sphereGeometry args={[2.35, 64, 64]} />
        <meshStandardMaterial color="#071015" metalness={0.08} roughness={0.72} />
      </mesh>
      <group ref={cloudRef}>
        <mesh>
          <sphereGeometry args={[2.375, 48, 48]} />
          <shaderMaterial
            blending={AdditiveBlending}
            depthWrite={false}
            fragmentShader={cloudFragmentShader}
            transparent
            uniforms={{ uCloudOpacity: { value: 0.11 } }}
            vertexShader={cloudVertexShader}
          />
        </mesh>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[surfacePositions, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#C6D7D8" opacity={0.18} transparent size={0.028} sizeAttenuation depthWrite={false} />
        </points>
      </group>
      <mesh>
        <sphereGeometry args={[2.42, 64, 64]} />
        <meshBasicMaterial color="#B7CAD3" opacity={0.14} transparent side={BackSide} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
    </group>
  )
}
