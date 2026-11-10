import type { WorldId } from '../../domain/types'
import type { DemoMediaKey } from '../../media/mediaManifest'
import { warmManifestPicture, WORLD_EDITORIAL_SIZES, WORLD_OBJECT_SIZES } from '../../media/warmPicture'
import { sceneRegistry } from '../worlds/sceneRegistry'
import type { WorldEntryDependencies, WorldEntrySource } from './worldEntryMachine'

const EDITORIAL_MEDIA_KEYS = {
  spring: 'spring-editorial',
  summer: 'summer-editorial',
  autumn: 'autumn-editorial',
  winter: 'winter-editorial',
} as const satisfies Record<WorldId, DemoMediaKey>

const WORLD_OBJECT_MEDIA_KEYS = {
  spring: ['spring-object-001', 'spring-object-002'],
  summer: ['summer-object-001', 'summer-object-002'],
  autumn: ['autumn-object-001', 'autumn-object-002'],
  winter: ['winter-object-001', 'winter-object-002'],
} as const satisfies Record<WorldId, readonly DemoMediaKey[]>

interface PreloadCriticalWorldAssetsOptions {
  loadScene?: () => Promise<unknown>
  /** 测试用：替代真正的图片预热。 */
  warmPicture?: (mediaKey: DemoMediaKey, sizes: string) => Promise<void>
  timeoutMs?: number
}

export const CRITICAL_PRELOAD_TIMEOUT_MS = 8_000

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, world: WorldId) {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error(`Critical assets for ${world} timed out.`))
    }, timeoutMs)

    promise.then(
      (value) => {
        window.clearTimeout(timeout)
        resolve(value)
      },
      (error: unknown) => {
        window.clearTimeout(timeout)
        reject(error)
      },
    )
  })
}

/**
 * 进入季节页前：加载场景代码，并按页面上完全相同的 <picture> 预热主图（必须完成）和单品图（后台进行）。
 * 这样页面出现时图片已经下载并解码好，不会先空白再出现。
 */
export async function preloadCriticalWorldAssets(
  world: WorldId,
  options: PreloadCriticalWorldAssetsOptions = {},
) {
  const descriptor = sceneRegistry[world]
  if (!descriptor && !options.loadScene) throw new Error(`Realtime scene unavailable for ${world}.`)

  const warm = options.warmPicture ?? warmManifestPicture
  const editorial = warm(EDITORIAL_MEDIA_KEYS[world], WORLD_EDITORIAL_SIZES)
  for (const mediaKey of WORLD_OBJECT_MEDIA_KEYS[world]) {
    void warm(mediaKey, WORLD_OBJECT_SIZES).catch(() => undefined)
  }

  await withTimeout(Promise.all([
    options.loadScene?.() ?? descriptor!.load(),
    editorial,
  ]), options.timeoutMs ?? CRITICAL_PRELOAD_TIMEOUT_MS, world)
}

interface CreateWorldEntryDependenciesOptions {
  alignUniverse(world: WorldId): Promise<void>
  handoffWorld?(world: WorldId): Promise<void>
  handoffHomepage?(world: WorldId): Promise<void>
  navigate(world: WorldId): void
  preload(world: WorldId): Promise<void>
  remember(world: WorldId): void
  activateReducedVisuals?(world: WorldId): void
  scrollToTop?(): void
}

export function createWorldEntryDependencies({
  alignUniverse,
  handoffWorld,
  handoffHomepage,
  navigate,
  preload,
  remember,
  activateReducedVisuals,
  scrollToTop,
}: CreateWorldEntryDependenciesOptions): WorldEntryDependencies {
  const dependencies: WorldEntryDependencies = {
    alignTarget: (world: WorldId, source: WorldEntrySource) => {
      if (source === 'universe') {
        // 镜头照常转向被点的星球，但不等它对准：过渡色块立刻开始铺开，两者同时进行
        void alignUniverse(world)
        return Promise.resolve()
      }
      return source === 'world-gate' ? handoffWorld?.(world) ?? Promise.resolve() : Promise.resolve()
    },
    preloadCriticalAssets: preload,
    playHandoff: (world, source) => source === 'universe'
      ? handoffHomepage?.(world) ?? Promise.resolve()
      : Promise.resolve(),
    commitRoute: (world) => {
      scrollToTop?.()
      navigate(world)
    },
    rememberWorld: remember,
  }

  if (activateReducedVisuals) dependencies.activateReducedVisuals = activateReducedVisuals
  return dependencies
}
