import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from '../../../components/layout/Sidebar'

const renderSidebar = (initialRoute = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Sidebar />
    </MemoryRouter>
  )

describe('Sidebar', () => {
  it('renders the CommodEx branding and all nav items when expanded', () => {
    renderSidebar()

    expect(screen.getByText('CommodEx')).toBeInTheDocument()
    expect(screen.getByText('Commodity Exchange')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Barter')).toBeInTheDocument()
    expect(screen.getByText('Evaluations')).toBeInTheDocument()
    expect(screen.getByText('Orders')).toBeInTheDocument()
    expect(screen.getByText('Expert Advice')).toBeInTheDocument()
  })

  it('renders the dissertation footer when expanded', () => {
    renderSidebar()
    expect(screen.getByText('MSc Dissertation 2025-26')).toBeInTheDocument()
    expect(screen.getByText('University of Glasgow')).toBeInTheDocument()
  })

  it('hides branding, labels, and footer when collapsed', () => {
    renderSidebar()

    fireEvent.click(screen.getByRole('button'))

    expect(screen.queryByText('CommodEx')).not.toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByText('MSc Dissertation 2025-26')).not.toBeInTheDocument()
  })

  it('expands again when the toggle button is clicked twice', () => {
    renderSidebar()

    const toggleButton = screen.getByRole('button')
    fireEvent.click(toggleButton)
    fireEvent.click(toggleButton)

    expect(screen.getByText('CommodEx')).toBeInTheDocument()
  })

  it('marks the active route link based on the current location', () => {
    renderSidebar('/barter')

    const barterLink = screen.getByText('Barter').closest('a')
    expect(barterLink).toHaveClass('active')
  })
})