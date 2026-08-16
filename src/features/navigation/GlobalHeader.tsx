import type { RefObject } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSiteStore } from '../../state/siteStore'
import styles from './navigation.module.css'

interface GlobalHeaderProps {
  menuButtonRef: RefObject<HTMLButtonElement | null>
}

export function GlobalHeader({ menuButtonRef }: GlobalHeaderProps) {
  const location = useLocation()
  const bagCount = useSiteStore((state) => state.bag.reduce((total, line) => total + line.quantity, 0))
  const setWorldGateOpen = useSiteStore((state) => state.setWorldGateOpen)
  const overlayState = { backgroundLocation: location }

  return (
    <header className={styles.header}>
      <nav aria-label="Global navigation" className={styles.navigation}>
        <Link className={styles.link} to="/">EROS</Link>
        <div className={styles.actions}>
          <Link className={styles.link} to="/search" state={overlayState}>SEARCH</Link>
          <Link className={styles.link} to="/bag" state={overlayState}>BAG {bagCount}</Link>
          <button
            ref={menuButtonRef}
            className={styles.menuButton}
            type="button"
            onClick={() => setWorldGateOpen(true)}
          >
            MENU
          </button>
        </div>
      </nav>
    </header>
  )
}
