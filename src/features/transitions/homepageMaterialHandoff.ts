import type { WorldId } from '../../domain/types'

export const HOMEPAGE_HANDOFF_MS = 900

export interface HomepageMaterialHandoff {
  world: WorldId
  source: 'universe'
}

interface Options {
  reducedMotion?: boolean
  setHomepageMaterialHandoff(handoff: HomepageMaterialHandoff | null): void
  wait?(milliseconds: number): Promise<void>
}

function waitForHandoff(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))
}

function readReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export async function handoffHomepageMaterial(world: WorldId, {
  reducedMotion = readReducedMotion(), setHomepageMaterialHandoff, wait = waitForHandoff,
}: Options) {
  setHomepageMaterialHandoff({ world, source: 'universe' })
  await wait(reducedMotion ? 0 : HOMEPAGE_HANDOFF_MS)
  setHomepageMaterialHandoff(null)
}
