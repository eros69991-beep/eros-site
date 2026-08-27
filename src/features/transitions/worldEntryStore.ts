import { create } from 'zustand'
import { type WorldEntryEvent, type WorldEntryState, worldEntryReducer } from './worldEntryMachine'

export interface WorldEntryStore {
  state: WorldEntryState
  dispatch(event: WorldEntryEvent): void
}

export const useWorldEntryStore = create<WorldEntryStore>()((set) => ({
  state: { status: 'idle' },
  dispatch: (event) => set((current) => ({ state: worldEntryReducer(current.state, event) })),
}))
