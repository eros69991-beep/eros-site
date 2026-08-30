import type { WorldId } from '../../domain/types'

export type WorldEntrySource = 'universe' | 'world-gate' | 'archive'

export type WorldEntryState =
  | { status: 'idle' }
  | { status: 'targeting' | 'loading' | 'ready' | 'committing'; world: WorldId; requestId: number; source: WorldEntrySource }
  | { status: 'failed'; world: WorldId; requestId: number; source: WorldEntrySource; message: string }

export type WorldEntryEvent =
  | { type: 'REQUEST'; world: WorldId; requestId: number; source: WorldEntrySource }
  | { type: 'TARGET_ALIGNED'; world: WorldId; requestId: number }
  | { type: 'ASSETS_READY'; world: WorldId; requestId: number }
  | { type: 'COMMIT'; world: WorldId; requestId: number }
  | { type: 'FAIL'; world: WorldId; requestId: number; message: string }
  | { type: 'RESET' }

export interface WorldEntryDependencies {
  alignTarget(world: WorldId, source: WorldEntrySource): Promise<void>
  preloadCriticalAssets(world: WorldId): Promise<void>
  commitRoute(world: WorldId): void
  rememberWorld(world: WorldId): void
  activateReducedVisuals?(world: WorldId): void
}

export interface WorldEntryController {
  state: WorldEntryState
  enterWorld(world: WorldId, source: WorldEntrySource): void
  continueStatic(): void
  reset(): void
}

export function worldEntryReducer(state: WorldEntryState, event: WorldEntryEvent): WorldEntryState {
  if (event.type === 'RESET') return { status: 'idle' }

  if (event.type === 'REQUEST') {
    if (state.status !== 'idle' && event.requestId <= state.requestId) return state

    return { status: 'targeting', world: event.world, requestId: event.requestId, source: event.source }
  }

  if (state.status === 'idle' || state.world !== event.world || state.requestId !== event.requestId) return state

  switch (event.type) {
    case 'TARGET_ALIGNED':
      return state.status === 'targeting' ? { ...state, status: 'loading' } : state
    case 'ASSETS_READY':
      return state.status === 'loading' ? { ...state, status: 'ready' } : state
    case 'COMMIT':
      return state.status === 'ready' || state.status === 'failed' ? { ...state, status: 'committing' } : state
    case 'FAIL':
      return { ...state, status: 'failed', message: event.message }
  }
}
