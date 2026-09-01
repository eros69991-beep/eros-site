import { useRef, type CSSProperties } from 'react'
import { useSiteStore } from '../../state/siteStore'
import { useWorldEntry } from '../transitions/useWorldEntry'
import { PORTAL_ORDER, getPortalBody, getSwipeDestination } from './portalModel'
import styles from './universe.module.css'

export function SemanticCelestialControls() {
  const { enterWorld } = useWorldEntry()
  const selected = useSiteStore((state) => state.selectedCelestial)
  const selectCelestial = useSiteStore((state) => state.selectCelestial)
  const pointerStartX = useRef<number | null>(null)
  const ignoreNextClick = useRef(false)
  const body = selected ? getPortalBody(selected) : null
  const selectedIndex = selected ? PORTAL_ORDER.indexOf(selected) : 0

  return (
    <nav aria-label="Celestial destinations" className={styles.celestialControls}>
      <div
        className={styles.controlList}
        onPointerDown={(event) => {
          if (event.pointerType === 'touch') pointerStartX.current = event.clientX
        }}
        onPointerUp={(event) => {
          if (event.pointerType !== 'touch' || pointerStartX.current === null) return
          const current = selected ?? PORTAL_ORDER[0]
          const destination = getSwipeDestination(current, event.clientX - pointerStartX.current, window.innerWidth)
          ignoreNextClick.current = destination !== current
          selectCelestial(destination)
          pointerStartX.current = null
        }}
        onPointerCancel={() => { pointerStartX.current = null }}
        style={{ '--portal-index': selectedIndex } as CSSProperties}
      >
        {PORTAL_ORDER.map((id) => {
          const portalBody = getPortalBody(id)
          const isSelected = selected === id
          return (
            <button
              aria-pressed={isSelected}
              className={styles.celestialControl}
              key={id}
              onClick={() => {
                if (ignoreNextClick.current) {
                  ignoreNextClick.current = false
                  return
                }
                selectCelestial(id)
              }}
              onFocus={() => selectCelestial(id)}
              onMouseEnter={() => selectCelestial(id)}
              type="button"
            >
              {portalBody.index} / {portalBody.label}
            </button>
          )
        })}
      </div>
      <output aria-live="polite" className={styles.portalIdentity}>
        {body ? `${body.index} / ${body.label}` : ''}
      </output>
      <output aria-label="Portal position" className={styles.mobilePosition}>
        {body ? `${body.index}–05` : '01–05'}
      </output>
      {body?.world ? (
        <button className={styles.enterControl} onClick={() => enterWorld(body.world!, 'universe')} type="button">
          ENTER
        </button>
      ) : null}
    </nav>
  )
}
