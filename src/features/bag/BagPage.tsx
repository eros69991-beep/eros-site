import { formatUsd } from '../../domain/objects'
import { demoObjects } from '../../domain/objects'
import { useSiteStore } from '../../state/siteStore'
import styles from './bag.module.css'

export function BagPage() {
  const bag = useSiteStore((state) => state.bag)
  const storageAvailable = useSiteStore((state) => state.storageAvailable)
  const removeFromBag = useSiteStore((state) => state.removeFromBag)
  const setBagQuantity = useSiteStore((state) => state.setBagQuantity)
  const lines = bag.flatMap((line) => {
    const object = demoObjects.find((candidate) => candidate.id === line.objectId)
    return object ? [{ ...line, object }] : []
  })
  const subtotal = lines.reduce((total, line) => total + line.object.price * line.quantity, 0)

  return (
    <section aria-labelledby="bag-heading" className={styles.bag}>
      <h1 id="bag-heading">BAG</h1>
      {!storageAvailable ? <p role="status">Bag may not persist after refresh.</p> : null}
      {lines.length === 0 ? <p className={styles.empty}>Your Bag is empty.</p> : (
        <ul className={styles.lines}>
          {lines.map(({ object, quantity, size }) => (
            <li key={`${object.id}-${size}`} className={styles.line}>
              <div><p>{object.objectNumber}</p><h2>{object.name}</h2><p>SIZE {size}</p><p>{formatUsd(object.price)}</p></div>
              <div className={styles.quantity} aria-label={`${object.name}, size ${size} quantity`}>
                <button aria-label={`Decrease ${object.name}, size ${size} quantity`} onClick={() => setBagQuantity(object.id, size, quantity - 1)} type="button">−</button>
                <output>{quantity}</output>
                <button aria-label={`Increase ${object.name}, size ${size} quantity`} onClick={() => setBagQuantity(object.id, size, quantity + 1)} type="button">+</button>
              </div>
              <button aria-label={`Remove ${object.name}, size ${size}`} onClick={() => removeFromBag(object.id, size)} type="button">REMOVE</button>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.subtotal}>SUBTOTAL {formatUsd(subtotal)}</p>
      <p>Checkout is unavailable in this frontend prototype.</p>
    </section>
  )
}
