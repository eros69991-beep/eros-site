import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  ShaderMaterial,
  type Group,
  type MeshBasicMaterial,
} from 'three'
import type { WorldSceneProps } from '../../../scene/contracts'
import { getSceneTime } from '../../../scene/sceneClock'
import { SUMMER_PALETTE, getSummerAtmosphere } from './summerAtmosphere'
import {
  createSummerExposureController,
  getSummerBoundaryChromaticStrength,
  getSummerRuntimeFrame,
  installSummerSceneEnvironment,
} from './summerSceneRuntime'

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

function DryParticles({ particleCount, progress, quality, reducedMotion }: {
  particleCount: number
  progress: WorldSceneProps['progress']
  quality: WorldSceneProps['quality']
  reducedMotion: boolean
}) {
  const groupRef = useRef<Group>(null)
  const geometry = useMemo(() => createDryParticleGeometry(particleCount), [particleCount])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    if (!groupRef.current) return
    const frame = getSummerRuntimeFrame(progress.current, reducedMotion, quality, getSceneTime())
    groupRef.current.position.x = frame.particleOffset
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

function HeatBoundary({ progress, quality, reducedMotion }: {
  progress: WorldSceneProps['progress']
  quality: WorldSceneProps['quality']
  reducedMotion: boolean
}) {
  const materialRef = useRef<ShaderMaterial>(null)
  const material = useMemo(() => new ShaderMaterial({
    depthWrite: false,
    transparent: true,
    uniforms: {
      amplitude: { value: 0 },
      chromaticStrength: { value: 0 },
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
      uniform float chromaticStrength;
      uniform float time;
      void main() {
        float boundary = smoothstep(0.92, 0.28, length(vUv - 0.5) * 1.6);
        float shimmer = 0.65 + sin((vUv.y + time * 0.03) * 18.0) * 0.35;
        float redShift = sin((vUv.y + chromaticStrength * 150.0 + time * 0.03) * 18.0) - shimmer;
        float blueShift = sin((vUv.y - chromaticStrength * 150.0 + time * 0.03) * 18.0) - shimmer;
        vec3 separation = vec3(redShift, 0.0, blueShift) * boundary * 0.015;
        gl_FragColor = vec4(vec3(0.98) + separation, boundary * shimmer * 0.028);
      }
    `,
  }), [])

  useEffect(() => () => material.dispose(), [material])

  useFrame(() => {
    const activeMaterial = materialRef.current
    const amplitudeUniform = activeMaterial?.uniforms.amplitude
    const chromaticUniform = activeMaterial?.uniforms.chromaticStrength
    const timeUniform = activeMaterial?.uniforms.time
    if (!amplitudeUniform || !chromaticUniform || !timeUniform) return

    const frame = getSummerRuntimeFrame(progress.current, reducedMotion, quality, getSceneTime())
    amplitudeUniform.value = frame.atmosphere.heatAmplitude
    chromaticUniform.value = getSummerBoundaryChromaticStrength(quality, reducedMotion)
    timeUniform.value = frame.heatTime
  })

  return (
    <mesh position={[0, 0.2, -2.5]} renderOrder={1}>
      <planeGeometry args={[20, 13]} />
      <primitive ref={materialRef} attach="material" object={material} />
    </mesh>
  )
}

function HardShadow({ progress, quality, reducedMotion }: {
  progress: WorldSceneProps['progress']
  quality: WorldSceneProps['quality']
  reducedMotion: boolean
}) {
  const materialRef = useRef<MeshBasicMaterial>(null)

  useFrame(() => {
    if (!materialRef.current) return
    const frame = getSummerRuntimeFrame(progress.current, reducedMotion, quality, getSceneTime())
    materialRef.current.opacity = frame.shadowOpacity
  })

  return (
    <mesh position={[-2.8, -2.88, -0.8]} rotation={[-Math.PI / 2, 0, 0]} scale={[3.8, 1.1, 1]}>
      <circleGeometry args={[1, 40]} />
      <meshBasicMaterial ref={materialRef} color="#605F5A" depthWrite={false} opacity={0} transparent />
    </mesh>
  )
}

function SummerAtmosphereRuntime({
  progress,
  quality,
  reducedMotion,
}: {
  progress: WorldSceneProps['progress']
  quality: WorldSceneProps['quality']
  reducedMotion: boolean
}) {
  const { gl, scene } = useThree()
  const exposureControllerRef = useRef<ReturnType<typeof createSummerExposureController>>(null)

  useEffect(() => {
    const restoreEnvironment = installSummerSceneEnvironment(scene)
    const exposureController = createSummerExposureController(gl)
    exposureControllerRef.current = exposureController

    return () => {
      exposureController.restore()
      restoreEnvironment()
      exposureControllerRef.current = null
    }
  }, [gl, scene])

  useFrame(() => {
    const frame = getSummerRuntimeFrame(progress.current, reducedMotion, quality, getSceneTime())
    exposureControllerRef.current?.apply(frame.atmosphere)
  })

  return null
}

export default function SummerScene({ quality, reducedMotion, progress }: WorldSceneProps) {
  const particleCount = getSummerAtmosphere(0, reducedMotion, quality).particleCount

  return (
    <group>
      <SummerAtmosphereRuntime
        progress={progress}
        quality={quality}
        reducedMotion={reducedMotion}
      />
      <ambientLight color="#F5F3EB" intensity={0.52} />
      <directionalLight castShadow color="#FFFFFF" intensity={3.6} position={[-6, 8, 5]} />
      <mesh position={[0, -2.9, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[34, 22]} />
        <meshStandardMaterial color={SUMMER_PALETTE.ground} metalness={0.05} roughness={0.86} />
      </mesh>
      <HardShadow progress={progress} quality={quality} reducedMotion={reducedMotion} />
      <DryParticles
        particleCount={particleCount}
        progress={progress}
        quality={quality}
        reducedMotion={reducedMotion}
      />
      <HeatBoundary progress={progress} quality={quality} reducedMotion={reducedMotion} />
    </group>
  )
}
