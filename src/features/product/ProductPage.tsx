import { useParams } from 'react-router-dom'

export function ProductPage() {
  const { slug } = useParams()
  return <section aria-labelledby="product-heading"><h1 id="product-heading">{slug ?? 'PRODUCT'}</h1></section>
}
