import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatUsd } from '../../domain/objects'
import { getObject, getWorld } from '../../domain/selectors'
import type { WorldId } from '../../domain/types'
import type { DemoMediaKey } from '../../media/mediaManifest'
import { ManifestPicture } from '../worlds/WorldObjectField'
import { useSiteStore } from '../../state/siteStore'
import styles from './product.module.css'

const OBJECT_MEDIA_KEYS = {
  'demo-spring-001': 'spring-object-001',
  'demo-spring-002': 'spring-object-002',
  'demo-summer-001': 'summer-object-001',
  'demo-summer-002': 'summer-object-002',
  'demo-autumn-001': 'autumn-object-001',
  'demo-autumn-002': 'autumn-object-002',
  'demo-winter-001': 'winter-object-001',
  'demo-winter-002': 'winter-object-002',
} as const

const EDITORIAL_MEDIA_KEYS = {
  spring: 'spring-editorial',
  summer: 'summer-editorial',
  autumn: 'autumn-editorial',
  winter: 'winter-editorial',
} as const satisfies Record<WorldId, DemoMediaKey>

export function ProductPage() {
  const { slug } = useParams()
  const object = slug ? getObject(slug) : undefined
  const [size, setSize] = useState<string | null>(null)
  const [validationMessage, setValidationMessage] = useState('')
  const addToBag = useSiteStore((state) => state.addToBag)

  if (!object) {
    return <section aria-labelledby="product-unavailable-heading" className={styles.unavailable}><h1 id="product-unavailable-heading">OBJECT UNAVAILABLE</h1><Link to="/archive">VIEW ARCHIVE</Link></section>
  }

  const world = getWorld(object.world)
  const objectMediaKey = OBJECT_MEDIA_KEYS[object.id as keyof typeof OBJECT_MEDIA_KEYS]
  const editorialMediaKey = EDITORIAL_MEDIA_KEYS[object.world]

  const addSelectedSize = () => {
    if (object.sizes.length > 0 && !size) {
      setValidationMessage('Select a size before adding this Object to Bag.')
      return
    }

    addToBag(object.id, size ?? '')
    setValidationMessage('Added to Bag.')
  }

  return (
    <article aria-labelledby="product-heading" className={styles.product}>
      <section aria-label="Primary media" className={styles.primaryMedia}>
        <ManifestPicture mediaKey={objectMediaKey} priority sizes="(max-width: 44rem) 100vw, 62vw" />
      </section>
      <header className={styles.facts}>
        <p>{object.objectNumber}</p>
        <h1 id="product-heading">{object.name}</h1>
      </header>
      <p className={styles.price}>{formatUsd(object.price)}</p>
      <fieldset className={styles.sizeSelection}>
        <legend>SIZE</legend>
        {object.sizes.map((option) => (
          <label key={option}>
            <input checked={size === option} name="size" onChange={() => { setSize(option); setValidationMessage('') }} type="radio" value={option} />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
      <section aria-label="Material and construction" className={styles.details}>
        <h2>MATERIAL / CONSTRUCTION</h2>
        <p>{object.material.join(' / ')}</p>
        <ul>{object.constructionNotes.map((note) => <li key={note}>{note}</li>)}</ul>
      </section>
      <section aria-label="Editorial media" className={styles.editorialMedia}>
        <ManifestPicture mediaKey={editorialMediaKey} sizes="(max-width: 44rem) 100vw, 50vw" />
        <p>{object.editorialCopy}</p>
      </section>
      <section aria-label="Design concept" className={styles.concept}>
        <h2>DESIGN CONCEPT</h2>
        <p>{object.designConcept}</p>
      </section>
      <section aria-label="Detail media" className={styles.detailMedia}>
        <ManifestPicture mediaKey={objectMediaKey} sizes="(max-width: 44rem) 100vw, 42vw" />
      </section>
      <div className={styles.actions}>
        <button onClick={addSelectedSize} type="button">Add to Bag</button>
        <p aria-live="polite" role={validationMessage.startsWith('Select') ? 'alert' : undefined}>{validationMessage}</p>
      </div>
      <Link className={styles.worldLink} to={world.route}>BELONGS TO — {world.season} / {world.concept}</Link>
    </article>
  )
}
