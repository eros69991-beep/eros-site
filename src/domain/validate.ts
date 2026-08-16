import type { ObjectDefinition, WorldDefinition } from './types'

type ValidatableObject = Omit<ObjectDefinition, 'prototype' | 'world'> & {
  prototype: boolean
  world: string
}

export function validateCatalog(worldDefinitions: readonly WorldDefinition[], objects: readonly ValidatableObject[]): void {
  const worldIds = new Set<string>(worldDefinitions.map((world) => world.id))
  const objectIds = new Set<string>()
  const slugs = new Set<string>()

  for (const object of objects) {
    if (!object.prototype) throw new Error(`Non-demonstration object: ${object.id}`)
    if (!worldIds.has(object.world)) throw new Error(`Unknown World: ${object.world}`)
    if (objectIds.has(object.id)) throw new Error(`Duplicate object id: ${object.id}`)
    if (slugs.has(object.slug)) throw new Error(`Duplicate object slug: ${object.slug}`)
    if (!object.media.every((media) => media.alt.startsWith('Demonstration image:'))) {
      throw new Error(`Non-demonstration media: ${object.id}`)
    }
    objectIds.add(object.id)
    slugs.add(object.slug)
  }
}
