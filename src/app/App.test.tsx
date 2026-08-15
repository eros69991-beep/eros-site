import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
  it('renders the EROS application landmark', () => {
    render(<App />)
    expect(screen.getByRole('main', { name: /eros studio/i })).toBeInTheDocument()
  })
})
