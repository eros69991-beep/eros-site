import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestRouter } from '../../app/AppRouter'
import { useSiteStore } from '../../state/siteStore'

afterEach(() => {
  act(() => {
    useSiteStore.setState({ bag: [], worldGateOpen: false })
  })
  document.body.style.overflow = ''
})

describe('WorldGate', () => {
  it('opens, closes with Escape, and restores focus to Menu', async () => {
    const user = userEvent.setup()
    render(<TestRouter initialEntries={['/']} />)
    const menu = screen.getByRole('button', { name: /menu/i })

    await user.click(menu)

    expect(screen.getByRole('dialog', { name: /world gate/i })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog', { name: /world gate/i })).not.toBeInTheDocument()
    expect(menu).toHaveFocus()
  })

  it('lists every approved destination with its canonical route', async () => {
    const user = userEvent.setup()
    render(<TestRouter initialEntries={['/']} />)

    await user.click(screen.getByRole('button', { name: /menu/i }))

    const destinations = [
      ['SPRING', '/world/spring'],
      ['SUMMER', '/world/summer'],
      ['AUTUMN', '/world/autumn'],
      ['WINTER', '/world/winter'],
      ['ARCHIVE', '/archive'],
      ['STUDIO', '/studio'],
      ['SEARCH', '/search'],
      ['BAG', '/bag'],
    ] as const

    const gate = screen.getByRole('dialog', { name: /world gate/i })
    for (const [label, path] of destinations) {
      expect(within(gate).getByRole('link', { name: label })).toHaveAttribute('href', path)
    }
  })

  it('shows the summed bag quantity in the header', () => {
    useSiteStore.setState({
      bag: [
        { objectId: 'demo-spring-001', size: 'S', quantity: 2 },
        { objectId: 'demo-summer-001', size: 'M', quantity: 1 },
      ],
    })

    render(<TestRouter initialEntries={['/']} />)

    expect(screen.getByRole('link', { name: 'BAG 3' })).toBeInTheDocument()
  })

  it('keeps Search available in the World Gate on a mobile viewport', async () => {
    const user = userEvent.setup()
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 375 })
    render(<TestRouter initialEntries={['/']} />)

    await user.click(screen.getByRole('button', { name: /menu/i }))

    expect(screen.getByRole('dialog', { name: /world gate/i })).toHaveTextContent('SEARCH')
  })

  it('traps focus and restores the prior body scroll setting after closing', async () => {
    const user = userEvent.setup()
    document.body.style.overflow = 'scroll'
    render(<TestRouter initialEntries={['/']} />)

    await user.click(screen.getByRole('button', { name: /menu/i }))

    const gate = screen.getByRole('dialog', { name: /world gate/i })
    const close = within(gate).getByRole('button', { name: 'CLOSE' })
    expect(document.body.style.overflow).toBe('hidden')
    expect(screen.queryByRole('button', { name: /start of world gate/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /end of world gate/i })).not.toBeInTheDocument()
    expect(document.querySelectorAll('[aria-hidden="true"][tabindex]')).toHaveLength(0)
    expect(gate.querySelectorAll('[tabindex]')).toHaveLength(0)

    await user.tab({ shift: true })
    expect(within(gate).getByRole('link', { name: 'BAG' })).toHaveFocus()

    await user.tab()
    expect(close).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(document.body.style.overflow).toBe('scroll')
  })

  it('renders a direct Search visit with one main landmark', () => {
    render(<TestRouter initialEntries={['/search']} />)

    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'SEARCH' })).toBeInTheDocument()
  })

  it('keeps the originating route behind Search navigation', async () => {
    const user = userEvent.setup()
    render(<TestRouter initialEntries={['/world/spring']} />)

    await user.click(screen.getByRole('link', { name: 'SEARCH' }))

    expect(screen.getByRole('heading', { name: 'SPRING' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'SEARCH' })).toBeInTheDocument()
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('keeps the original route behind Search followed by Bag', async () => {
    const user = userEvent.setup()
    render(<TestRouter initialEntries={['/world/spring']} />)

    await user.click(screen.getByRole('link', { name: 'SEARCH' }))
    await user.click(screen.getByRole('link', { name: 'BAG 0' }))

    expect(screen.getByRole('heading', { name: 'SPRING' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'BAG' })).toBeInTheDocument()
  })

  it('keeps the original route behind Bag followed by Search', async () => {
    const user = userEvent.setup()
    render(<TestRouter initialEntries={['/world/spring']} />)

    await user.click(screen.getByRole('link', { name: 'BAG 0' }))
    await user.click(screen.getByRole('link', { name: 'SEARCH' }))

    expect(screen.getByRole('heading', { name: 'SPRING' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'SEARCH' })).toBeInTheDocument()
  })
})
