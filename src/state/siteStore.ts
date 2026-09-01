import { create } from 'zustand'
import { createStore, type StateCreator } from 'zustand/vanilla'
import type { CelestialId, QualityTier, WorldId } from '../domain/types'
import { createBrowserStorage, createMemoryStorage, type StorageAdapter } from './storage'

export const BAG_STORAGE_KEY = 'eros-studio:site-state'

const PERSISTENCE_VERSION = 1

export interface BagLine {
  objectId: string
  size: string
  quantity: number
}

export interface SiteState {
  selectedCelestial: CelestialId | null
  recentWorld: WorldId | null
  qualityTier: QualityTier
  worldGateOpen: boolean
  reducedVisualWorld: WorldId | null
  worldHandoff: WorldId | null
  bag: BagLine[]
  storageAvailable: boolean
  selectCelestial(id: CelestialId | null): void
  setRecentWorld(id: WorldId): void
  setQualityTier(tier: QualityTier): void
  setWorldGateOpen(open: boolean): void
  setReducedVisualWorld(world: WorldId | null): void
  setWorldHandoff(world: WorldId | null): void
  addToBag(objectId: string, size: string): void
  setBagQuantity(objectId: string, size: string, quantity: number): void
  removeFromBag(objectId: string, size: string): void
}

interface PersistedSiteState {
  version: typeof PERSISTENCE_VERSION
  bag: BagLine[]
  recentWorld: WorldId | null
}

function isWorldId(value: unknown): value is WorldId {
  return value === 'spring' || value === 'summer' || value === 'autumn' || value === 'winter'
}

function isBagLine(value: unknown): value is BagLine {
  if (typeof value !== 'object' || value === null) return false

  const line = value as Record<string, unknown>
  return typeof line.objectId === 'string'
    && typeof line.size === 'string'
    && typeof line.quantity === 'number'
    && Number.isFinite(line.quantity)
    && line.quantity > 0
}

function parsePersistedState(value: string | null): PersistedSiteState | null {
  if (value === null) return null

  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed === null) return null

    const state = parsed as Record<string, unknown>
    if (state.version !== PERSISTENCE_VERSION || !Array.isArray(state.bag)) return null
    if (state.recentWorld !== null && !isWorldId(state.recentWorld)) return null
    if (!state.bag.every(isBagLine)) return null

    return {
      version: PERSISTENCE_VERSION,
      bag: state.bag,
      recentWorld: state.recentWorld,
    }
  } catch {
    return null
  }
}

function createSiteState(storage: StorageAdapter): StateCreator<SiteState> {
  const memoryStorage = createMemoryStorage()
  let activeStorage = storage
  let storageAvailable = true

  const switchToMemoryFallback = () => {
    activeStorage = memoryStorage
    storageAvailable = false
  }

  let persisted: PersistedSiteState | null = null
  try {
    persisted = parsePersistedState(activeStorage.getItem(BAG_STORAGE_KEY))
  } catch {
    switchToMemoryFallback()
  }

  return (set, get) => {
    const persist = () => {
      const { bag, recentWorld } = get()
      const next: PersistedSiteState = {
        version: PERSISTENCE_VERSION,
        bag,
        recentWorld,
      }

      try {
        activeStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(next))
      } catch {
        switchToMemoryFallback()
        memoryStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(next))
        set({ storageAvailable: false })
      }
    }

    const updateAndPersist = (update: Partial<Pick<SiteState, 'bag' | 'recentWorld'>>) => {
      set(update)
      persist()
    }

    return {
      selectedCelestial: persisted?.recentWorld ?? null,
      recentWorld: persisted?.recentWorld ?? null,
      qualityTier: 'balanced',
      worldGateOpen: false,
      reducedVisualWorld: null,
      worldHandoff: null,
      bag: persisted?.bag ?? [],
      storageAvailable,
      selectCelestial: (id) => set({ selectedCelestial: id }),
      setRecentWorld: (id) => updateAndPersist({ recentWorld: id }),
      setQualityTier: (tier) => set({ qualityTier: tier }),
      setWorldGateOpen: (open) => set({ worldGateOpen: open }),
      setReducedVisualWorld: (world) => set({ reducedVisualWorld: world }),
      setWorldHandoff: (world) => set({ worldHandoff: world }),
      addToBag: (objectId, size) => {
        const matchingLine = get().bag.find((line) => line.objectId === objectId && line.size === size)
        const bag = matchingLine
          ? get().bag.map((line) => (line === matchingLine ? { ...line, quantity: line.quantity + 1 } : line))
          : [...get().bag, { objectId, size, quantity: 1 }]

        updateAndPersist({ bag })
      },
      setBagQuantity: (objectId, size, quantity) => {
        const bag = quantity <= 0
          ? get().bag.filter((line) => line.objectId !== objectId || line.size !== size)
          : get().bag.map((line) => (
            line.objectId === objectId && line.size === size ? { ...line, quantity } : line
          ))

        updateAndPersist({ bag })
      },
      removeFromBag: (objectId, size) => {
        const bag = get().bag.filter((line) => line.objectId !== objectId || line.size !== size)
        updateAndPersist({ bag })
      },
    }
  }
}

export function createSiteStore(storage: StorageAdapter) {
  return createStore(createSiteState(storage))
}

export const useSiteStore = create<SiteState>()(createSiteState(createBrowserStorage()))
