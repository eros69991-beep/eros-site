import { SemanticCelestialControls } from '../universe/SemanticCelestialControls'
import styles from '../universe/universe.module.css'

export function HomePage() {
  return (
    <section aria-labelledby="home-heading" className={styles.home}>
      <div className={styles.homeContent}>
        <h1 className={styles.title} id="home-heading">EROS<br />STUDIO</h1>
        <p className={styles.manifesto}>Five changing conditions orbit a proprietary core. Select one to enter its atmosphere.</p>
        <SemanticCelestialControls />
      </div>
    </section>
  )
}
