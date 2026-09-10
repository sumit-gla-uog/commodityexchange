import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MarketPreview } from '../../../pages/LandingPage/MarketPreview'
import * as priceServiceModule from '../../../api/priceService'
import type { CommodityPrice } from '../../../types/commodity'

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

describe('MarketPreview', () => {
  beforeEach(() => {
    vi.spyOn(priceServiceModule, 'usePrices').mockReturnValue({
      commodities: [makeCommodity({})],
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    })
  })

  it('renders the heading and description', () => {
    render(<MarketPreview onLoginClick={vi.fn()} />)
    expect(screen.getByText('Live Commodity Market Data')).toBeInTheDocument()
  })

  it('shows a loading message while prices are loading', () => {
    vi.spyOn(priceServiceModule, 'usePrices').mockReturnValue({
      commodities: [],
      isLoading: true,
      isError: false,
      mutate: vi.fn(),
    })

    render(<MarketPreview onLoginClick={vi.fn()} />)
    expect(screen.getByText('Loading market data...')).toBeInTheDocument()
  })

  it('renders commodity cards with price and trend', () => {
    render(<MarketPreview onLoginClick={vi.fn()} />)

    expect(screen.getByText('Copper')).toBeInTheDocument()
    expect(screen.getByText('Metals')).toBeInTheDocument()
    expect(screen.getByText('$13,552')).toBeInTheDocument()
    expect(screen.getByText('+0.07%')).toBeInTheDocument()
  })

  it('shows a negative trend without a plus sign', () => {
    vi.spyOn(priceServiceModule, 'usePrices').mockReturnValue({
      commodities: [makeCommodity({ trend: 'down', monthly_change: -6.48 })],
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    })

    render(<MarketPreview onLoginClick={vi.fn()} />)
    expect(screen.getByText('-6.48%')).toBeInTheDocument()
  })

  it('limits the displayed commodities to 8', () => {
    const manyCommodities = Array.from({ length: 12 }, (_, i) =>
      makeCommodity({ name: `Commodity ${i}` })
    )
    vi.spyOn(priceServiceModule, 'usePrices').mockReturnValue({
      commodities: manyCommodities,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    })

    render(<MarketPreview onLoginClick={vi.fn()} />)

    expect(screen.getByText('Commodity 0')).toBeInTheDocument()
    expect(screen.getByText('Commodity 7')).toBeInTheDocument()
    expect(screen.queryByText('Commodity 8')).not.toBeInTheDocument()
  })

  it('renders the CTA card and calls onLoginClick when clicked', () => {
    const onLoginClick = vi.fn()
    render(<MarketPreview onLoginClick={onLoginClick} />)

    expect(screen.getByText('Get the full picture')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Login / Register'))
    expect(onLoginClick).toHaveBeenCalledOnce()
  })
})