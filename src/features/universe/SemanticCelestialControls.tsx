import { useEffect, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useSiteStore } from '../../state/siteStore'
import { useWorldEntry } from '../transitions/useWorldEntry'
import { PORTAL_ORDER, getPortalBody } from './portalModel'
import { homeOrbitClock } from './homeOrbitClock'
import styles from './universe.module.css'

export function SemanticCelestialControls() {
  const { enterWorld, state } = useWorldEntry()
  const selected = useSiteStore((state) => state.selectedCelestial)
  const selectCelestial = useSiteStore((state) => state.selectCelestial)
  const [userPaused, setUserPaused] = useState(false)
  const selectedId = selected ?? 'spring'
  const body = getPortalBody(selectedId)

  useEffect(() => {
    if (state.status === 'idle' || state.status === 'failed') {
      homeOrbitClock.setPaused('navigation', false)
    }
  }, [state.status])

  useEffect(() => () => {
    homeOrbitClock.setPaused('pointer', false)
    homeOrbitClock.setPaused('focus', false)
    homeOrbitClock.setPaused('navigation', false)
    homeOrbitClock.setPaused('user', false)
  }, [])

  const activateDestination = (event: MouseEvent<HTMLAnchorElement>, id: typeof PORTAL_ORDER[number]) => {
    const portalBody = getPortalBody(id)
    selectCelestial(id)
    const modified = event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    if (!portalBody.world || modified) return
    event.preventDefault()
    homeOrbitClock.setPaused('navigation', true)
    enterWorld(portalBody.world, 'universe')
  }

  return (
    <nav aria-label="Celestial destinations" className={styles.celestialControls}>
      <div className={styles.controlList}>
        {PORTAL_ORDER.map((id) => {
          const portalBody = getPortalBody(id)
          const isSelected = selectedId === id
          return (
            <Link
              aria-current={isSelected ? 'true' : undefined}
              aria-label={`${portalBody.index} / ${portalBody.label}`}
              className={styles.celestialControl}
              key={id}
              onClick={(event) => {
                activateDestination(event, id)
              }}
              onBlur={() => {
                homeOrbitClock.setPaused('focus', false)
                selectCelestial(null)
              }}
              onFocus={() => {
                homeOrbitClock.setPaused('focus', true)
                selectCelestial(id)
              }}
              onMouseEnter={() => {
                homeOrbitClock.setPaused('pointer', true)
                selectCelestial(id)
              }}
              onMouseLeave={() => {
                homeOrbitClock.setPaused('pointer', false)
                selectCelestial(null)
              }}
              to={portalBody.route}
            >
              <span aria-hidden="true">{portalBody.index}</span>
            </Link>
          )
        })}
      </div>
      <output
        aria-live="polite"
        className={styles.portalIdentity}
        data-selected={selected ? 'true' : undefined}
      >
        {`${body.index} / ${body.label}`}
      </output>
      <output aria-label="Portal position" className={styles.mobilePosition}>
        {PORTAL_ORDER.map((id) => (
          <span data-active={id === selectedId || undefined} key={id}>{getPortalBody(id).index}</span>
        ))}
      </output>
      <button
        aria-pressed={userPaused}
        className={styles.orbitToggle}
        onClick={() => {
          const next = !userPaused
          setUserPaused(next)
          homeOrbitClock.setPaused('user', next)
        }}
        type="button"
      >
        {userPaused ? 'RESUME' : 'PAUSE'}
      </button>
    </nav>
  )
}
