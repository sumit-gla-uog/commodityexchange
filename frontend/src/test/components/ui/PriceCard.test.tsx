import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PriceCard } from '../../../components/ui/PriceCard'
import type { CommodityPrice } from '../../../types/commodity'

const mockCommodity: CommodityPrice = {
  name: 'Copper',
  category: 'Metals',
  latest_price: 13552,
  latest_date: '2026-03',
  unit: 'USD per metric ton',
  monthly_change: 0.07,
  trend: 'up',
  chart_data: [],
}

describe('PriceCard', () => {
  it('renders the commodity name, price, category, and unit', () => {
    render(<PriceCard commodity={mockCommodity} onClick={vi.fn()} isSelected={false} />)

    expect(screen.getByText('Copper')).toBeInTheDocument()
    expect(screen.getByText('Metals')).toBeInTheDocument()
    expect(screen.getByText('$13,552')).toBeInTheDocument()
    expect(screen.getByText('USD per metric ton')).toBeInTheDocument()
  })

  it('shows the absolute monthly change percentage', () => {
    render(<PriceCard commodity={mockCommodity} onClick={vi.fn()} isSelected={false} />)
    expect(screen.getByText('0.07%')).toBeInTheDocument()
  })

  it('shows an absolute value even for a negative monthly change', () => {
    const downCommodity = { ...mockCommodity, trend: 'down' as const, monthly_change: -6.48 }
    render(<PriceCard commodity={downCommodity} onClick={vi.fn()} isSelected={false} />)
    expect(screen.getByText('6.48%')).toBeInTheDocument()
  })

  it('calls onClick when the card is clicked', () => {
    const handleClick = vi.fn()
    render(<PriceCard commodity={mockCommodity} onClick={handleClick} isSelected={false} />)

    fireEvent.click(screen.getByText('Copper'))

    expect(handleClick).toHaveBeenCalledOnce()
  })

 it('applies the selected style when isSelected is true', () => {
  const { container } = render(
    <PriceCard commodity={mockCommodity} onClick={vi.fn()} isSelected={true} />
  )
  expect((container.firstChild as HTMLElement).className).toMatch(/selected/)
})

it('does not apply the selected style when isSelected is false', () => {
  const { container } = render(
    <PriceCard commodity={mockCommodity} onClick={vi.fn()} isSelected={false} />
  )
  expect((container.firstChild as HTMLElement).className).not.toMatch(/selected/)
})
})