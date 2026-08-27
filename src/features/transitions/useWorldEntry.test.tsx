import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import type { WorldEntryDependencies } from './worldEntryMachine'
import { WorldEntryProvider, useWorldEntry, useWorldEntryStore } from './useWorldEntry'

interface Deferred {
  promise: Promise<void>
  resolve(): void
  reject(reason: Error): void
}

function createDeferred(): Deferred {
  let resolvePromise!: () => void
  let rejectPromise!: (reason: Error) => void
  const promise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  return { promise, resolve: resolvePromise, reject: rejectPromise }
}

function TransitionControls() {
  const { enterWorld, reset, state } = useWorldEntry()

  return (
    <>
      <output aria-label="Entry status">{state.status}</output>
      <button type="button" onClick={() => enterWorld('spring', 'universe')}>Spring</button>
      <button type="button" onClick={() => enterWorld('winter', 'universe')}>Winter</button>
      <button type="button" onClick={reset}>Reset</button>
    </>
  )
}

afterEach(() => {
  act(() => {
    useWorldEntryStore.getState().dispatch({ type: 'RESET' })
  })
})

describe('useWorldEntry', () => {
  it('commits only the final rapid selection after its real dependencies resolve', async () => {
    const springAlignment = createDeferred()
    const springAssets = createDeferred()
    const winterAlignment = createDeferred()
    const winterAssets = createDeferred()
    const routes: string[] = []
    const remembered: string[] = []
    const dependencies: WorldEntryDependencies = {
      alignTarget: (world) => world === 'spring' ? springAlignment.promise : winterAlignment.promise,
      preloadCriticalAssets: (world) => world === 'spring' ? springAssets.promise : winterAssets.promise,
      commitRoute: (world) => routes.push(world),
      rememberWorld: (world) => remembered.push(world),
    }
    const user = userEvent.setup()

    render(<WorldEntryProvider dependencies={dependencies}><TransitionControls /></WorldEntryProvider>)

    await user.click(screen.getByRole('button', { name: 'Spring' }))
    await user.click(screen.getByRole('button', { name: 'Winter' }))

    await act(async () => {
      springAlignment.resolve()
      springAssets.resolve()
      await Promise.resolve()
    })

    expect(routes).toEqual([])
    expect(remembered).toEqual([])
    expect(screen.getByRole('status', { name: 'Entry status' })).toHaveTextContent('targeting')

    await act(async () => {
      winterAlignment.resolve()
      await Promise.resolve()
    })
    expect(routes).toEqual([])
    expect(screen.getByRole('status', { name: 'Entry status' })).toHaveTextContent('loading')

    await act(async () => {
      winterAssets.resolve()
      await Promise.resolve()
    })

    expect(routes).toEqual(['winter'])
    expect(remembered).toEqual(['winter'])
    expect(screen.getByRole('status', { name: 'Entry status' })).toHaveTextContent('committing')
  })

  it('does not reuse a request ID after reset, so an earlier attempt cannot commit a new entry', async () => {
    const firstAlignment = createDeferred()
    const firstAssets = createDeferred()
    const secondAlignment = createDeferred()
    const secondAssets = createDeferred()
    const alignments = [firstAlignment, secondAlignment]
    const assets = [firstAssets, secondAssets]
    const routes: string[] = []
    const dependencies: WorldEntryDependencies = {
      alignTarget: () => alignments.shift()!.promise,
      preloadCriticalAssets: () => assets.shift()!.promise,
      commitRoute: (world) => routes.push(world),
      rememberWorld: () => undefined,
    }
    const user = userEvent.setup()

    render(<WorldEntryProvider dependencies={dependencies}><TransitionControls /></WorldEntryProvider>)

    await user.click(screen.getByRole('button', { name: 'Spring' }))
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    await user.click(screen.getByRole('button', { name: 'Spring' }))

    await act(async () => {
      firstAlignment.resolve()
      firstAssets.resolve()
      await Promise.resolve()
    })

    expect(routes).toEqual([])
    expect(screen.getByRole('status', { name: 'Entry status' })).toHaveTextContent('targeting')

    await act(async () => {
      secondAlignment.resolve()
      secondAssets.resolve()
      await Promise.resolve()
    })

    expect(routes).toEqual(['spring'])
  })
})
