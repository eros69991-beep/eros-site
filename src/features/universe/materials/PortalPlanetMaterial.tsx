import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, type ShaderMaterial } from 'three'
import { getSceneTime } from '../../../scene/sceneClock'
import { PORTAL_MATERIAL_PROFILES, type PortalMaterialId } from './portalMaterials'

const vertexShader = `
  varying vec3 vObjectPosition;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;

  void main() {
    vObjectPosition = normalize(position);
    vViewNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`

const fragmentShader = `
  uniform vec3 uLowColor;
  uniform vec3 uHighColor;
  uniform vec3 uSeamColor;
  uniform vec3 uRimColor;
  uniform float uMacroScale;
  uniform float uDetailScale;
  uniform float uSeamScale;
  uniform float uSeamWidth;
  uniform float uRoughness;
  uniform float uMetalness;
  uniform float uEmission;
  uniform float uTransmission;
  uniform float uCrackStrength;
  uniform float uRimStrength;
  uniform float uSelected;
  uniform float uTime;
  varying vec3 vObjectPosition;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;

  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i), hash31(i + vec3(1, 0, 0)), f.x),
          mix(hash31(i + vec3(0, 1, 0)), hash31(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0, 0, 1)), hash31(i + vec3(1, 0, 1)), f.x),
          mix(hash31(i + vec3(0, 1, 1)), hash31(i + vec3(1, 1, 1)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.52;
    mat3 rotation = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);
    for (int octave = 0; octave < 5; octave++) {
      value += amplitude * noise3(p);
      p = rotation * p * 2.03 + vec3(3.1, 1.7, 2.4);
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 p = vObjectPosition;
    float macro = fbm(p * uMacroScale + vec3(0.0, uTime * 0.00008, 0.0));
    float detail = fbm(p * uDetailScale);
    float contour = 1.0 - abs(fbm(p * uSeamScale + macro * 0.42) * 2.0 - 1.0);
    float seam = smoothstep(uSeamWidth, min(0.9998, uSeamWidth + 0.009), contour);

    float mineral = smoothstep(0.22, 0.82, macro + (detail - 0.5) * 0.16);
    vec3 baseColor = mix(uLowColor, uHighColor, mineral);
    vec3 materialColor = mix(baseColor, uSeamColor, seam * uCrackStrength);
    materialColor *= 0.84 + detail * 0.28;

    vec3 normal = normalize(vViewNormal);
    vec3 viewDirection = normalize(-vViewPosition);
    vec3 keyDirection = normalize(vec3(-0.64, 0.72, 0.82));
    vec3 fillDirection = normalize(vec3(0.72, -0.28, 0.5));
    float key = max(dot(normal, keyDirection), 0.0);
    float fill = max(dot(normal, fillDirection), 0.0);
    float diffuse = 0.075 + key * 0.82 + fill * 0.18;
    float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 7.0);
    vec3 halfVector = normalize(keyDirection + viewDirection);
    float specularPower = mix(12.0, 92.0, 1.0 - uRoughness);
    float specular = pow(max(dot(normal, halfVector), 0.0), specularPower);
    specular *= mix(0.015, 0.45, uMetalness) * (0.2 + seam * 1.2);

    vec3 color = materialColor * diffuse;
    color += uRimColor * rim * (0.075 + uTransmission * 1.15) * uRimStrength;
    color += vec3(specular);
    color += uSeamColor * seam * uEmission * uCrackStrength;
    color *= mix(0.84, 1.0, uSelected);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export function PortalPlanetMaterial({
  id,
  reducedMotion,
  selected,
}: {
  id: PortalMaterialId
  reducedMotion: boolean
  selected: boolean
}) {
  const profile = PORTAL_MATERIAL_PROFILES[id]
  const materialRef = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    uLowColor: { value: new Color(profile.lowColor) },
    uHighColor: { value: new Color(profile.highColor) },
    uSeamColor: { value: new Color(profile.seamColor) },
    uRimColor: { value: new Color(profile.rimColor) },
    uMacroScale: { value: profile.macroScale },
    uDetailScale: { value: profile.detailScale },
    uSeamScale: { value: profile.seamScale },
    uSeamWidth: { value: profile.seamWidth },
    uRoughness: { value: profile.roughness },
    uMetalness: { value: profile.metalness },
    uEmission: { value: profile.emission },
    uTransmission: { value: profile.transmission },
    uCrackStrength: { value: profile.crackStrength },
    uRimStrength: { value: profile.rimStrength },
    uSelected: { value: selected ? 1 : 0 },
    uTime: { value: 0 },
  }), [profile, selected])

  useFrame(() => {
    const liveMaterial = materialRef.current
    if (!reducedMotion && liveMaterial) {
      liveMaterial.uniforms.uTime!.value = getSceneTime()
    }
  })

  return (
    <shaderMaterial
      ref={materialRef}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
      vertexShader={vertexShader}
    />
  )
}
