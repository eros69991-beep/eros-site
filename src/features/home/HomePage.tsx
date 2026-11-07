import { useEffect, useState } from 'react'
import { SemanticCelestialControls } from '../universe/SemanticCelestialControls'
import { HomeIntro } from './HomeIntro'
import { startIdleWorldPrefetch } from './idleWorldPrefetch'
import {
  getHomepageIntroDuration,
  markHomepageIntroSeen,
  readHomepageIntroSeen,
  type SessionStorageLike,
} from './homepageSession'
import styles from './home.module.css'

function getBrowserSessionStorage(): SessionStorageLike | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function HomePage() {
  const [introActive, setIntroActive] = useState(() => {
    if (typeof window === 'undefined') return false

    const storage = getBrowserSessionStorage()
    return !storage || !readHomepageIntroSeen(storage)
  })

  // 首页空闲时预取各季节页的场景代码和主图，点击星球时不用再等下载
  useEffect(() => startIdleWorldPrefetch(), [])

  useEffect(() => {
    if (!introActive || typeof window === 'undefined') return

    const storage = getBrowserSessionStorage()
    if (storage) markHomepageIntroSeen(storage)

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const timeout = window.setTimeout(() => setIntroActive(false), getHomepageIntroDuration(reducedMotion))

    return () => window.clearTimeout(timeout)
  }, [introActive])

  return (
    <section aria-labelledby="home-heading" className={styles.home}>
      <h1 className={styles.visuallyHidden} id="home-heading">EROS</h1>
      <HomeIntro active={introActive} />
      <div className={styles.portalContent} data-intro-active={introActive || undefined}>
        <SemanticCelestialControls />
        <p className={styles.homeLine}>Nothing stays expected.</p>
      </div>
    </section>
  )
}
