import { Link, useParams } from 'react-router-dom'
import { getWorld } from '../../domain/selectors'
import type { WorldId } from '../../domain/types'
import { worlds } from '../../domain/worlds'
import type { DemoMediaKey } from '../../media/mediaManifest'
import { ManifestPicture, WorldObjectField } from './WorldObjectField'
import { WorldSceneFrame } from './WorldSceneFrame'
import styles from './worlds.module.css'

const EDITORIAL_MEDIA_KEYS = {
  spring: 'spring-editorial',
  summer: 'summer-editorial',
  autumn: 'autumn-editorial',
  winter: 'winter-editorial',
} as const satisfies Record<WorldId, DemoMediaKey>

const EDITORIAL_LINES: Record<WorldId, string> = {
  spring: 'Humidity returns to a sealed surface; the first opening is quiet.',
  summer: 'Hard light removes shelter and leaves every edge exposed.',
  autumn: 'Warmth recedes while the surface keeps the evidence of change.',
  winter: 'Distance slows exchange until only a preserved trace remains.',
}

function isWorldId(value: string | undefined): value is WorldId {
  return value === 'spring' || value === 'summer' || value === 'autumn' || value === 'winter'
}

export function WorldPage() {
  const { worldId } = useParams()

  if (!isWorldId(worldId)) {
    return (
      <section aria-labelledby="world-unavailable-heading">
        <h1 id="world-unavailable-heading">WORLD UNAVAILABLE</h1>
        <Link to="/archive">VIEW ARCHIVE</Link>
      </section>
    )
  }

  const world = getWorld(worldId)
  const nextWorld = worlds[world.order % worlds.length]!
  const number = String(world.order).padStart(2, '0')

  return (
    <WorldSceneFrame>
      <article className={styles.worldPage} data-world={world.id}>
        <section aria-label="Atmosphere" className={styles.atmosphere}>
          <p className={styles.worldNumber}>{number} / 04</p>
          <h1 aria-label={world.season}>{world.season}<span aria-hidden="true"> / </span><span>{world.concept}</span></h1>
          <p className={styles.gateLine}>{world.gateLine}</p>
        </section>

        <section aria-label="Editorial" className={styles.editorial}>
          <div className={styles.sectionHeader}>
            <p>EDITORIAL / DEMONSTRATION STUDY</p>
            <h2>{world.concept}</h2>
            <p className={styles.editorialLine}>{EDITORIAL_LINES[world.id]}</p>
          </div>
          <div className={styles.editorialMedia}>
            <ManifestPicture mediaKey={EDITORIAL_MEDIA_KEYS[world.id]} priority sizes="(max-width: 44rem) 100vw, 72vw" />
          </div>
        </section>

        <section aria-label="Objects" className={styles.objects}>
          <div className={styles.sectionHeader}>
            <p>OBJECTS / PROTOTYPE FIXTURES</p>
            <h2>OBJECTS</h2>
          </div>
          <WorldObjectField world={world} />
        </section>

        <section aria-label="Next World" className={styles.nextWorld}>
          <p>{number} / 04</p>
          <h2>{world.id === 'winter' ? 'RETURN' : 'NEXT WORLD'}</h2>
          <Link to={nextWorld.route}>{nextWorld.season} / {nextWorld.concept}</Link>
        </section>
      </article>
    </WorldSceneFrame>
  )
}
