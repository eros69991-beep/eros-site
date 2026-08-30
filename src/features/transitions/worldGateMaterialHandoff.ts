import type { WorldId } from '../../domain/types'

export const WORLD_GATE_HANDOFF_MS = 200

interface WorldGateMaterialHandoffOptions {
  reducedMotion?: boolean
  setWorldHandoff(world: WorldId | null): void
  wait?(milliseconds: number): Promise<void>
}

function readReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function waitForHandoff(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))
}

export async function handoffWorldGateMaterial(
  world: WorldId,
  { reducedMotion = readReducedMotion(), setWorldHandoff, wait = waitForHandoff }: WorldGateMaterialHandoffOptions,
) {
  setWorldHandoff(world)
  await wait(reducedMotion ? 0 : WORLD_GATE_HANDOFF_MS)
  setWorldHandoff(null)
}
