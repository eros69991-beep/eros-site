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
  // 不在这里撤掉过渡层：季节页挂载后的头两帧要编译新场景的着色器（各卡约 100ms），
  // 由 AppShell 等这两帧过去再淡出，卡顿发生在静止的过渡层下面，看不出来。
}
