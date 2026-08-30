import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { celestials } from '../../domain/worlds'
import styles from './fallback.module.css'

const STAR_COUNT = 72
const stars = Array.from({ length: STAR_COUNT }, (_, index) => ({
  id: index,
  x: (index * 37 + 11) % 100,
  y: (index * 61 + 17) % 100,
  size: index % 5 === 0 ? 2 : 1,
}))

export function StaticUniverse() {
  return (
    <section className={styles.staticUniverse} aria-label="Static universe">
      <div className={styles.staticDepth} aria-hidden="true" />
      <div className={styles.staticStars} data-testid="static-stars" aria-hidden="true">
        {stars.map((star) => <i key={star.id} style={{ '--star-x': `${star.x}%`, '--star-y': `${star.y}%`, '--star-size': `${star.size}px` } as CSSProperties} />)}
      </div>
      <div className={styles.staticOrbits} data-testid="static-orbits" aria-hidden="true">
        <i /><i /><i /><i /><i />
      </div>
      <p className={styles.status}>Static celestial navigation</p>
      <nav aria-label="Static universe navigation" className={styles.celestialNavigation}>
        <ul className={styles.celestialList}>
          {celestials.map((celestial) => (
            <li key={celestial.id} className={styles.celestialItem}>
              <Link className={styles.celestialLink} to={celestial.route}>
                {celestial.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
