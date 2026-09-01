import type { WorldId } from '../../domain/types'
import { mediaManifest, type DemoMediaKey } from '../../media/mediaManifest'
import { sceneRegistry } from '../worlds/sceneRegistry'
import type { WorldEntryDependencies, WorldEntrySource } from './worldEntryMachine'

const EDITORIAL_MEDIA_KEYS = {
  spring: 'spring-editorial',
  summer: 'summer-editorial',
  autumn: 'autumn-editorial',
  winter: 'winter-editorial',
} as const satisfies Record<WorldId, DemoMediaKey>

interface PreloadCriticalWorldAssetsOptions {
  createImage?: () => HTMLImageElement
  loadScene?: () => Promise<unknown>
  mobile?: boolean
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

function readMobileViewport() {
  if (typeof window === 'undefined') return false

  const coarsePointer = typeof window.matchMedia === 'function'
    && window.matchMedia('(pointer: coarse)').matches
  const shortLandscape = Math.min(window.innerWidth, window.innerHeight) <= 480
    && window.innerHeight <= 500

  return (window.innerWidth <= 900 && coarsePointer) || shortLandscape
}

export async function preloadCriticalWorldAssets(
  world: WorldId,
  options: PreloadCriticalWorldAssetsOptions = {},
) {
  const descriptor = sceneRegistry[world]
  if (!descriptor && !options.loadScene) throw new Error(`Realtime scene unavailable for ${world}.`)

  const media = mediaManifest[EDITORIAL_MEDIA_KEYS[world]]
  const targetWidth = (options.mobile ?? readMobileViewport()) ? 960 : 1600
  const source = media.sources.webp.find((candidate) => candidate.width === targetWidth)
  if (!source) throw new Error(`Critical editorial source unavailable for ${world}.`)

  const image = options.createImage?.() ?? new Image()
  image.src = source.src

  await withTimeout(Promise.all([
    options.loadScene?.() ?? descriptor!.load(),
    image.decode(),
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
    alignTarget: (world: WorldId, source: WorldEntrySource) => (
      source === 'universe' ? alignUniverse(world)
        : source === 'world-gate' ? handoffWorld?.(world) ?? Promise.resolve()
          : Promise.resolve()
    ),
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
