export const HOMEPAGE_ASSET_IDS = [
  'core', 'spring', 'summer', 'autumn', 'winter', 'studio',
]

export const HOMEPAGE_LODS = ['low', 'medium', 'high']

export const REQUIRED_MATERIAL_SLOTS = {
  core: ['core_obsidian', 'core_matte_metal', 'core_liquid_mask', 'core_crystal', 'core_emissive_mask'],
  spring: ['spring_shell', 'spring_interior', 'spring_growth_mask'],
  summer: ['summer_metal', 'summer_heat_mask'],
  autumn: ['autumn_mineral', 'autumn_oxidation_mask'],
  winter: ['winter_ice', 'winter_fissure'],
  studio: ['studio_absorber', 'studio_rim_mask'],
}

const MAX_TEXTURE_EDGE = 2_048
const MAX_LOW_TEXTURE_EDGE = 1_024
const MAX_MOBILE_MINIMUM_BYTES = 1.5 * 1024 * 1024
const MAX_DESKTOP_MINIMUM_BYTES = 3.5 * 1024 * 1024
const MAX_SELECTED_HIGH_DETAIL_BYTES = 1.25 * 1024 * 1024
const MAX_MOBILE_VISIBLE_TRIANGLES = 80_000
const MAX_BALANCED_VISIBLE_TRIANGLES = 120_000
const MAX_HIGH_VISIBLE_TRIANGLES = 180_000
const SHA_256 = /^[a-f0-9]{64}$/

