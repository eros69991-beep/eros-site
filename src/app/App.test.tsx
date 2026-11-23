import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
  it('renders the KAIROHOU application landmark', () => {
    render(<App />)
    expect(screen.getByRole('main', { name: /kairohou studio/i })).toBeInTheDocument()
  })
})
