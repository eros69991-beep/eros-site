import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  HOMEPAGE_ASSET_IDS,
  HOMEPAGE_LODS,
  validateHomepageManifest,
} from './homepage-assets/manifest-schema.mjs'
import { runBlender } from './homepage-assets/run-blender.mjs'

const assetIds = ['core', 'spring', 'summer', 'autumn', 'winter', 'studio']
const lods = ['low', 'medium', 'high']
const materialSlots = {
  core: ['core_obsidian', 'core_matte_metal', 'core_liquid_mask', 'core_crystal', 'core_emissive_mask'],
  spring: ['spring_shell', 'spring_interior', 'spring_growth_mask'],
  summer: ['summer_metal', 'summer_heat_mask'],
  autumn: ['autumn_mineral', 'autumn_oxidation_mask'],
  winter: ['winter_ice', 'winter_fissure'],
  studio: ['studio_absorber', 'studio_rim_mask'],
}

function createManifest() {
  return {
    schemaVersion: 1,
    assets: Object.fromEntries(assetIds.map((assetId) => [assetId, Object.fromEntries(lods.map((lod) => [lod, {
      assetId,
      role: assetId === 'core' ? 'core' : 'portal-body',
      lod,
      url: `/assets/homepage/models/${assetId}-${lod}.glb`,
      bytes: 1_024,
      triangles: 100,
      materials: materialSlots[assetId].length,
      materialSlots: materialSlots[assetId],
      textures: {
        baseColor: `/assets/homepage/textures/${assetId}-${lod}-base-color.ktx2`,
        normal: `/assets/homepage/textures/${assetId}-${lod}-normal.ktx2`,
        orm: `/assets/homepage/textures/${assetId}-${lod}-orm.ktx2`,
        effectMasks: [],
      },
      bounds: { center: [0, 0, 0], radius: 1 },
      textureMaxEdge: lod === 'low' ? 1_024 : 2_048,
      sha256: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    }]))])),
    fallback: {
      desktop: {
        avif: '/assets/homepage/fallback/home-desktop.avif',
        webp: '/assets/homepage/fallback/home-desktop.webp',
      },
      mobile: {
        avif: '/assets/homepage/fallback/home-mobile.avif',
        webp: '/assets/homepage/fallback/home-mobile.webp',
      },
    },
  }
}

describe('homepage asset manifest', () => {
  it('requires six original assets at all three LODs', () => {
    expect(HOMEPAGE_ASSET_IDS).toEqual([
      'core', 'spring', 'summer', 'autumn', 'winter', 'studio',
    ])
    expect(HOMEPAGE_LODS).toEqual(['low', 'medium', 'high'])
    expect(() => validateHomepageManifest({ schemaVersion: 1, assets: {} }))
      .toThrow(/missing core low/i)
  })

  it('accepts a complete manifest with stable source metadata', () => {
    expect(() => validateHomepageManifest(createManifest())).not.toThrow()
  })

  it.each([
    ['wrong asset identity', (manifest) => { manifest.assets.spring.low.assetId = 'winter' }, /assetId/i],
    ['wrong role', (manifest) => { manifest.assets.core.low.role = 'portal-body' }, /role/i],
    ['wrong lod metadata', (manifest) => { manifest.assets.autumn.medium.lod = 'high' }, /lod/i],
    ['duplicate model URL', (manifest) => { manifest.assets.winter.low.url = manifest.assets.spring.low.url }, /duplicate url/i],
    ['non-GLB model URL', (manifest) => { manifest.assets.studio.high.url = '/studio.gltf' }, /GLB/i],
    ['non-KTX2 texture URL', (manifest) => { manifest.assets.summer.low.textures.orm = '/summer.orm.png' }, /KTX2/i],
    ['missing material slot', (manifest) => { manifest.assets.core.high.materialSlots.pop() }, /material slot/i],
    ['invalid bounds', (manifest) => { manifest.assets.spring.medium.bounds.radius = Infinity }, /bounds/i],
    ['invalid hash', (manifest) => { manifest.assets.winter.high.sha256 = 'abc' }, /SHA-256/i],
    ['non-positive bytes', (manifest) => { manifest.assets.autumn.low.bytes = 0 }, /bytes/i],
    ['non-positive triangles', (manifest) => { manifest.assets.autumn.low.triangles = 0 }, /triangles/i],
    ['texture edge above ceiling', (manifest) => { manifest.assets.summer.high.textureMaxEdge = 2_049 }, /texture edge/i],
    ['unsupported fallback poster', (manifest) => { manifest.fallback.mobile.webp = '/home-mobile.jpg' }, /AVIF\/WebP/i],
  ])('rejects %s', (_label, mutate) => {
    const manifest = createManifest()
    mutate(manifest)

    expect(() => validateHomepageManifest(manifest)).toThrow()
  })
})

describe('project-local Blender runner', () => {
  it('prefers EROS_BLENDER_BIN and forwards the requested source command', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'eros-blender-runner-'))
    const binary = join(directory, 'fake-blender')
    const originalBinary = process.env.EROS_BLENDER_BIN

    await writeFile(binary, '#!/bin/sh\nprintf "%s\\n" "$@"\n')
    await chmod(binary, 0o755)
    process.env.EROS_BLENDER_BIN = binary

    try {
      const result = runBlender('build', ['--quality', 'preview'])

      expect(result.status).toBe(0)
      expect(result.stdout).toContain('--background')
      expect(result.stdout).toContain('build_scene.py')
      expect(result.stdout).toContain('--quality')
      expect(result.stdout).toContain('preview')
    } finally {
      if (originalBinary === undefined) delete process.env.EROS_BLENDER_BIN
      else process.env.EROS_BLENDER_BIN = originalBinary
      await rm(directory, { recursive: true, force: true })
    }
  })
})
