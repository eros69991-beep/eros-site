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
  // 不在这里撤掉材质层：路由还没切到季节页，撤掉会让原页面（例如白色 Archive）
  // 闪回一下。由 AppShell 在季节页渲染出来、或进入失败/取消后再撤掉。
}
