import type { WorldId } from '../../domain/types'

type UniverseAlignmentHandler = (world: WorldId) => Promise<void>

let alignmentHandler: UniverseAlignmentHandler | null = null

export function registerUniverseCameraAlignment(handler: UniverseAlignmentHandler) {
  alignmentHandler = handler
  return () => {
    if (alignmentHandler === handler) alignmentHandler = null
  }
}

export function alignUniverseCameraToWorld(world: WorldId) {
  return alignmentHandler?.(world) ?? Promise.resolve()
}
