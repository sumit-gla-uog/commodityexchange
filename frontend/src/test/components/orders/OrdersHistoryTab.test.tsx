import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OrdersHistoryTab } from '../../../components/orders/OrdersHistoryTab'
import type { Order } from '../../../types/commodity'

vi.mock('../../../components/orders/OrderCard', () => ({
  OrderCard: ({ order }: { order: Order }) => <div data-testid="order-card">{order.id}</div>,
}))

const makeOrder = (overrides: Partial<Order>): Order => ({
  id: 'order-1',
  created_at: '2026-08-30T21:34:05Z',
  updated_at: '2026-08-30T21:34:05Z',
  party_a_name: 'OM Exchange Ltd',
  party_a_commodity: 'Copper',
  party_a_quantity: 50,
  party_b_name: 'Scottish Metals Ltd',
  party_b_commodity: 'Aluminum',
  party_b_quantity: 48,
  status: 'pending',
  fair_value_delta: 512528,
  fair_value: 677600,
  platform_fee: 1537.58,
  vat_treatment: 'Zero-rated',
  escrow_status: 'pending',
  note: null,
  ...overrides,
})

describe('OrdersHistoryTab', () => {
  const orders: Order[] = [
    makeOrder({ id: 'order-1', status: 'pending' }),
    makeOrder({ id: 'order-2', status: 'settled' }),
    makeOrder({ id: 'order-3', status: 'cancelled' }),
    makeOrder({ id: 'order-4', status: 'pending' }),
  ]

  it('shows the correct count for each status filter', () => {
    render(<OrdersHistoryTab orders={orders} search="" />)

    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument() // All count
    expect(screen.getAllByText('2').length).toBeGreaterThan(0) // Pending count
  })

  it('renders all orders by default', () => {
    render(<OrdersHistoryTab orders={orders} search="" />)
    expect(screen.getAllByTestId('order-card')).toHaveLength(4)
  })

  it('filters orders by status when a filter pill is clicked', () => {
    render(<OrdersHistoryTab orders={orders} search="" />)

    fireEvent.click(screen.getByText('Completed'))

    const cards = screen.getAllByTestId('order-card')
    expect(cards).toHaveLength(1)
    expect(cards[0]).toHaveTextContent('order-2')
  })

  it('filters orders by search term across party names and commodities', () => {
    render(<OrdersHistoryTab orders={orders} search="Scottish" />)
    expect(screen.getAllByTestId('order-card')).toHaveLength(4) // all match "Scottish" (party_b_name)
  })

  it('shows "No orders found" when filters exclude everything', () => {
    render(<OrdersHistoryTab orders={orders} search="nonexistent-term-xyz" />)
    expect(screen.getByText('No orders found.')).toBeInTheDocument()
    expect(screen.queryByTestId('order-card')).not.toBeInTheDocument()
  })

//  it('resets to page 1 when the status filter changes', () => {
//   const manyOrders = Array.from({ length: 12 }, (_, i) =>
//     makeOrder({ id: `order-${i}`, status: 'pending' })
//   )
//   render(<OrdersHistoryTab orders={manyOrders} search="" />)

//   fireEvent.click(screen.getByText('Next ›'))
//   expect(
//     screen.getByText((_, element) =>
//       element?.textContent?.replace(/\s+/g, ' ').trim() === 'Page 2 of 3 · 12 total'
//     )
//   ).toBeInTheDocument()

//   fireEvent.click(screen.getByRole('button', { name: /All/ }))
//   expect(
//     screen.getByText((_, element) =>
//       element?.textContent?.replace(/\s+/g, ' ').trim() === 'Page 1 of 3 · 12 total'
//     )
//   ).toBeInTheDocument()
// })

  it('paginates orders, showing only PAGE_SIZE per page', () => {
    const manyOrders = Array.from({ length: 12 }, (_, i) =>
      makeOrder({ id: `order-${i}`, status: 'pending' })
    )
    render(<OrdersHistoryTab orders={manyOrders} search="" />)

    expect(screen.getAllByTestId('order-card')).toHaveLength(5) // PAGE_SIZE
  })
})