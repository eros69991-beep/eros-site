import { describe, expect, it } from 'vitest'
import { worldEntryReducer } from './worldEntryMachine'

describe('worldEntryReducer', () => {
  it('keeps the final rapid request when an earlier request becomes ready', () => {
    const first = worldEntryReducer(
      { status: 'idle' },
      { type: 'REQUEST', world: 'spring', requestId: 1, source: 'universe' },
    )
    const second = worldEntryReducer(
      first,
      { type: 'REQUEST', world: 'winter', requestId: 2, source: 'universe' },
    )
    const staleReady = worldEntryReducer(
      second,
      { type: 'ASSETS_READY', world: 'spring', requestId: 1 },
    )

    expect(second).toEqual({ status: 'targeting', world: 'winter', requestId: 2, source: 'universe' })
    expect(staleReady).toEqual(second)
  })

  it('holds a ready universe entry while its material handoff runs', () => {
    expect(worldEntryReducer(
      { status: 'ready', world: 'spring', requestId: 1, source: 'universe' },
      { type: 'HANDOFF_STARTED', world: 'spring', requestId: 1 },
    )).toMatchObject({ status: 'transitioning' })
  })
})
