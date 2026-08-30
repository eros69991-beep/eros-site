import { Link } from 'react-router-dom'
import styles from './studio.module.css'

export function StudioPage() {
  return (
    <section className={styles.studio} aria-labelledby="studio-heading">
      <header className={styles.intro}>
        <p className={styles.kicker}>ARCHIVE / WORKROOM</p>
        <h1 id="studio-heading">THE STUDIO</h1>
      </header>
      <div className={styles.regions}>
        <section aria-labelledby="what-eros-is"><h2 id="what-eros-is">WHAT EROS IS</h2><p>EROS is an evolving collection of material studies, objects, and atmospheres.</p></section>
        <section aria-labelledby="material-making"><h2 id="material-making">MATERIAL AND MAKING</h2><p>Material direction remains close to process: surface, weight, wear, and the conditions that shape each object.</p></section>
        <section aria-labelledby="future-process-media"><h2 id="future-process-media">FUTURE PROCESS MEDIA</h2><p>Demonstration process media will enter this workroom later.</p></section>
        <section aria-labelledby="studio-archive"><h2 id="studio-archive">ARCHIVE</h2><Link to="/archive">ARCHIVE / ALL OBJECTS</Link></section>
        <section aria-labelledby="contact-information"><h2 id="contact-information">CONTACT INFORMATION</h2><p>Contact information will be shared here.</p></section>
      </div>
    </section>
  )
}
