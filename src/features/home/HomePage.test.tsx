import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { WorldEntryProvider } from '../transitions/useWorldEntry'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('keeps a concise EROS homepage landmark without the legacy manifesto', () => {
    render(
      <MemoryRouter>
        <WorldEntryProvider dependencies={{
          alignTarget: async () => undefined,
          commitRoute: () => undefined,
          preloadCriticalAssets: async () => undefined,
          rememberWorld: () => undefined,
        }}>
          <HomePage />
        </WorldEntryProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'EROS' })).toBeInTheDocument()
    expect(screen.queryByText(/Five changing conditions orbit/i)).not.toBeInTheDocument()
  })
})
