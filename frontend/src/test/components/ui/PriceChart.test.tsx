import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { PriceChart } from '../../../components/ui/PriceChart'
import type { CommodityPrice } from '../../../types/commodity'

vi.mock('highcharts', () => ({
  default: {},
}))

vi.mock('highcharts-react-official', () => ({
  default: {
    default: ({ options }: { options: any }) => (
      <div data-testid="highcharts-mock" data-title={options.title.text} data-series={JSON.stringify(options.series[0].data)} />
    ),
  },
}))

const mockCommodity: CommodityPrice = {
  name: 'Copper',
  category: 'Metals',
  latest_price: 13552,
  latest_date: '2026-03',
  unit: 'USD per metric ton',
  monthly_change: 0.07,
  trend: 'up',
  chart_data: [
    { date: '2026-01', price: 13000 },
    { date: '2026-02', price: 13400 },
    { date: '2026-03', price: 13552 },
  ],
}

describe('PriceChart', () => {
  it('renders the chart with the correct title', () => {
    const { getByTestId } = render(<PriceChart commodity={mockCommodity} />)
    const chart = getByTestId('highcharts-mock')

    expect(chart.getAttribute('data-title')).toBe('Copper - 12 Month Price Trend')
  })

  it('passes the correct price series data to the chart', () => {
    const { getByTestId } = render(<PriceChart commodity={mockCommodity} />)
    const chart = getByTestId('highcharts-mock')

    const seriesData = JSON.parse(chart.getAttribute('data-series') || '[]')
    expect(seriesData).toEqual([13000, 13400, 13552])
  })

  it('renders an empty series when chart_data is empty', () => {
    const emptyCommodity = { ...mockCommodity, chart_data: [] }
    const { getByTestId } = render(<PriceChart commodity={emptyCommodity} />)
    const chart = getByTestId('highcharts-mock')

    const seriesData = JSON.parse(chart.getAttribute('data-series') || '[]')
    expect(seriesData).toEqual([])
  })
})