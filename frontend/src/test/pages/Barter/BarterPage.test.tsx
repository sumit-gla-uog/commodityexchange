import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BarterPage } from '../../../pages/Barter/BarterPage'
import * as useListingModule from '../../../hooks/useListing'
import * as useOrderHistoryModule from '../../../hooks/useOrderHistory'
import type { BarterListing } from '../../../types/commodity'

vi.mock('../../../components/barter/MarketListingsTab', () => ({
  MarketListingsTab: ({ listings, onMatch }: any) => (
    <div data-testid="market-tab">
      {listings.length} listings
      <button onClick={() => onMatch('L1')}>Trigger Match</button>
    </div>
  ),
}))

vi.mock('../../../components/barter/MyListingsTab', () => ({
  MyListingsTab: ({ listings }: any) => <div data-testid="my-listings-tab">{listings.length} mine</div>,
}))

vi.mock('../../../components/barter/CreateListingDialog', () => ({
  CreateListingDialog: ({ open }: any) => (open ? <div data-testid="create-dialog">dialog open</div> : null),
}))

vi.mock('../../../components/barter/MatchResultPanel', () => ({
  MatchResultPanel: ({ listingId }: any) => <div data-testid="match-panel">matching {listingId}</div>,
}))

vi.mock('../../../components/orders/OrdersHistoryTab', () => ({
  OrdersHistoryTab: ({ orders }: any) => <div data-testid="orders-tab">{orders.length} orders</div>,
}))

const makeListing = (overrides: Partial<BarterListing> = {}): BarterListing => ({
  id: 'L1',
  sme_name: 'Sumit Exchange Ltd',
  commodity_offered: 'Copper',
  quantity_offered_mt: 50,
  commodity_wanted: 'Aluminum',
  quantity_wanted_mt: 197,
  location_uk: 'London',
  status: 'active' as const,
  created_at: '2026-08-30T21:34:05Z',
  user_id: null,
  ...overrides,
})

describe('BarterPage', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ sme_name: 'Sumit Exchange Ltd' }))

    vi.spyOn(useListingModule, 'useListings').mockReturnValue({
      listings: [makeListing({ id: 'L1' }), makeListing({ id: 'L2', sme_name: 'Other Ltd' })],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    vi.spyOn(useOrderHistoryModule, 'useOrderHistory').mockReturnValue({
      orders: [],
      isLoading: false,
      isError: false,
      fetchOrders: vi.fn(),
      refetch: vi.fn(),
    })
  })

  it('shows Market Listings tab by default', () => {
    render(<BarterPage />)
    expect(screen.getByTestId('market-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('my-listings-tab')).not.toBeInTheDocument()
  })

  it('shows the loading state instead of tab content when listings are loading', () => {
    vi.spyOn(useListingModule, 'useListings').mockReturnValue({
      listings: [],
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })

    render(<BarterPage />)
    expect(screen.getByText('Loading listings...')).toBeInTheDocument()
    expect(screen.queryByTestId('market-tab')).not.toBeInTheDocument()
  })

  it('shows an error state when listings fail to load', () => {
    vi.spyOn(useListingModule, 'useListings').mockReturnValue({
      listings: [],
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })

    render(<BarterPage />)
    expect(screen.getByText('Failed to load listings.')).toBeInTheDocument()
  })

  it('switches to My Listings tab and filters by current user sme_name', () => {
    render(<BarterPage />)
    fireEvent.click(screen.getByText('My Listings'))

    expect(screen.getByTestId('my-listings-tab')).toBeInTheDocument()
    expect(screen.getByText('1 mine')).toBeInTheDocument() // only L1 belongs to Sumit Exchange Ltd
  })

  it('shows the "+ New Listing" button only on the Market Listings tab', () => {
    render(<BarterPage />)
    expect(screen.getByText('+ New Listing')).toBeInTheDocument()

    fireEvent.click(screen.getByText('My Listings'))
    expect(screen.queryByText('+ New Listing')).not.toBeInTheDocument()
  })

  it('opens the CreateListingDialog when "+ New Listing" is clicked', () => {
    render(<BarterPage />)
    fireEvent.click(screen.getByText('+ New Listing'))
    expect(screen.getByTestId('create-dialog')).toBeInTheDocument()
  })

  it('calls fetchOrders and switches tab when Orders & History is clicked', () => {
    const mockFetchOrders = vi.fn()
    vi.spyOn(useOrderHistoryModule, 'useOrderHistory').mockReturnValue({
      orders: [],
      isLoading: false,
      isError: false,
      fetchOrders: mockFetchOrders,
      refetch: vi.fn(),
    })

    render(<BarterPage />)
    fireEvent.click(screen.getByText('Orders & History'))

    expect(mockFetchOrders).toHaveBeenCalledOnce()
    expect(screen.getByTestId('orders-tab')).toBeInTheDocument()
  })

  it('filters market listings by search term', () => {
    render(<BarterPage />)

    fireEvent.change(screen.getByPlaceholderText('Search listings...'), {
      target: { value: 'Other Ltd' },
    })

    expect(screen.getByText('1 listings')).toBeInTheDocument() // only L2 matches "Other Ltd"
  })

  it('shows the MatchResultPanel when a match is triggered from MarketListingsTab', () => {
    render(<BarterPage />)
    fireEvent.click(screen.getByText('Trigger Match'))
    expect(screen.getByTestId('match-panel')).toBeInTheDocument()
    expect(screen.getByText('matching L1')).toBeInTheDocument()
  })
})