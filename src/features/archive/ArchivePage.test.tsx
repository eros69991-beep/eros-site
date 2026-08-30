import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation, MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { WorldEntryDependencies } from '../transitions/worldEntryMachine'
import { WorldEntryProvider } from '../transitions/useWorldEntry'
import { ArchivePage } from './ArchivePage'

function LocationEcho() {
  const location = useLocation()
  return <output aria-label="Current location">{`${location.pathname}${location.search}`}</output>
}

function renderArchive(initialEntry = '/archive') {
  const alignTarget = vi.fn().mockResolvedValue(undefined)
  const dependencies: WorldEntryDependencies = {
    alignTarget,
    preloadCriticalAssets: vi.fn().mockResolvedValue(undefined),
    commitRoute: vi.fn(),
    rememberWorld: vi.fn(),
  }

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <WorldEntryProvider dependencies={dependencies}>
        <Routes>
          <Route path="/archive" element={<><ArchivePage /><LocationEcho /></>} />
        </Routes>
      </WorldEntryProvider>
    </MemoryRouter>,
  )

  return { alignTarget }
}

describe('ArchivePage', () => {
  it('restores URL filters, announces the result count, and enters a selected World through the archive source', async () => {
    const { alignTarget } = renderArchive('/archive?world=spring&type=accessory&material=resin')
    const user = userEvent.setup()

    expect(screen.getByRole('checkbox', { name: 'Spring' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Accessory' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Resin' })).toBeChecked()
    expect(screen.getByRole('status', { name: 'Archive result count' })).toHaveTextContent('1 result')
    expect(screen.getByRole('article')).toHaveTextContent('Dew Spine')

    await user.click(screen.getByRole('button', { name: 'Enter Spring / Awakening' }))

    expect(alignTarget).toHaveBeenCalledWith('spring', 'archive')
  })

  it('updates filters in the URL and can reset them to show the whole archive', async () => {
    renderArchive()
    const user = userEvent.setup()

    await user.click(screen.getByRole('checkbox', { name: 'Winter' }))
    await user.click(screen.getByRole('checkbox', { name: 'Accessory' }))

    expect(screen.getByRole('status', { name: 'Archive result count' })).toHaveTextContent('1 result')
    expect(screen.getByRole('status', { name: 'Current location' })).toHaveTextContent('?world=winter&type=accessory')

    await user.click(screen.getByRole('button', { name: 'Reset filters' }))

    expect(screen.getByRole('status', { name: 'Archive result count' })).toHaveTextContent('8 results')
    expect(screen.getByRole('status', { name: 'Current location' })).toHaveTextContent('/archive')
  })

  it('renders a true empty-result region when filters have no intersection', () => {
    renderArchive('/archive?world=winter&type=outerwear')

    expect(screen.getByRole('region', { name: 'No archive results' })).toHaveTextContent('No Objects match these filters.')
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })
})
