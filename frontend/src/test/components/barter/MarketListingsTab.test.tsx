import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MarketListingsTab } from '../../../components/barter/MarketListingsTab'
import type { BarterListing } from '../../../types/commodity'

const makeListing = (overrides: Partial<BarterListing>): BarterListing => ({
  id: 'L1',
  sme_name: 'Sumit Exchange Ltd',
  commodity_offered: 'Copper',
  quantity_offered_mt: 50,
  commodity_wanted: 'Aluminum',
  quantity_wanted_mt: 197,
  location_uk: 'London',
  status: 'active',
  created_at: '2026-08-30T21:34:05Z',
  user_id: 'user-123',
  ...overrides,
})

describe('MarketListingsTab', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ id: 'user-123' }))
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('shows "No listings yet." when the list is empty', () => {
    render(<MarketListingsTab listings={[]} onMatch={vi.fn()} />)
    expect(screen.getByText('No listings yet.')).toBeInTheDocument()
  })

  it('renders listing details for each listing', () => {
    const listings = [makeListing({})]
    render(<MarketListingsTab listings={listings} onMatch={vi.fn()} />)

    expect(screen.getByText('Sumit Exchange Ltd')).toBeInTheDocument()
    expect(screen.getByText('London')).toBeInTheDocument()
    expect(screen.getByText('Copper')).toBeInTheDocument()
    expect(screen.getByText('50t')).toBeInTheDocument()
    expect(screen.getByText('Aluminum')).toBeInTheDocument()
  })

  it('shows the total listing count', () => {
    const listings = [makeListing({ id: 'L1' }), makeListing({ id: 'L2' })]
    render(<MarketListingsTab listings={listings} onMatch={vi.fn()} />)
    expect(screen.getByText('2 listings')).toBeInTheDocument()
  })

  it('enables the Match button and calls onMatch for the current user\'s own listing', () => {
    const onMatch = vi.fn()
    const listings = [makeListing({ id: 'L1', user_id: 'user-123' })]
    render(<MarketListingsTab listings={listings} onMatch={onMatch} />)

    const matchButton = screen.getByText('⇄ Match')
    expect(matchButton).not.toBeDisabled()

    fireEvent.click(matchButton)
    expect(onMatch).toHaveBeenCalledWith('L1')
  })

  it('disables the Match button for listings that do not belong to the current user', () => {
    const onMatch = vi.fn()
    const listings = [makeListing({ id: 'L1', user_id: 'someone-else' })]
    render(<MarketListingsTab listings={listings} onMatch={onMatch} />)

    const matchButton = screen.getByText('⇄ Match')
    expect(matchButton).toBeDisabled()

    fireEvent.click(matchButton)
    expect(onMatch).not.toHaveBeenCalled()
  })

  it('paginates listings, showing only PAGE_SIZE per page', () => {
    const listings = Array.from({ length: 8 }, (_, i) =>
      makeListing({ id: `L${i}`, sme_name: `Company ${i}` })
    )
    render(<MarketListingsTab listings={listings} onMatch={vi.fn()} />)

    expect(screen.getAllByText('⇄ Match')).toHaveLength(5) // PAGE_SIZE
  })
})