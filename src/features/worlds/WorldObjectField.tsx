import { Link } from 'react-router-dom'
import { formatUsd } from '../../domain/objects'
import { filterObjects } from '../../domain/selectors'
import type { ObjectDefinition, WorldDefinition } from '../../domain/types'
import { mediaManifest, type DemoMediaKey } from '../../media/mediaManifest'
import { pictureFallbackSource, pictureSourceSet, WORLD_OBJECT_SIZES } from '../../media/warmPicture'
import styles from './worlds.module.css'
import { rememberWorldReturnContext } from './worldReturnContext'

const OBJECT_MEDIA_KEYS = {
  spring: ['spring-object-001', 'spring-object-002'],
  summer: ['summer-object-001', 'summer-object-002'],
  autumn: ['autumn-object-001', 'autumn-object-002'],
  winter: ['winter-object-001', 'winter-object-002'],
} as const satisfies Record<WorldDefinition['id'], readonly DemoMediaKey[]>

interface ManifestPictureProps {
  mediaKey: DemoMediaKey
  priority?: boolean
  sizes: string
}

export function ManifestPicture({ mediaKey, priority = false, sizes }: ManifestPictureProps) {
  const media = mediaManifest[mediaKey]
  const fallback = pictureFallbackSource(media)

  return (
    <picture>
      <source sizes={sizes} srcSet={pictureSourceSet(media, 'avif')} type="image/avif" />
      <source sizes={sizes} srcSet={pictureSourceSet(media, 'webp')} type="image/webp" />
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
  const returnSelector = `a[data-world-object="${object.id}"]`

  return (
    <article className={styles.objectEncounter}>
      <Link aria-label={`View ${object.name}, ${object.objectNumber}`} className={`${styles.objectMediaLink} touch-link`} data-world-object={object.id} onClick={() => rememberWorldReturnContext(returnSelector)} to={`/product/${object.slug}`}>
        <ManifestPicture mediaKey={mediaKey} priority sizes={WORLD_OBJECT_SIZES} />
      </Link>
      <div className={styles.objectFacts}>
        <p className={styles.objectNumber}>{object.objectNumber}</p>
        <h3><Link className="touch-link" onClick={() => rememberWorldReturnContext(returnSelector)} to={`/product/${object.slug}`}>{object.name}</Link></h3>
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
