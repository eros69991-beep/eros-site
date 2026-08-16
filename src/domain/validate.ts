import type { ObjectDefinition, WorldDefinition } from './types'

export function validateCatalog(worldDefinitions: WorldDefinition[], objects: ObjectDefinition[]): void {
  const worldIds = new Set(worldDefinitions.map((world) => world.id))
  const objectIds = new Set<string>()
  const slugs = new Set<string>()

  for (const object of objects) {
    if (!object.prototype) throw new Error(`Non-demonstration object: ${object.id}`)
    if (!worldIds.has(object.world)) throw new Error(`Unknown World: ${object.world}`)
    if (objectIds.has(object.id)) throw new Error(`Duplicate object id: ${object.id}`)
    if (slugs.has(object.slug)) throw new Error(`Duplicate object slug: ${object.slug}`)
    objectIds.add(object.id)
    slugs.add(object.slug)
  }
}
