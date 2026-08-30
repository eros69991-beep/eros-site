import { demoObjects } from './objects'
import type { ObjectDefinition, WorldDefinition, WorldId } from './types'
import { worlds } from './worlds'

export interface ObjectFilters {
  world: WorldId[]
  type: ObjectDefinition['type'][]
  material: string[]
  color: string[]
}

const worldIds = new Set<WorldId>(worlds.map((world) => world.id))
const objectTypes = new Set<ObjectDefinition['type']>(demoObjects.map((object) => object.type))

export function parseArchiveParams(searchParams: URLSearchParams): ObjectFilters {
  return {
    world: searchParams.getAll('world').filter((value): value is WorldId => worldIds.has(value as WorldId)),
    type: searchParams.getAll('type').filter((value): value is ObjectDefinition['type'] => objectTypes.has(value as ObjectDefinition['type'])),
    material: searchParams.getAll('material'),
    color: searchParams.getAll('color'),
  }
}

export function serializeArchiveParams(filters: ObjectFilters): URLSearchParams {
  const searchParams = new URLSearchParams()
  for (const world of filters.world) searchParams.append('world', world)
  for (const type of filters.type) searchParams.append('type', type)
  for (const material of filters.material) searchParams.append('material', material)
  for (const color of filters.color) searchParams.append('color', color)
  return searchParams
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
