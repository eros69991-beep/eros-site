import { useEffect, useRef, type RefObject } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { worlds } from '../../domain/worlds'
import { useSiteStore } from '../../state/siteStore'
import styles from './navigation.module.css'

interface WorldGateProps {
  openerRef: RefObject<HTMLButtonElement | null>
}

export function WorldGate({ openerRef }: WorldGateProps) {
  const open = useSiteStore((state) => state.worldGateOpen)
  const setWorldGateOpen = useSiteStore((state) => state.setWorldGateOpen)
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
  const overlayState = { backgroundLocation: location }

  return (
    <div className={styles.backdrop}>
      <button
        aria-label="Start of World Gate"
        className={styles.focusSentinel}
        type="button"
        onFocus={() => lastControlRef.current?.focus()}
      />
      <section aria-label="World Gate" aria-modal="true" className={styles.gate} role="dialog">
        <div className={styles.gateHeader}>
          <h2>WORLD GATE</h2>
          <button ref={firstControlRef} className={styles.closeButton} type="button" onClick={closeGate}>
            CLOSE
          </button>
        </div>
        <nav aria-label="World Gate destinations" className={styles.gateNavigation}>
          {worlds.map((world) => (
            <Link key={world.id} className={styles.gateLink} to={world.route} onClick={closeForNavigation}>
              {world.season}
            </Link>
          ))}
          <Link className={styles.gateLink} to="/archive" onClick={closeForNavigation}>ARCHIVE</Link>
          <Link className={styles.gateLink} to="/studio" onClick={closeForNavigation}>STUDIO</Link>
          <Link className={styles.gateLink} to="/search" state={overlayState} onClick={closeForNavigation}>SEARCH</Link>
          <Link ref={lastControlRef} className={styles.gateLink} to="/bag" state={overlayState} onClick={closeForNavigation}>BAG</Link>
        </nav>
      </section>
      <button
        aria-label="End of World Gate"
        className={styles.focusSentinel}
        type="button"
        onFocus={() => firstControlRef.current?.focus()}
      />
    </div>
  )
}
