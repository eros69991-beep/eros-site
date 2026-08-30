import { Link } from 'react-router-dom'
import { formatUsd } from '../../domain/objects'
import { filterObjects } from '../../domain/selectors'
import type { ObjectDefinition, WorldDefinition } from '../../domain/types'
import {
  mediaManifest,
  type DemoMedia,
  type DemoMediaFormat,
  type DemoMediaKey,
} from '../../media/mediaManifest'
import styles from './worlds.module.css'

const OBJECT_MEDIA_KEYS = {
  spring: ['spring-object-001', 'spring-object-002'],
  summer: ['summer-object-001', 'summer-object-002'],
  autumn: ['autumn-object-001', 'autumn-object-002'],
  winter: ['winter-object-001', 'winter-object-002'],
} as const satisfies Record<WorldDefinition['id'], readonly DemoMediaKey[]>

function sourceSet(media: DemoMedia, format: DemoMediaFormat) {
  return media.sources[format].map((source) => `${source.src} ${source.width}w`).join(', ')
}

interface ManifestPictureProps {
  mediaKey: DemoMediaKey
  priority?: boolean
  sizes: string
}

export function ManifestPicture({ mediaKey, priority = false, sizes }: ManifestPictureProps) {
  const media = mediaManifest[mediaKey]
  const fallback = media.sources.webp.find((source) => source.width === 960) ?? media.sources.webp[0]

  return (
    <picture>
      <source sizes={sizes} srcSet={sourceSet(media, 'avif')} type="image/avif" />
      <source sizes={sizes} srcSet={sourceSet(media, 'webp')} type="image/webp" />
      <img
        alt={media.alt}
        className={styles.media}
        decoding="async"
        height={media.height}
        loading={priority ? undefined : 'lazy'}
        src={fallback.src}
        width={media.width}
      />
    </picture>
  )
}

function WorldObject({ mediaKey, object, world }: {
  mediaKey: DemoMediaKey
  object: ObjectDefinition
  world: WorldDefinition
}) {
  return (
    <article className={styles.objectEncounter}>
      <Link aria-label={`View ${object.name}, ${object.objectNumber}`} className={styles.objectMediaLink} to={`/product/${object.slug}`}>
        <ManifestPicture mediaKey={mediaKey} sizes="(max-width: 44rem) 88vw, 62vw" />
      </Link>
      <div className={styles.objectFacts}>
        <p className={styles.objectNumber}>{object.objectNumber}</p>
        <h3><Link to={`/product/${object.slug}`}>{object.name}</Link></h3>
        <p>{formatUsd(object.price)}</p>
        <p className={styles.objectWorld}>{world.season} / {world.concept} WORLD</p>
      </div>
    </article>
  )
}

export function WorldObjectField({ world }: { world: WorldDefinition }) {
  const objects = filterObjects({ world: [world.id], type: [], material: [], color: [] })
  const mediaKeys = OBJECT_MEDIA_KEYS[world.id]

  return (
    <div className={styles.objectField}>
      {objects.map((object, index) => {
        const mediaKey = mediaKeys[index]
        return mediaKey ? <WorldObject key={object.id} mediaKey={mediaKey} object={object} world={world} /> : null
      })}
    </div>
  )
}
