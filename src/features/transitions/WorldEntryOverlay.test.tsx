import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import type { WorldEntryDependencies } from './worldEntryMachine'
import { WorldEntryOverlay } from './WorldEntryOverlay'
import { WorldEntryProvider } from './useWorldEntry'
import { useWorldEntryStore } from './worldEntryStore'

afterEach(() => {
  act(() => {
    useWorldEntryStore.getState().dispatch({ type: 'RESET' })
  })
})

describe('WorldEntryOverlay', () => {
  it('keeps the selected World and recovery choices available after assets fail', async () => {
    const committed: string[] = []
    const remembered: string[] = []
    let returnedToUniverse = false
    const dependencies: WorldEntryDependencies = {
      alignTarget: async () => undefined,
      preloadCriticalAssets: async () => undefined,
      commitRoute: (world) => committed.push(world),
      rememberWorld: (world) => remembered.push(world),
    }
    const user = userEvent.setup()

    act(() => {
      useWorldEntryStore.setState({
        state: {
          status: 'failed',
          world: 'winter',
          requestId: 4,
          source: 'world-gate',
          message: 'Critical textures are unavailable.',
        },
      })
    })

    render(
      <WorldEntryProvider dependencies={dependencies}>
        <WorldEntryOverlay onReturnToUniverse={() => { returnedToUniverse = true }} />
      </WorldEntryProvider>,
    )

    expect(screen.getByRole('dialog', { name: /entering winter/i })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('status')).toHaveTextContent('Critical textures are unavailable.')
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /continue with reduced visuals/i }))
    expect(committed).toEqual(['winter'])
    expect(remembered).toEqual(['winter'])

    act(() => {
      useWorldEntryStore.setState({
        state: {
          status: 'failed',
          world: 'winter',
          requestId: 5,
          source: 'world-gate',
          message: 'Critical textures are unavailable.',
        },
      })
    })
    await user.click(screen.getByRole('button', { name: /return to universe/i }))

    expect(returnedToUniverse).toBe(true)
    expect(useWorldEntryStore.getState().state).toEqual({ status: 'idle' })
  })
})
