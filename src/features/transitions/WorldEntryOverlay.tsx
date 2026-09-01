import { worlds } from '../../domain/worlds'
import { useWorldEntry } from './useWorldEntry'
import styles from './transitions.module.css'

interface WorldEntryOverlayProps {
  onReturnToUniverse(): void
}

function statusMessage(status: ReturnType<typeof useWorldEntry>['state']) {
  if (status.status === 'failed') return status.message

  switch (status.status) {
    case 'targeting':
      return `Preparing ${status.world}.`
    case 'loading':
      return `Loading ${status.world}.`
    case 'ready':
      return `${status.world} is ready.`
    case 'transitioning':
      return `Entering ${status.world}.`
    case 'committing':
      return `Entering ${status.world}.`
    case 'idle':
      return ''
  }
}

export function WorldEntryOverlay({ onReturnToUniverse }: WorldEntryOverlayProps) {
  const { continueStatic, reset, state } = useWorldEntry()

  if (state.status === 'idle') return null

  if (state.status !== 'failed') {
    return <p aria-live="polite" className="sr-only" role="status">{statusMessage(state)}</p>
  }

  const worldName = worlds.find((world) => world.id === state.world)?.season ?? state.world.toUpperCase()

  const returnToUniverse = () => {
    reset()
    onReturnToUniverse()
  }

  return (
    <section aria-labelledby="world-entry-title" aria-modal="true" className={styles.overlay} role="dialog">
      <div className={styles.panel}>
        <p className={styles.eyebrow}>WORLD ENTRY</p>
        <h2 id="world-entry-title">ENTERING {worldName}</h2>
        <p aria-live="polite" className={styles.status} role="status">{statusMessage(state)}</p>
        {state.status === 'failed' && (
          <div className={styles.recovery}>
            <button type="button" onClick={continueStatic}>CONTINUE WITH REDUCED VISUALS</button>
            <button type="button" onClick={returnToUniverse}>RETURN TO UNIVERSE</button>
          </div>
        )}
      </div>
    </section>
  )
}
