import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react'
import { Link, useLocation, type Location } from 'react-router-dom'
import { worlds } from '../../domain/worlds'
import { useSiteStore } from '../../state/siteStore'
import { useWorldEntry } from '../transitions/useWorldEntry'
import styles from './navigation.module.css'

interface WorldGateProps {
  openerRef: RefObject<HTMLButtonElement | null>
}

interface OverlayState {
  backgroundLocation?: Location
}

export function WorldGate({ openerRef }: WorldGateProps) {
  const open = useSiteStore((state) => state.worldGateOpen)
  const setWorldGateOpen = useSiteStore((state) => state.setWorldGateOpen)
  const { enterWorld } = useWorldEntry()
  const location = useLocation()
  const firstControlRef = useRef<HTMLButtonElement>(null)
  const lastControlRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstControlRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      openerRef.current?.focus()
      setWorldGateOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, openerRef, setWorldGateOpen])

  if (!open) return null

  const closeGate = () => {
    openerRef.current?.focus()
    setWorldGateOpen(false)
  }

  const closeForNavigation = () => setWorldGateOpen(false)
  const backgroundLocation = (location.state as OverlayState | null)?.backgroundLocation ?? location
  const overlayState = { backgroundLocation }
  const trapTabAtBoundary = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return

    if (event.shiftKey && event.target === firstControlRef.current) {
      event.preventDefault()
      lastControlRef.current?.focus()
    }

    if (!event.shiftKey && event.target === lastControlRef.current) {
      event.preventDefault()
      firstControlRef.current?.focus()
    }
  }

  return (
    <div className={styles.backdrop}>
      <section aria-label="World Gate" aria-modal="true" className={styles.gate} role="dialog">
        <div className={styles.gateHeader}>
          <h2>WORLD GATE</h2>
          <button ref={firstControlRef} className={styles.closeButton} type="button" onClick={closeGate} onKeyDown={trapTabAtBoundary}>
            CLOSE
          </button>
        </div>
        <nav aria-label="World Gate destinations" className={styles.gateNavigation}>
          {worlds.map((world) => (
            <button
              key={world.id}
              className={`${styles.gateLink} ${styles.gateWorldButton}`}
              onClick={() => {
                closeForNavigation()
                enterWorld(world.id, 'world-gate')
              }}
              type="button"
            >
              {world.season}
            </button>
          ))}
          <Link className={styles.gateLink} to="/archive" onClick={closeForNavigation}>ARCHIVE</Link>
          <Link className={styles.gateLink} to="/studio" onClick={closeForNavigation}>STUDIO</Link>
          <Link className={styles.gateLink} to="/search" state={overlayState} onClick={closeForNavigation}>SEARCH</Link>
          <Link ref={lastControlRef} className={styles.gateLink} to="/bag" state={overlayState} onClick={closeForNavigation} onKeyDown={trapTabAtBoundary}>BAG</Link>
        </nav>
      </section>
    </div>
  )
}
