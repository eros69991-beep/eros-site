import { mediaManifest, type DemoMedia, type DemoMediaFormat, type DemoMediaKey } from './mediaManifest'

/** 季节页主图和单品图使用的 sizes，必须和页面上 <picture> 的 sizes 完全一致，预热的才是同一张图。 */
export const WORLD_EDITORIAL_SIZES = '(max-width: 44rem) 100vw, 72vw'
export const WORLD_OBJECT_SIZES = '(max-width: 44rem) 88vw, 62vw'

export function pictureSourceSet(media: DemoMedia, format: DemoMediaFormat) {
  return media.sources[format].map((source) => `${source.src} ${source.width}w`).join(', ')
}

export function pictureFallbackSource(media: DemoMedia) {
  return media.sources.webp.find((source) => source.width === 960) ?? media.sources.webp[0]!
}

/** 保留预热过的图片元素，浏览器不会把已经解码的图片立刻丢掉。 */
const warmed = new Map<string, HTMLImageElement>()

/**
 * 在页面外按同样的 <picture>（AVIF/WebP + 同样的 sizes）建一张图并解码，
 * 浏览器会选中和真正页面完全相同的那个文件；之后页面渲染时直接用缓存里已解码的图，不再空白一下。
 */
export function warmManifestPicture(mediaKey: DemoMediaKey, sizes: string): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()

  const key = `${mediaKey}|${sizes}`
  let image = warmed.get(key)
  if (!image) {
    const media = mediaManifest[mediaKey]
    const picture = document.createElement('picture')
    for (const format of ['avif', 'webp'] as const) {
      const source = document.createElement('source')
      source.type = `image/${format}`
      source.sizes = sizes
      source.srcset = pictureSourceSet(media, format)
      picture.appendChild(source)
    }
    image = document.createElement('img')
    image.decoding = 'async'
    image.alt = ''
    picture.appendChild(image)
    image.src = pictureFallbackSource(media).src
    warmed.set(key, image)
  }

  if (typeof image.decode !== 'function') return Promise.resolve()
  const target = image
  return target.decode().catch((error: unknown) => {
    // 失败时下次重新建，不缓存失败结果
    warmed.delete(key)
    throw error
  })
}
