import { afterEach, describe, expect, it, vi } from 'vitest'
import { warmManifestPicture, WORLD_OBJECT_SIZES } from './warmPicture'

afterEach(() => {
  vi.restoreAllMocks()
  delete (HTMLImageElement.prototype as { decode?: unknown }).decode
})

describe('warmManifestPicture', () => {
  it('builds the same AVIF/WebP picture as the page and decodes it', async () => {
    // jsdom 没有 decode，这里补一个
    const decode = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(HTMLImageElement.prototype, 'decode', { configurable: true, value: decode })
    const created: HTMLImageElement[] = []
    const original = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      const element = original(tag)
      if (tag === 'img') created.push(element as HTMLImageElement)
      return element
    }) as typeof document.createElement)

    await warmManifestPicture('autumn-object-002', WORLD_OBJECT_SIZES)

    const image = created[0]!
    const sources = image.parentElement!.querySelectorAll('source')
    expect(sources[0]!.type).toBe('image/avif')
    expect(sources[0]!.getAttribute('sizes')).toBe(WORLD_OBJECT_SIZES)
    expect(sources[0]!.getAttribute('srcset')).toMatch(/autumn-object-002-1600\.avif 1600w/)
    expect(sources[1]!.type).toBe('image/webp')
    expect(image.getAttribute('src')).toBe('/media/demo/autumn-object-002-960.webp')
    expect(decode).toHaveBeenCalledOnce()
  })
})
