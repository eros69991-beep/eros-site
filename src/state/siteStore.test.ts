import { createMemoryStorage, type StorageAdapter } from './storage'
import { BAG_STORAGE_KEY, createSiteStore } from './siteStore'

describe('site store', () => {
  it('merges identical Object and size lines', () => {
    const store = createSiteStore(createMemoryStorage())

    store.getState().addToBag('demo-spring-001', 'M')
    store.getState().addToBag('demo-spring-001', 'M')

    expect(store.getState().bag).toEqual([
      { objectId: 'demo-spring-001', size: 'M', quantity: 2 },
    ])
  })

  it('keeps another size as a distinct Bag line', () => {
    const store = createSiteStore(createMemoryStorage())

    store.getState().addToBag('demo-spring-001', 'M')
    store.getState().addToBag('demo-spring-001', 'L')

    expect(store.getState().bag).toEqual([
      { objectId: 'demo-spring-001', size: 'M', quantity: 1 },
      { objectId: 'demo-spring-001', size: 'L', quantity: 1 },
    ])
  })

  it('removes a Bag line when its quantity becomes zero', () => {
    const store = createSiteStore(createMemoryStorage())

    store.getState().addToBag('demo-spring-001', 'M')
    store.getState().setBagQuantity('demo-spring-001', 'M', 0)

    expect(store.getState().bag).toEqual([])
  })

  it('keeps only the final celestial selection', () => {
    const store = createSiteStore(createMemoryStorage())

    store.getState().selectCelestial('spring')
    store.getState().selectCelestial('winter')

    expect(store.getState().selectedCelestial).toBe('winter')
  })

  it('persists only versioned Bag and recent World data for a new store', () => {
    const storage = createMemoryStorage()
    const store = createSiteStore(storage)

    store.getState().addToBag('demo-spring-001', 'M')
    store.getState().setRecentWorld('winter')
    store.getState().setQualityTier('lite')
    store.getState().setWorldGateOpen(true)

    expect(JSON.parse(storage.getItem(BAG_STORAGE_KEY) ?? '')).toEqual({
      version: 1,
      bag: [{ objectId: 'demo-spring-001', size: 'M', quantity: 1 }],
      recentWorld: 'winter',
    })
  })

  it('rehydrates the versioned Bag and recent World data', () => {
    const storage = createMemoryStorage()
    storage.setItem(BAG_STORAGE_KEY, JSON.stringify({
      version: 1,
      bag: [{ objectId: 'demo-spring-001', size: 'M', quantity: 3 }],
      recentWorld: 'autumn',
    }))

    const store = createSiteStore(storage)

    expect(store.getState().bag).toEqual([
      { objectId: 'demo-spring-001', size: 'M', quantity: 3 },
    ])
    expect(store.getState().recentWorld).toBe('autumn')
  })

  it('resets persisted state when its JSON is malformed', () => {
    const storage = createMemoryStorage()
    storage.setItem(BAG_STORAGE_KEY, '{bad JSON')

    const store = createSiteStore(storage)

    expect(store.getState().bag).toEqual([])
    expect(store.getState().recentWorld).toBeNull()
  })

  it('ignores an unsupported persistence version', () => {
    const storage = createMemoryStorage()
    storage.setItem(BAG_STORAGE_KEY, JSON.stringify({
      version: 0,
      bag: [{ objectId: 'demo-spring-001', size: 'M', quantity: 3 }],
      recentWorld: 'autumn',
    }))

    const store = createSiteStore(storage)

    expect(store.getState().bag).toEqual([])
    expect(store.getState().recentWorld).toBeNull()
  })

  it('falls back to memory when persistence cannot be read', () => {
    const unavailableStorage: StorageAdapter = {
      getItem: () => {
        throw new Error('Storage unavailable')
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    }

    const store = createSiteStore(unavailableStorage)

    expect(store.getState().bag).toEqual([])
    expect(store.getState().recentWorld).toBeNull()
    expect(store.getState().storageAvailable).toBe(false)

    store.getState().addToBag('demo-spring-001', 'M')

    expect(store.getState().bag).toEqual([
      { objectId: 'demo-spring-001', size: 'M', quantity: 1 },
    ])
  })

  it('keeps in-memory state when persistence fails', () => {
    const unavailableStorage: StorageAdapter = {
      getItem: () => null,
      setItem: () => {
        throw new Error('Storage unavailable')
      },
      removeItem: () => undefined,
    }
    const store = createSiteStore(unavailableStorage)

    store.getState().addToBag('demo-spring-001', 'M')

    expect(store.getState().bag).toEqual([
      { objectId: 'demo-spring-001', size: 'M', quantity: 1 },
    ])
    expect(store.getState().storageAvailable).toBe(false)
  })
})
