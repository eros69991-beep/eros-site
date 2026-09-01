import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import type { WorldId } from '../../domain/types'
import {
  type WorldEntryController,
  type WorldEntryDependencies,
  type WorldEntrySource,
} from './worldEntryMachine'
import { useWorldEntryStore } from './worldEntryStore'

const WorldEntryDependenciesContext = createContext<WorldEntryDependencies | null>(null)
let latestRequestId = 0

interface WorldEntryProviderProps {
  children: ReactNode
  dependencies: WorldEntryDependencies
}

export function WorldEntryProvider({ children, dependencies }: WorldEntryProviderProps) {
  return createElement(WorldEntryDependenciesContext.Provider, { value: dependencies }, children)
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'World entry could not be completed.'
}

export function useWorldEntry(): WorldEntryController {
  const dependencies = useContext(WorldEntryDependenciesContext)
  const state = useWorldEntryStore((store) => store.state)
  const dispatch = useWorldEntryStore((store) => store.dispatch)
  const disposed = useRef(false)

  useEffect(() => {
    disposed.current = false
    return () => {
      disposed.current = true
    }
  }, [])

  if (dependencies === null) {
    throw new Error('useWorldEntry must be used within a WorldEntryProvider.')
  }

  const isCurrent = useCallback((world: WorldId, requestId: number) => {
    const current = useWorldEntryStore.getState().state
    return !disposed.current && current.status !== 'idle' && current.world === world && current.requestId === requestId
  }, [])

  const commit = useCallback((world: WorldId, requestId: number) => {
    if (!isCurrent(world, requestId)) return

    dispatch({ type: 'COMMIT', world, requestId })
    if (!isCurrent(world, requestId)) return

    dependencies.commitRoute(world)
    dependencies.rememberWorld(world)
  }, [dependencies, dispatch, isCurrent])

  const enterWorld = useCallback((world: WorldId, source: WorldEntrySource) => {
    const current = useWorldEntryStore.getState().state
    latestRequestId = Math.max(latestRequestId, current.status === 'idle' ? 0 : current.requestId) + 1
    const requestId = latestRequestId
    dispatch({ type: 'REQUEST', world, requestId, source })

    let alignment: Promise<void>
    let assets: Promise<void>
    try {
      alignment = dependencies.alignTarget(world, source)
      assets = dependencies.preloadCriticalAssets(world)
    } catch (error) {
      if (isCurrent(world, requestId)) {
        dispatch({ type: 'FAIL', world, requestId, message: errorMessage(error) })
      }
      return
    }

    alignment.then(() => {
      if (isCurrent(world, requestId)) {
        dispatch({ type: 'TARGET_ALIGNED', world, requestId })
      }
    })

    Promise.all([alignment, assets]).then(async () => {
      if (!isCurrent(world, requestId)) return

      dispatch({ type: 'TARGET_ALIGNED', world, requestId })
      dispatch({ type: 'ASSETS_READY', world, requestId })
      dispatch({ type: 'HANDOFF_STARTED', world, requestId })
      await (dependencies.playHandoff?.(world, source) ?? Promise.resolve())
      if (!isCurrent(world, requestId)) return
      commit(world, requestId)
    }).catch((error: unknown) => {
      if (isCurrent(world, requestId)) {
        dispatch({ type: 'FAIL', world, requestId, message: errorMessage(error) })
      }
    })
  }, [commit, dependencies, dispatch, isCurrent])

  const continueStatic = useCallback(() => {
    const current = useWorldEntryStore.getState().state
    if (current.status !== 'failed') return

    dependencies.activateReducedVisuals?.(current.world)
    commit(current.world, current.requestId)
  }, [commit, dependencies])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [dispatch])

  return useMemo(() => ({ state, enterWorld, continueStatic, reset }), [continueStatic, enterWorld, reset, state])
}

export { useWorldEntryStore } from './worldEntryStore'