function fail(message) {
  throw new Error(`Invalid homepage asset manifest: ${message}`)
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function requireRecord(value, label) {
  if (!isRecord(value)) fail(`missing ${label}`)
  return value
}

function requirePositiveFinite(value, label) {
  if (!Number.isFinite(value) || value <= 0) fail(`invalid ${label}`)
}

function requireUrl(value, label, extension, seenUrls) {
  if (typeof value !== 'string' || !value.endsWith(extension)) {
    fail(`${label} must use ${extension.toUpperCase().slice(1)}`)
  }
  if (seenUrls.has(value)) fail(`duplicate URL: ${value}`)
  seenUrls.add(value)
}

function validateBounds(bounds, label) {
  if (!isRecord(bounds)
    || !Array.isArray(bounds.center)
    || bounds.center.length !== 3
    || !bounds.center.every(Number.isFinite)
    || !Number.isFinite(bounds.radius)
    || bounds.radius <= 0) {
    fail(`invalid bounds for ${label}`)
  }
}

function validateTextureSet(textures, label, seenUrls) {
  const textureSet = requireRecord(textures, `textures for ${label}`)
  for (const key of ['baseColor', 'normal', 'orm']) {
    requireUrl(textureSet[key], `${label} ${key} texture`, '.ktx2', seenUrls)
  }
  if (textureSet.emissiveMask !== undefined) {
    requireUrl(textureSet.emissiveMask, `${label} emissive mask`, '.ktx2', seenUrls)
  }
  if (!Array.isArray(textureSet.effectMasks)) {
    fail(`invalid effect masks for ${label}`)
  }
  textureSet.effectMasks.forEach((url, index) => {
    requireUrl(url, `${label} effect mask ${index}`, '.ktx2', seenUrls)
  })
}

function validateMaterialSlots(assetId, slots, label) {
  if (!Array.isArray(slots)) fail(`missing material slots for ${label}`)
  const required = REQUIRED_MATERIAL_SLOTS[assetId]
  for (const slot of required) {
    if (!slots.includes(slot)) fail(`missing material slot ${slot} for ${label}`)
  }
  for (const slot of slots) {
    if (!required.includes(slot)) fail(`unexpected material slot ${slot} for ${label}`)
  }
  if (new Set(slots).size !== slots.length) fail(`duplicate material slot for ${label}`)
}

function validateFallback(fallback, seenUrls) {
  const fallbackRecord = requireRecord(fallback, 'fallback posters')
  for (const viewport of ['desktop', 'mobile']) {
    const posters = requireRecord(fallbackRecord[viewport], `${viewport} fallback posters`)
    for (const format of ['avif', 'webp']) {
      const url = posters[format]
      if (typeof url !== 'string' || !url.endsWith(`.${format}`)) {
        fail(`${viewport} fallback posters must use AVIF/WebP`)
      }
      if (seenUrls.has(url)) fail(`duplicate URL: ${url}`)
      seenUrls.add(url)
    }
  }
}

function validateSceneCeilings(assets) {
  const lowRecords = HOMEPAGE_ASSET_IDS.map((assetId) => assets[assetId].low)
  const lowBytes = lowRecords.reduce((total, record) => total + record.bytes, 0)
  const lowTriangles = lowRecords.reduce((total, record) => total + record.triangles, 0)

  if (lowBytes > MAX_MOBILE_MINIMUM_BYTES) {
    fail(`mobile minimum asset bytes exceed ${MAX_MOBILE_MINIMUM_BYTES}`)
  }
  if (lowBytes > MAX_DESKTOP_MINIMUM_BYTES) {
    fail(`desktop minimum asset bytes exceed ${MAX_DESKTOP_MINIMUM_BYTES}`)
  }
  if (lowTriangles > MAX_MOBILE_VISIBLE_TRIANGLES) {
    fail(`mobile visible triangles exceed ${MAX_MOBILE_VISIBLE_TRIANGLES}`)
  }

  for (const assetId of HOMEPAGE_ASSET_IDS.filter((id) => id !== 'core')) {
    const otherLowTriangles = HOMEPAGE_ASSET_IDS
      .filter((id) => id !== 'core' && id !== assetId)
      .reduce((total, id) => total + assets[id].low.triangles, 0)
    const balancedTriangles = assets.core.medium.triangles
      + assets[assetId].medium.triangles
      + otherLowTriangles
    const highTriangles = assets.core.high.triangles
      + assets[assetId].high.triangles
      + otherLowTriangles

    if (balancedTriangles > MAX_BALANCED_VISIBLE_TRIANGLES) {
      fail(`balanced visible triangles exceed ${MAX_BALANCED_VISIBLE_TRIANGLES}`)
    }
    if (highTriangles > MAX_HIGH_VISIBLE_TRIANGLES) {
      fail(`high visible triangles exceed ${MAX_HIGH_VISIBLE_TRIANGLES}`)
    }
    if (assets[assetId].high.bytes > MAX_SELECTED_HIGH_DETAIL_BYTES) {
      fail(`selected high-detail bytes exceed ${MAX_SELECTED_HIGH_DETAIL_BYTES}`)
    }
  }
}

export function validateHomepageManifest(value) {
  const manifest = requireRecord(value, 'manifest')
  if (manifest.schemaVersion !== 1) fail('unsupported schema version')
  const assets = requireRecord(manifest.assets, 'assets')
  const seenUrls = new Set()

  for (const assetId of HOMEPAGE_ASSET_IDS) {
    const assetLods = assets[assetId]
    for (const lod of HOMEPAGE_LODS) {
      const label = `${assetId} ${lod}`
      const record = requireRecord(assetLods?.[lod], label)
      if (record.assetId !== assetId) fail(`invalid assetId for ${label}`)
      if (record.role !== (assetId === 'core' ? 'core' : 'portal-body')) {
        fail(`invalid role for ${label}`)
      }
      if (record.lod !== lod) fail(`invalid lod for ${label}`)
      requireUrl(record.url, `${label} model`, '.glb', seenUrls)
      requirePositiveFinite(record.bytes, `${label} bytes`)
      requirePositiveFinite(record.triangles, `${label} triangles`)
      requirePositiveFinite(record.materials, `${label} materials`)
      validateMaterialSlots(assetId, record.materialSlots, label)
      if (record.materials !== record.materialSlots.length) {
        fail(`material count does not match slots for ${label}`)
      }
      validateTextureSet(record.textures, label, seenUrls)
      validateBounds(record.bounds, label)
      if (!Number.isInteger(record.textureMaxEdge) || record.textureMaxEdge <= 0
        || record.textureMaxEdge > MAX_TEXTURE_EDGE
        || (lod === 'low' && record.textureMaxEdge > MAX_LOW_TEXTURE_EDGE)) {
        fail(`invalid texture edge for ${label}`)
      }
      if (typeof record.sha256 !== 'string' || !SHA_256.test(record.sha256)) {
        fail(`invalid SHA-256 for ${label}`)
      }
    }
  }

  validateFallback(manifest.fallback, seenUrls)
  validateSceneCeilings(assets)
  return manifest
}
