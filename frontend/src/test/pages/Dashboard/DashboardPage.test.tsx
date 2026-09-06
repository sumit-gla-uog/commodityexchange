import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardPage } from '../../../pages/Dashboard/DashboardPage'
import * as priceServiceModule from '../../../api/priceService'
import type { CommodityPrice } from '../../../types/commodity'

vi.mock('../../../components/ui/PriceCard', () => ({
  PriceCard: ({ commodity, onClick }: any) => (
    <div data-testid="price-card" onClick={onClick}>{commodity.name}</div>
  ),
}))

vi.mock('../../../components/ui/PriceChart', () => ({
  PriceChart: ({ commodity }: any) => <div data-testid="price-chart">{commodity.name} chart</div>,
}))

const makeCommodity = (overrides: Partial<CommodityPrice> = {}): CommodityPrice => ({
  name: 'Copper',
  category: 'Metals',
  latest_price: 13552,
  latest_date: '2026-03',
  unit: 'USD per metric ton',
  monthly_change: 0.07,
  trend: 'up',
  chart_data: [],
  ...overrides,
})

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.spyOn(priceServiceModule, 'usePrices').mockReturnValue({
      commodities: [
        makeCommodity({ name: 'Copper', category: 'Metals' }),
        makeCommodity({ name: 'Crude oil, Brent', category: 'Energy' }),
        makeCommodity({ name: 'Wheat, US HRW', category: 'Agriculture' }),
      ],
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    })
  })

  it('shows a loading message while prices are loading', () => {
    vi.spyOn(priceServiceModule, 'usePrices').mockReturnValue({
      commodities: [],
      isLoading: true,
      isError: false,
      mutate: vi.fn(),
    })

    render(<DashboardPage />)
    expect(screen.getByText('Loading prices...')).toBeInTheDocument()
  })

  it('shows an error message when prices fail to load', () => {
    vi.spyOn(priceServiceModule, 'usePrices').mockReturnValue({
      commodities: [],
      isLoading: false,
      isError: true,
      mutate: vi.fn(),
    })

    render(<DashboardPage />)
    expect(screen.getByText('Error loading prices.')).toBeInTheDocument()
  })

  it('renders all commodities by default', () => {
    render(<DashboardPage />)
    expect(screen.getAllByTestId('price-card')).toHaveLength(3)
  })

  it('filters commodities by category', () => {
    render(<DashboardPage />)
    fireEvent.click(screen.getByText('Metals'))

    const cards = screen.getAllByTestId('price-card')
    expect(cards).toHaveLength(1)
    expect(cards[0]).toHaveTextContent('Copper')
  })

  it('filters commodities by search term', () => {
    render(<DashboardPage />)
    fireEvent.change(screen.getByPlaceholderText('Search commodities...'), {
      target: { value: 'wheat' },
    })

    const cards = screen.getAllByTestId('price-card')
    expect(cards).toHaveLength(1)
    expect(cards[0]).toHaveTextContent('Wheat, US HRW')
  })

  it('calls mutate when the refresh button is clicked', () => {
    const mockMutate = vi.fn()
    vi.spyOn(priceServiceModule, 'usePrices').mockReturnValue({
      commodities: [makeCommodity({})],
      isLoading: false,
      isError: false,
      mutate: mockMutate,
    })

    render(<DashboardPage />)
    fireEvent.click(screen.getByTitle('Refresh prices'))

    expect(mockMutate).toHaveBeenCalledOnce()
  })

  it('shows the side panel with chart when a commodity card is clicked', () => {
    render(<DashboardPage />)
    fireEvent.click(screen.getAllByTestId('price-card')[0])

    expect(screen.getByTestId('price-chart')).toBeInTheDocument()
  })

  it('closes the side panel when the close button is clicked', () => {
    render(<DashboardPage />)
    fireEvent.click(screen.getAllByTestId('price-card')[0])
    expect(screen.getByTestId('price-chart')).toBeInTheDocument()

    fireEvent.click(screen.getByText('×'))
    expect(screen.queryByTestId('price-chart')).not.toBeInTheDocument()
  })

  it('resets to page 1 when the category filter changes', () => {
    const manyCommodities = Array.from({ length: 15 }, (_, i) =>
      makeCommodity({ name: `Commodity ${i}`, category: 'Metals' })
    )
    vi.spyOn(priceServiceModule, 'usePrices').mockReturnValue({
      commodities: manyCommodities,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    })

    render(<DashboardPage />)
    expect(screen.getAllByTestId('price-card')).toHaveLength(10) // PAGE_SIZE
  })
})