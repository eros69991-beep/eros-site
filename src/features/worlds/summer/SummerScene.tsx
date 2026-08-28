import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  ShaderMaterial,
  type Group,
} from 'three'
import type { WorldSceneProps } from '../../../scene/contracts'
import { getSceneTime } from '../../../scene/sceneClock'
import {
  SUMMER_PALETTE,
  getSummerAirOffset,
  getSummerAtmosphere,
} from './summerAtmosphere'

function createDryParticleGeometry(count: number) {
  const positions = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3
    positions[offset] = ((index * 67) % 1000) / 1000 * 28 - 14
    positions[offset + 1] = ((index * 43) % 1000) / 1000 * 12 - 6
    positions[offset + 2] = -2.4 + ((index * 31) % 1000) / 1000 * 4.8
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  return geometry
}

function DryParticles({ particleCount, reducedMotion, airDrift }: {
  particleCount: number
  reducedMotion: boolean
  airDrift: number
}) {
  const groupRef = useRef<Group>(null)
  const geometry = useMemo(() => createDryParticleGeometry(particleCount), [particleCount])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    if (reducedMotion || !groupRef.current) return
    groupRef.current.position.x = getSummerAirOffset(getSceneTime(), airDrift)
  })

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <pointsMaterial
          color={SUMMER_PALETTE.particle}
          depthWrite={false}
          opacity={0.19}
          size={0.012}
          sizeAttenuation
          transparent
        />
      </points>
    </group>
  )
}

function HeatBoundary({ reducedMotion, heatAmplitude }: {
  reducedMotion: boolean
  heatAmplitude: number
}) {
  const materialRef = useRef<ShaderMaterial>(null)
  const material = useMemo(() => new ShaderMaterial({
    depthWrite: false,
    transparent: true,
    uniforms: {
      amplitude: { value: heatAmplitude },
      time: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float amplitude;
      uniform float time;
      void main() {
        vUv = uv;
        vec3 displaced = position;
        displaced.x += sin((position.y + time * 0.55) * 2.4) * amplitude * 20.0;
        displaced.y += cos((position.x - time * 0.36) * 3.0) * amplitude * 9.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float time;
      void main() {
        float boundary = smoothstep(0.92, 0.28, length(vUv - 0.5) * 1.6);
        float shimmer = 0.65 + sin((vUv.y + time * 0.03) * 18.0) * 0.35;
        gl_FragColor = vec4(vec3(0.98), boundary * shimmer * 0.028);
      }
    `,
  }), [heatAmplitude])

  useEffect(() => () => material.dispose(), [material])

  useFrame(() => {
    const activeMaterial = materialRef.current
    const amplitudeUniform = activeMaterial?.uniforms.amplitude
    const timeUniform = activeMaterial?.uniforms.time
    if (!amplitudeUniform || !timeUniform) return
    amplitudeUniform.value = reducedMotion ? 0 : heatAmplitude
    timeUniform.value = reducedMotion ? 0 : getSceneTime() % 96
  })

  return (
    <mesh position={[0, 0.2, -2.5]} renderOrder={1}>
      <planeGeometry args={[20, 13]} />
      <primitive ref={materialRef} attach="material" object={material} />
    </mesh>
  )
}

export default function SummerScene({ quality, reducedMotion, progress }: WorldSceneProps) {
  const atmosphere = getSummerAtmosphere(progress.current, reducedMotion, quality)

  return (
    <group>
      <color attach="background" args={[SUMMER_PALETTE.environment]} />
      <fogExp2 attach="fog" args={[SUMMER_PALETTE.environment, 0.026]} />
      <ambientLight color="#F5F3EB" intensity={0.52} />
      <directionalLight castShadow color="#FFFFFF" intensity={3.6} position={[-6, 8, 5]} />
      <mesh position={[0, -2.9, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[34, 22]} />
        <meshStandardMaterial color={SUMMER_PALETTE.ground} metalness={0.05} roughness={0.86} />
      </mesh>
      <mesh position={[-2.8, -2.88, -0.8]} rotation={[-Math.PI / 2, 0, 0]} scale={[3.8, 1.1, 1]}>
        <circleGeometry args={[1, 40]} />
        <meshBasicMaterial color="#605F5A" depthWrite={false} opacity={atmosphere.shadowCompression * 0.13} transparent />
      </mesh>
      <DryParticles
        airDrift={atmosphere.airDrift}
        particleCount={atmosphere.particleCount}
        reducedMotion={reducedMotion}
      />
      <HeatBoundary heatAmplitude={atmosphere.heatAmplitude} reducedMotion={reducedMotion} />
    </group>
  )
}
