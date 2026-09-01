import styles from './home.module.css'

export function HomeIntro({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <div aria-hidden="true" className={styles.introOverlay}>
      <p className={styles.introPhrase}>NOTHING STAYS EXPECTED.</p>
    </div>
  )
}
