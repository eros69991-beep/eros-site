import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StudioPage } from './StudioPage'

describe('StudioPage', () => {
  it('provides only the approved archival workroom regions', () => {
    render(<StudioPage />, { wrapper: MemoryRouter })

    expect(screen.getByRole('heading', { name: 'THE STUDIO' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'WHAT EROS IS' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'MATERIAL AND MAKING' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'FUTURE PROCESS MEDIA' })).toBeInTheDocument()
    expect(screen.getByText('Demonstration process media will enter this workroom later.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ARCHIVE / ALL OBJECTS' })).toHaveAttribute('href', '/archive')
    expect(screen.getByRole('region', { name: 'CONTACT INFORMATION' })).toHaveTextContent('Contact information will be shared here.')
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(screen.queryByText(/founder|born|established/i)).not.toBeInTheDocument()
  })
})
