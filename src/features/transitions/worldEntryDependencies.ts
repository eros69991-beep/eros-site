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
}

function readMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(max-width: 767px)').matches
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

  await Promise.all([
    options.loadScene?.() ?? descriptor!.load(),
    image.decode(),
  ])
}

interface CreateWorldEntryDependenciesOptions {
  alignUniverse(world: WorldId): Promise<void>
  navigate(world: WorldId): void
  preload(world: WorldId): Promise<void>
  remember(world: WorldId): void
}

export function createWorldEntryDependencies({
  alignUniverse,
  navigate,
  preload,
  remember,
}: CreateWorldEntryDependenciesOptions): WorldEntryDependencies {
  return {
    alignTarget: (world: WorldId, source: WorldEntrySource) => (
      source === 'universe' ? alignUniverse(world) : Promise.resolve()
    ),
    preloadCriticalAssets: preload,
    commitRoute: navigate,
    rememberWorld: remember,
  }
}
