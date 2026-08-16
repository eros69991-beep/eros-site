import { useParams } from 'react-router-dom'

export function WorldPage() {
  const { worldId } = useParams()
  return <section aria-labelledby="world-heading"><h1 id="world-heading">{worldId?.toUpperCase() ?? 'WORLD'}</h1></section>
}
