/* global Buffer, URL, console */

import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(new URL('../..', import.meta.url).pathname)
const outputRoot = path.join(root, 'public/assets/homepage/materials')
const width = 1024
const height = 512
const TAU = Math.PI * 2

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const smoothstep = (edge0, edge1, value) => {
  const t = clamp((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}
const mix = (a, b, amount) => a + (b - a) * amount
const colorMix = (a, b, amount) => a.map((value, index) => mix(value, b[index], amount))

function hash3(x, y, z) {
  const value = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123
  return value - Math.floor(value)
}

function noise3(x, y, z) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const iz = Math.floor(z)
  const fx = x - ix
  const fy = y - iy
  const fz = z - iz
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const uz = fz * fz * (3 - 2 * fz)
  const n000 = hash3(ix, iy, iz)
  const n100 = hash3(ix + 1, iy, iz)
  const n010 = hash3(ix, iy + 1, iz)
  const n110 = hash3(ix + 1, iy + 1, iz)
  const n001 = hash3(ix, iy, iz + 1)
  const n101 = hash3(ix + 1, iy, iz + 1)
  const n011 = hash3(ix, iy + 1, iz + 1)
  const n111 = hash3(ix + 1, iy + 1, iz + 1)
  const x00 = mix(n000, n100, ux)
  const x10 = mix(n010, n110, ux)
  const x01 = mix(n001, n101, ux)
  const x11 = mix(n011, n111, ux)
  return mix(mix(x00, x10, uy), mix(x01, x11, uy), uz)
}

function fbm(point, scale, octaves = 4) {
  let value = 0
  let amplitude = 0.5
  let frequency = scale
  for (let octave = 0; octave < octaves; octave += 1) {
    value += noise3(point[0] * frequency, point[1] * frequency, point[2] * frequency) * amplitude
    frequency *= 2.02
    amplitude *= 0.5
  }
  return value / 0.9375
}

function voronoiEdge(point, scale) {
  const scaled = point.map((value) => value * scale)
  const base = scaled.map((value) => Math.floor(value))
  let nearest = 999
  let second = 999
  for (let z = -1; z <= 1; z += 1) {
    for (let y = -1; y <= 1; y += 1) {
      for (let x = -1; x <= 1; x += 1) {
        const cell = [base[0] + x, base[1] + y, base[2] + z]
        const feature = [
          hash3(cell[0], cell[1], cell[2]),
          hash3(cell[1] + 17.3, cell[2] - 9.1, cell[0] + 4.7),
          hash3(cell[2] - 21.4, cell[0] + 6.2, cell[1] + 13.8),
        ]
        const distance = Math.hypot(
          scaled[0] - cell[0] - feature[0],
          scaled[1] - cell[1] - feature[1],
          scaled[2] - cell[2] - feature[2],
        )
        if (distance < nearest) {
          second = nearest
          nearest = distance
        } else if (distance < second) {
          second = distance
        }
      }
    }
  }
  return second - nearest
}

function profileSample(id, point) {
  const macro = fbm(point, 2.4, 4)
  const medium = fbm(point, 7.2, 3)
  const fine = fbm(point, 25, 3)
  const warped = [
    point[0] + (noise3(point[1] * 3.1, point[2] * 3.1, point[0] * 3.1) - 0.5) * 0.22,
    point[1] + (noise3(point[2] * 3.1, point[0] * 3.1, point[1] * 3.1) - 0.5) * 0.22,
    point[2] + (noise3(point[0] * 3.1, point[1] * 3.1, point[2] * 3.1) - 0.5) * 0.22,
  ]
  const cellular = noise3(warped[0] * 5.2, warped[1] * 5.2, warped[2] * 5.2)
  const crack = Math.pow(1 - clamp(Math.abs(cellular - 0.5) * 2), 23)
  const plate = smoothstep(0.26, 0.76, macro)
  const facet = Math.floor(clamp(fbm(point, 3.1, 3) * 6)) / 5
  const strataSignal = Math.abs(Math.sin((point[1] + (medium - 0.5) * 0.22) * 18 + point[0] * 2.8))
  const strata = Math.pow(1 - strataSignal, 8)

  if (id === 'spring') {
    const mineral = colorMix([0.16, 0.22, 0.19], [0.72, 0.80, 0.75], plate * 0.72 + facet * 0.28)
    const crystal = colorMix(mineral, [0.88, 0.93, 0.89], smoothstep(0.55, 0.92, medium) * 0.18)
    const color = colorMix(crystal, [0.055, 0.095, 0.085], crack * 0.24)
    return {
      color: color.map((value) => value * (0.84 + fine * 0.25)),
      height: 0.46 + plate * 0.18 + medium * 0.06 - crack * 0.07,
      roughness: 0.52 + medium * 0.20 + crack * 0.1,
      metalness: 0.03 + crack * 0.06,
      emissive: colorMix([0.0, 0.0, 0.0], [0.10, 0.22, 0.15], crack * 0.12),
    }
  }

  if (id === 'summer') {
    const forged = colorMix([0.012, 0.014, 0.016], [0.16, 0.11, 0.075], plate)
    const ablated = colorMix(forged, [0.26, 0.20, 0.15], smoothstep(0.56, 0.9, medium) * 0.4)
    const heat = crack * smoothstep(0.37, 0.72, fbm(point, 1.8, 3))
    const color = colorMix(ablated, [0.22, 0.045, 0.012], heat * 0.42)
    return {
      color: color.map((value) => value * (0.72 + fine * 0.3)),
      height: 0.46 + plate * 0.22 + medium * 0.06 - crack * 0.18,
      roughness: 0.36 + (1 - plate) * 0.26 + fine * 0.12,
      metalness: 0.62 + plate * 0.3,
      emissive: colorMix([0.0, 0.0, 0.0], [1.0, 0.13, 0.02], heat),
    }
  }

  if (id === 'autumn') {
    const mineral = colorMix([0.075, 0.06, 0.05], [0.30, 0.20, 0.14], plate)
    const layerSignal = 0.5 + 0.5 * Math.sin((point[1] + (medium - 0.5) * 0.26) * 13 + point[0] * 2.4)
    const layer = smoothstep(0.22, 0.78, layerSignal)
    const exposed = colorMix(mineral, [0.40, 0.24, 0.15], layer * 0.55)
    const oxide = smoothstep(0.52, 0.86, fbm(point, 3.5, 3)) * (0.35 + strata * 0.65)
    const color = colorMix(exposed, [0.44, 0.18, 0.07], oxide * 0.3)
    return {
      color: color.map((value) => value * (0.72 + fine * 0.3)),
      height: 0.4 + plate * 0.23 + layer * 0.1 + medium * 0.05 - crack * 0.1,
      roughness: 0.72 + medium * 0.18,
      metalness: 0.16 + oxide * 0.2,
      emissive: [oxide * 0.012, oxide * 0.004, 0.0],
    }
  }

  if (id === 'winter') {
    const ice = colorMix([0.42, 0.52, 0.56], [0.84, 0.91, 0.91], plate * 0.68 + facet * 0.32)
    const frost = colorMix(ice, [0.97, 0.99, 0.98], smoothstep(0.54, 0.9, medium) * 0.2)
    const fissure = smoothstep(0.08, 0.012, voronoiEdge(point, 4.4))
      * smoothstep(0.25, 0.62, fbm(point, 1.8, 3))
    const color = colorMix(frost, [0.006, 0.012, 0.015], fissure * 0.9)
    return {
      color: color.map((value) => value * (0.9 + fine * 0.13)),
      height: 0.5 + plate * 0.14 + medium * 0.08 - fissure * 0.18,
      roughness: 0.58 + medium * 0.2 + fissure * 0.18,
      metalness: 0.015,
      emissive: colorMix([0.0, 0.0, 0.0], [0.10, 0.19, 0.22], fissure * 0.08),
    }
  }

  if (id === 'studio') {
    const black = colorMix([0.0015, 0.002, 0.003], [0.018, 0.026, 0.034], plate * 0.7)
    const color = colorMix(black, [0.045, 0.06, 0.075], smoothstep(0.68, 0.92, fine) * 0.18)
    return {
      color: color.map((value) => value * (0.75 + fine * 0.3)),
      height: 0.45 + plate * 0.18 + medium * 0.06 - crack * 0.1,
      roughness: 0.86 + medium * 0.1,
      metalness: 0.08 + plate * 0.15,
      emissive: [0.002, 0.004, 0.007],
    }
  }

  const core = colorMix([0.002, 0.003, 0.004], [0.045, 0.055, 0.065], plate)
  const seam = crack * smoothstep(0.38, 0.8, macro)
  return {
    color: colorMix(core, [0.16, 0.12, 0.08], seam * 0.55).map((value) => value * (0.8 + fine * 0.24)),
    height: 0.43 + plate * 0.2 + medium * 0.06 - seam * 0.18,
    roughness: 0.48 + medium * 0.23,
    metalness: 0.24 + seam * 0.62,
    emissive: [seam * 0.07, seam * 0.035, seam * 0.012],
  }
}

function toByte(value) {
  return Math.round(clamp(value) * 255)
}

async function writeRgb(filePath, data, format = 'webp') {
  const image = sharp(data, { raw: { width, height, channels: 3 } })
  await (format === 'png' ? image.png({ compressionLevel: 9 }) : image.webp({ quality: 94 })).toFile(filePath)
}

async function writeGray(filePath, data) {
  await sharp(data, { raw: { width, height, channels: 1 } }).webp({ quality: 95 }).toFile(filePath)
}

async function build(id) {
  const color = Buffer.alloc(width * height * 3)
  const orm = Buffer.alloc(width * height * 3)
  const emissive = Buffer.alloc(width * height * 3)
  const heightField = new Float32Array(width * height)
  const normal = Buffer.alloc(width * height * 3)
  const heightBytes = Buffer.alloc(width * height)

  for (let y = 0; y < height; y += 1) {
    const phi = (y + 0.5) / height * Math.PI - Math.PI / 2
    const cosPhi = Math.cos(phi)
    const sinPhi = Math.sin(phi)
    for (let x = 0; x < width; x += 1) {
      const theta = (x + 0.5) / width * TAU
      const point = [cosPhi * Math.cos(theta), sinPhi, cosPhi * Math.sin(theta)]
      const sample = profileSample(id, point)
      const index = y * width + x
      heightField[index] = sample.height
      heightBytes[index] = toByte(sample.height)
      const offset = index * 3
      color[offset] = toByte(sample.color[0])
      color[offset + 1] = toByte(sample.color[1])
      color[offset + 2] = toByte(sample.color[2])
      orm[offset] = 255
      orm[offset + 1] = toByte(sample.roughness)
      orm[offset + 2] = toByte(sample.metalness)
      emissive[offset] = toByte(sample.emissive[0])
      emissive[offset + 1] = toByte(sample.emissive[1])
      emissive[offset + 2] = toByte(sample.emissive[2])
    }
  }

  for (let y = 0; y < height; y += 1) {
    const previousY = Math.max(0, y - 1)
    const nextY = Math.min(height - 1, y + 1)
    for (let x = 0; x < width; x += 1) {
      const previousX = (x - 1 + width) % width
      const nextX = (x + 1) % width
      const index = y * width + x
      const dx = heightField[y * width + nextX] - heightField[y * width + previousX]
      const dy = heightField[nextY * width + x] - heightField[previousY * width + x]
      const offset = index * 3
      normal[offset] = toByte(0.5 + dx * 0.9)
      normal[offset + 1] = toByte(0.5 + dy * 0.9)
      normal[offset + 2] = 255
    }
  }

  const directory = path.join(outputRoot, id)
  await fs.mkdir(directory, { recursive: true })
  await Promise.all([
    writeRgb(path.join(directory, 'color.webp'), color),
    writeRgb(path.join(directory, 'normal.png'), normal, 'png'),
    writeRgb(path.join(directory, 'orm.webp'), orm),
    writeRgb(path.join(directory, 'emissive.webp'), emissive),
    writeGray(path.join(directory, 'height.webp'), heightBytes),
  ])
}

for (const id of ['core', 'spring', 'summer', 'autumn', 'winter', 'studio']) {
  await build(id)
  console.log(`Generated homepage PBR maps for ${id}`)
}
