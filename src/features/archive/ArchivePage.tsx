import { Link, useSearchParams } from 'react-router-dom'
import { demoObjects, formatUsd } from '../../domain/objects'
import { filterObjects, parseArchiveParams, serializeArchiveParams, type ObjectFilters } from '../../domain/selectors'
import type { ObjectDefinition, WorldId } from '../../domain/types'
import { worlds } from '../../domain/worlds'
import { useWorldEntry } from '../transitions/useWorldEntry'
import styles from './archive.module.css'

const types = [...new Set(demoObjects.map((object) => object.type))]
const materials = [...new Set(demoObjects.flatMap((object) => object.material))]
const colors = [...new Set(demoObjects.flatMap((object) => object.color))]

function label(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`
}

function hasFilter<T>(values: T[], value: T) {
  return values.includes(value)
}

function ArchiveFilterGroup<T extends string>({ name, legend, values, selected, onToggle }: {
  name: keyof ObjectFilters
  legend: string
  values: readonly T[]
  selected: T[]
  onToggle(value: T, group: keyof ObjectFilters): void
}) {
  return (
    <fieldset className={styles.filterGroup}>
      <legend>{legend}</legend>
      {values.map((value) => (
        <label key={value} className={styles.option}>
          <input
            checked={hasFilter(selected, value)}
            name={name}
            onChange={() => onToggle(value, name)}
            type="checkbox"
            value={value}
          />
          {label(value)}
        </label>
      ))}
    </fieldset>
  )
}

function ObjectResult({ object }: { object: ObjectDefinition }) {
  return (
    <article className={styles.object}>
      <Link to={`/product/${object.slug}`}>
        <img alt={object.media[0]!.alt} height={object.media[0]!.height} src={object.media[0]!.src} width={object.media[0]!.width} />
        <p>{object.objectNumber}</p>
        <h2>{object.name}</h2>
        <p>{object.world}</p>
        <p>{formatUsd(object.price)}</p>
      </Link>
    </article>
  )
}

export function ArchivePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseArchiveParams(searchParams)
  const results = filterObjects(filters)
  const { enterWorld } = useWorldEntry()

  function toggleFilter(value: string, group: keyof ObjectFilters) {
    const values = filters[group] as string[]
    const next = values.includes(value) ? values.filter((candidate) => candidate !== value) : [...values, value]
    setSearchParams(serializeArchiveParams({ ...filters, [group]: next } as ObjectFilters))
  }

  return (
    <section aria-labelledby="archive-heading" className={styles.archive}>
      <header>
        <h1 id="archive-heading">ARCHIVE</h1>
        <p aria-label="Archive result count" aria-live="polite" role="status">{results.length} {results.length === 1 ? 'result' : 'results'}</p>
      </header>
      <form aria-label="Archive filters" className={styles.filters}>
        <ArchiveFilterGroup name="world" legend="World" onToggle={toggleFilter} selected={filters.world} values={worlds.map((world) => world.id)} />
        <ArchiveFilterGroup name="type" legend="Type" onToggle={toggleFilter} selected={filters.type} values={types} />
        <ArchiveFilterGroup name="material" legend="Material" onToggle={toggleFilter} selected={filters.material} values={materials} />
        <ArchiveFilterGroup name="color" legend="Color" onToggle={toggleFilter} selected={filters.color} values={colors} />
        <button onClick={() => setSearchParams(new URLSearchParams())} type="button">Reset filters</button>
      </form>
      {filters.world.map((worldId) => {
        const world = worlds.find((candidate) => candidate.id === worldId)!
        return <button className={styles.worldEntry} key={worldId} onClick={() => enterWorld(worldId as WorldId, 'archive')} type="button">Enter {label(world.season.toLowerCase())} / {label(world.concept.toLowerCase())}</button>
      })}
      {results.length > 0 ? (
        <div className={styles.results}>{results.map((object) => <ObjectResult key={object.id} object={object} />)}</div>
      ) : (
        <section aria-label="No archive results" className={styles.empty}><p>No Objects match these filters.</p></section>
      )}
    </section>
  )
}
