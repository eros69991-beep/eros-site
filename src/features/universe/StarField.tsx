import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry, type ShaderMaterial } from 'three'
import { useMemo, useRef } from 'react'
import { getSceneTime } from '../../scene/sceneClock'
import { STAR_FIELD_SHARE } from './universeConfig'
import { createSeededStars } from './universeMath'

const vertexShader = `
  attribute float aSize;
  attribute float aLuminance;
  attribute float aTwinklePeriod;
  attribute float aTwinkleOffset;
  attribute float aTwinkleAmplitude;
  uniform float uTime;
  varying float vLuminance;
  void main() {
    float twinkle = sin((uTime / aTwinklePeriod) * 6.283185 + aTwinkleOffset) * aTwinkleAmplitude;
    vLuminance = aLuminance + twinkle;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (38.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  varying float vLuminance;
  void main() {
    float distanceToCenter = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.08, distanceToCenter) * vLuminance * 0.55;
    gl_FragColor = vec4(vec3(vLuminance), alpha);
  }
`

function StarCloud({ count, seed, reducedMotion }: { count: number; seed: number; reducedMotion: boolean }) {
  const materialRef = useRef<ShaderMaterial>(null)
  const geometry = useMemo(() => {
    const stars = createSeededStars(count, seed)
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const luminance = new Float32Array(count)
    const periods = new Float32Array(count)
    const offsets = new Float32Array(count)
    const amplitudes = new Float32Array(count)
    stars.forEach((star, index) => {
      positions.set(star.position, index * 3)
      sizes[index] = star.size
      luminance[index] = star.luminance
      periods[index] = star.twinklePeriod
      offsets[index] = star.twinkleOffset
      amplitudes[index] = star.twinkleAmplitude
    })
    const next = new BufferGeometry()
    next.setAttribute('position', new BufferAttribute(positions, 3))
    next.setAttribute('aSize', new BufferAttribute(sizes, 1))
    next.setAttribute('aLuminance', new BufferAttribute(luminance, 1))
    next.setAttribute('aTwinklePeriod', new BufferAttribute(periods, 1))
    next.setAttribute('aTwinkleOffset', new BufferAttribute(offsets, 1))
    next.setAttribute('aTwinkleAmplitude', new BufferAttribute(amplitudes, 1))
    return next
  }, [count, seed])

  useFrame(() => {
    const timeUniform = materialRef.current?.uniforms.uTime
    if (!reducedMotion && timeUniform) timeUniform.value = getSceneTime()
  })

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        blending={AdditiveBlending}
        depthWrite={false}
        fragmentShader={fragmentShader}
        transparent
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={vertexShader}
      />
    </points>
  )
}

export function StarField({ particleCount, reducedMotion }: { particleCount: number; reducedMotion: boolean }) {
  const farCount = Math.floor(particleCount * STAR_FIELD_SHARE)
  return <><StarCloud count={farCount} seed={1701} reducedMotion={reducedMotion} /><StarCloud count={particleCount - farCount} seed={9017} reducedMotion={reducedMotion} /></>
}
