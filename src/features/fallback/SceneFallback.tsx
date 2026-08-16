import styles from './fallback.module.css'

interface SceneFallbackProps {
  onRetry(): void
  onContinueStatic(): void
}

export function SceneFallback({ onRetry, onContinueStatic }: SceneFallbackProps) {
  return (
    <section className={styles.sceneFallback} aria-labelledby="scene-fallback-title">
      <div className={styles.fallbackPanel}>
        <p className={styles.status}>Realtime scene interrupted</p>
        <h2 id="scene-fallback-title">The semantic site remains available.</h2>
        <div className={styles.fallbackActions}>
          <button type="button" onClick={onRetry}>Retry realtime scene</button>
          <button type="button" onClick={onContinueStatic}>Continue with static visuals</button>
        </div>
      </div>
    </section>
  )
}
