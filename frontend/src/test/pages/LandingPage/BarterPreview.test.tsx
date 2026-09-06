import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BarterPreview } from '../../../pages/LandingPage/BarterPreview'

describe('BarterPreview', () => {
  it('renders the heading and description', () => {
    render(<BarterPreview onLoginClick={vi.fn()} />)
    expect(screen.getByText('Barter Matching Engine')).toBeInTheDocument()
    expect(
      screen.getByText(/List your surplus commodities, get matched with UK SMEs/)
    ).toBeInTheDocument()
  })

  it('renders all sample listings', () => {
    render(<BarterPreview onLoginClick={vi.fn()} />)

    expect(screen.getByText('Midlands Steel Works Ltd')).toBeInTheDocument()
    expect(screen.getByText('Northern Grain Co.')).toBeInTheDocument()
    expect(screen.getByText('Thames Energy Partners')).toBeInTheDocument()
  })

  it('renders the offering/wanting detail line for each listing', () => {
    render(<BarterPreview onLoginClick={vi.fn()} />)
    expect(screen.getByText('Offering 200t Steel (HRC) → Wants Copper')).toBeInTheDocument()
    expect(screen.getByText('Offering 500t Wheat → Wants Natural Gas')).toBeInTheDocument()
    expect(screen.getByText('Offering 1,000 bbl Brent Crude → Wants Aluminium')).toBeInTheDocument()
  })

  it('renders a Match badge for each listing', () => {
    render(<BarterPreview onLoginClick={vi.fn()} />)
    expect(screen.getAllByText('⇄ Match')).toHaveLength(3)
  })

  it('renders the CTA card', () => {
    render(<BarterPreview onLoginClick={vi.fn()} />)
    expect(screen.getByText('Start trading surplus stock')).toBeInTheDocument()
    expect(screen.getByText('Login / Register')).toBeInTheDocument()
  })

  it('calls onLoginClick when the Login/Register button is clicked', () => {
    const onLoginClick = vi.fn()
    render(<BarterPreview onLoginClick={onLoginClick} />)

    fireEvent.click(screen.getByText('Login / Register'))
    expect(onLoginClick).toHaveBeenCalledOnce()
  })
})