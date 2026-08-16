import { Link } from 'react-router-dom'
import { celestials } from '../../domain/worlds'
import styles from './fallback.module.css'

export function StaticUniverse() {
  return (
    <section className={styles.staticUniverse} aria-label="Static universe">
      <div className={styles.staticDepth} aria-hidden="true" />
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
