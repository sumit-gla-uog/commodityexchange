import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HelpPreview } from '../../../pages/LandingPage/HelpPreview'

describe('HelpPreview', () => {
  it('renders the heading and description', () => {
    render(<HelpPreview onLoginClick={vi.fn()} />)
    expect(screen.getByText('Help & FAQs')).toBeInTheDocument()
    expect(screen.getByText('Everything you need to know before getting started')).toBeInTheDocument()
  })

  it('renders all FAQ questions and answers', () => {
    render(<HelpPreview onLoginClick={vi.fn()} />)

    expect(screen.getByText('What is CommodEx?')).toBeInTheDocument()
    expect(
      screen.getByText('A B2B commodity intelligence and barter platform for UK industrial SMEs.')
    ).toBeInTheDocument()

    expect(screen.getByText('How does the Barter Matching Engine work?')).toBeInTheDocument()
    expect(
      screen.getByText('List a surplus commodity, get matched with a compatible listing, and settle at a fair, market-calculated value via escrow.')
    ).toBeInTheDocument()

    expect(screen.getByText('Where does pricing data come from?')).toBeInTheDocument()
    expect(
      screen.getByText('World Bank Pink Sheet data combined with live market feeds.')
    ).toBeInTheDocument()
  })

  it('renders the CTA card and calls onLoginClick when clicked', () => {
    const onLoginClick = vi.fn()
    render(<HelpPreview onLoginClick={onLoginClick} />)

    expect(screen.getByText('Still have questions?')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Login / Register'))
    expect(onLoginClick).toHaveBeenCalledOnce()
  })
})