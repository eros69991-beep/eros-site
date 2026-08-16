import { demoObjects } from './objects'
import type { ObjectDefinition, WorldDefinition, WorldId } from './types'
import { worlds } from './worlds'

export interface ObjectFilters {
  world: WorldId[]
  type: ObjectDefinition['type'][]
  material: string[]
  color: string[]
}

export function getWorld(id: WorldId): WorldDefinition {
  const world = worlds.find((candidate) => candidate.id === id)
  if (!world) throw new Error(`Unknown World: ${id}`)
  return world
}

export function getObject(slug: string): ObjectDefinition | undefined {
  return demoObjects.find((object) => object.slug === slug)
}

function matchesFilter<T>(values: T[], candidate: T): boolean {
  return values.length === 0 || values.includes(candidate)
}

function matchesAnyFilter(values: string[], candidates: string[]): boolean {
  return values.length === 0 || candidates.some((candidate) => values.includes(candidate))
}

export function filterObjects(filters: ObjectFilters): ObjectDefinition[] {
  return demoObjects.filter((object) =>
    matchesFilter(filters.world, object.world) &&
    matchesFilter(filters.type, object.type) &&
    matchesAnyFilter(filters.material, object.material) &&
    matchesAnyFilter(filters.color, object.color),
  )
}

export function searchObjects(query: string): ObjectDefinition[] {
  const normalizedQuery = query.trim().toLocaleLowerCase()

  return demoObjects.filter((object) => {
    const searchableFields = [
      object.name,
      object.objectNumber,
      object.world,
      object.type,
      ...object.feel,
      ...object.material,
      ...object.color,
    ]

    return searchableFields.some((field) => field.toLocaleLowerCase().includes(normalizedQuery))
  })
}
