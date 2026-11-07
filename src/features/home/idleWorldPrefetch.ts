import type { WorldId } from '../../domain/types'
import { preloadCriticalWorldAssets } from '../transitions/worldEntryDependencies'
import { sceneRegistry } from '../worlds/sceneRegistry'

/** 首页加载后等多久再开始预取（让首页星球先烘焙完，不和它抢资源）。 */
export const IDLE_PREFETCH_DELAY_MS = 3_000

interface IdlePrefetchOptions {
  preload?: (world: WorldId) => Promise<unknown>
  worlds?: WorldId[]
  delayMs?: number
  /** 测试用：替代 requestIdleCallback / setTimeout。 */
  schedule?: (callback: () => void, delayMs: number) => () => void
}

type ConnectionLike = { saveData?: boolean; effectiveType?: string }

function shouldSkipPrefetch() {
  const connection = (navigator as Navigator & { connection?: ConnectionLike }).connection
  return Boolean(connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g')
}

function scheduleIdle(callback: () => void, delayMs: number) {
  let idleHandle = 0
  const timeout = window.setTimeout(() => {
    if ('requestIdleCallback' in window) idleHandle = window.requestIdleCallback(callback, { timeout: 2_000 })
    else callback()
  }, delayMs)
  return () => {
    window.clearTimeout(timeout)
    if (idleHandle && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleHandle)
  }
}

/**
 * 首页空闲时依次把每个季节页的场景代码和首屏主图下载、解码好。
 * 点击星球时这些已经在缓存里，"加载资源"这一步几乎不用等。
 * 省流量模式或 2G 网络下不预取。返回取消函数。
 */
export function startIdleWorldPrefetch({
  preload = (world) => preloadCriticalWorldAssets(world),
  worlds = Object.keys(sceneRegistry) as WorldId[],
  delayMs = IDLE_PREFETCH_DELAY_MS,
  schedule = scheduleIdle,
}: IdlePrefetchOptions = {}) {
  if (typeof window === 'undefined' || shouldSkipPrefetch()) return () => undefined

  let cancelled = false
  let cancelScheduled = () => {}
  const queue = [...worlds]

  const next = (wait: number) => {
    cancelScheduled = schedule(() => {
      const world = queue.shift()
      if (cancelled || !world) return
      // 单个季节失败不影响其他季节；真正点击时还会再加载一次
      void preload(world).catch(() => undefined).finally(() => {
        if (!cancelled) next(0)
      })
    }, wait)
  }

  next(delayMs)
  return () => {
    cancelled = true
    cancelScheduled()
  }
}
