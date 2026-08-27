import { useNavigate } from 'react-router-dom'
import { celestials } from '../../domain/worlds'
import { useSiteStore } from '../../state/siteStore'
import { CELESTIAL_LABELS } from './universeConfig'
import styles from './universe.module.css'

export function SemanticCelestialControls() {
  const navigate = useNavigate()
  const selected = useSiteStore((state) => state.selectedCelestial)
  const selectCelestial = useSiteStore((state) => state.selectCelestial)
  const selectedDefinition = celestials.find((celestial) => celestial.id === selected)
  const selectedLabel = selected ? CELESTIAL_LABELS[selected] : null

  return (
    <nav aria-label="Celestial destinations" className={styles.celestialControls}>
      <p className={styles.controlEyebrow}>SELECT A WORLD</p>
      <div className={styles.controlList}>
        {celestials.map((celestial) => {
          const label = CELESTIAL_LABELS[celestial.id]
          const isSelected = selected === celestial.id
          return (
            <button
              aria-pressed={isSelected}
              className={styles.celestialControl}
              key={celestial.id}
              onClick={() => selectCelestial(celestial.id)}
              onFocus={() => selectCelestial(celestial.id)}
              type="button"
            >
              <span>{label}</span>
              <span aria-hidden="true">{isSelected ? '—' : '+'}</span>
            </button>
          )
        })}
      </div>
      <button
        className={styles.enterControl}
        disabled={!selectedDefinition}
        onClick={() => selectedDefinition && navigate(selectedDefinition.route)}
        type="button"
      >
        {selectedLabel ? `Enter ${selectedLabel}` : 'Select a celestial body'}
      </button>
    </nav>
  )
}
