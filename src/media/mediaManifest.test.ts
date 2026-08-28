import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mediaManifest } from './mediaManifest'

const requiredKeys = [
  'spring-editorial', 'spring-object-001', 'spring-object-002',
  'summer-editorial', 'summer-object-001', 'summer-object-002',
  'autumn-editorial', 'autumn-object-001', 'autumn-object-002',
  'winter-editorial', 'winter-object-001', 'winter-object-002',
] as const

describe('EROS demonstration media manifest', () => {
  it('publishes every required source with complete responsive AVIF and WebP files', () => {
    expect(Object.keys(mediaManifest)).toEqual(requiredKeys)

    for (const key of requiredKeys) {
      const media = mediaManifest[key]
      expect(media.width).toBeGreaterThan(0)
      expect(media.height).toBeGreaterThan(0)
      expect(media.alt.startsWith('Demonstration image:')).toBe(true)

      for (const format of ['avif', 'webp'] as const) {
        expect(media.sources[format].map((source) => source.width)).toEqual([640, 960, 1600])
        for (const source of media.sources[format]) {
          expect(source.height).toBeGreaterThan(0)
          expect(existsSync(resolve(process.cwd(), `public${source.src}`))).toBe(true)
        }
      }
    }
  })
})
