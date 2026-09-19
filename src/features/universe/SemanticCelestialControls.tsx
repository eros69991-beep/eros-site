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
  const selectedId = selected ?? 'spring'
  const body = getPortalBody(selectedId)
  const selectedIndex = PORTAL_ORDER.indexOf(selectedId)

  return (
    <nav aria-label="Celestial destinations" className={styles.celestialControls}>
      <div
        className={styles.controlList}
        style={{ '--portal-index': selectedIndex } as CSSProperties}
      >
        {PORTAL_ORDER.map((id) => {
          const portalBody = getPortalBody(id)
          const isSelected = selectedId === id
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
      <div
        aria-hidden="true"
        className={styles.swipeCapture}
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
      />
      <output aria-live="polite" className={styles.portalIdentity}>
        {`${body.index} / ${body.label}`}
      </output>
      <output aria-label="Portal position" className={styles.mobilePosition}>
        {PORTAL_ORDER.map((id) => (
          <span data-active={id === selectedId || undefined} key={id}>{getPortalBody(id).index}</span>
        ))}
      </output>
      {body?.world ? (
        <button className={styles.enterControl} onClick={() => enterWorld(body.world!, 'universe')} type="button">
          ENTER
        </button>
      ) : null}
    </nav>
  )
}
