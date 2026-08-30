import { Link, useSearchParams } from 'react-router-dom'
import { searchObjects } from '../../domain/selectors'
import styles from './search.module.css'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const results = query.trim() ? searchObjects(query) : []

  return (
    <section aria-labelledby="search-heading" className={styles.search}>
      <h1 id="search-heading">SEARCH</h1>
      <label className={styles.query}>
        <span>Search the archive</span>
        <input
          onChange={(event) => setSearchParams(event.target.value ? { q: event.target.value } : {})}
          type="search"
          value={query}
        />
      </label>
      {!query.trim() ? <p>Search by name, number, World, feel, type, material, and color.</p> : null}
      {query.trim() && results.length === 0 ? (
        <section aria-label="No search results" className={styles.empty}>
          <p>No Objects match “{query}”.</p>
          <Link to="/archive">View Archive</Link>
        </section>
      ) : null}
      {results.length > 0 ? (
        <div className={styles.results}>
          {results.map((object) => <article key={object.id}><Link to={`/product/${object.slug}`}><p>{object.objectNumber}</p><h2>{object.name}</h2><p>{object.world}</p></Link></article>)}
        </div>
      ) : null}
    </section>
  )
}
