import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OrderCard } from '../../../components/orders/OrderCard'
import * as useUpdateOrderNoteModule from '../../../hooks/useUpdateOrderNote'
import type { Order } from '../../../types/commodity'

const baseOrder: Order = {
  id: 'order-123456789',
  created_at: '2026-08-30T21:34:05.288457+00:00',
  updated_at: '2026-08-30T21:34:05.288457+00:00',
  party_a_name: 'Sumit Exchange Ltd',
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
}

describe('OrderCard', () => {
  beforeEach(() => {
    vi.spyOn(useUpdateOrderNoteModule, 'useUpdateOrderNote').mockReturnValue({
      updateNote: vi.fn().mockResolvedValue(true),
      submitting: false,
      error: false,
    })
  })

  it('renders core order details', () => {
    render(<OrderCard order={baseOrder} />)

    expect(screen.getByText('order-12')).toBeInTheDocument() // id.slice(0, 8) + first char of the dash section
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Scottish Metals Ltd')).toBeInTheDocument()
    expect(screen.getByText('Copper 50t')).toBeInTheDocument()
    expect(screen.getByText('Aluminum 48t')).toBeInTheDocument()
    expect(screen.getByText('£677,600')).toBeInTheDocument()
    expect(screen.getByText('£1,537.58')).toBeInTheDocument()
  })

  it('shows the settlement line indicating who pays whom for a positive delta', () => {
    render(<OrderCard order={baseOrder} />)
    expect(
      screen.getByText('Scottish Metals Ltd pays Sumit Exchange Ltd £512,528')
    ).toBeInTheDocument()
  })

  it('shows the settlement line for a negative delta', () => {
    const negativeOrder = { ...baseOrder, fair_value_delta: -512528 }
    render(<OrderCard order={negativeOrder} />)
    expect(
      screen.getByText('Sumit Exchange Ltd pays Scottish Metals Ltd £512,528')
    ).toBeInTheDocument()
  })

  it('shows a balanced message when delta is zero', () => {
    const balancedOrder = { ...baseOrder, fair_value_delta: 0 }
    render(<OrderCard order={balancedOrder} />)
    expect(screen.getByText('Balanced, no additional payment')).toBeInTheDocument()
  })

  it('shows the "Add note" button when there is no note', () => {
    render(<OrderCard order={baseOrder} />)
    expect(screen.getByText('Add note')).toBeInTheDocument()
  })

  it('shows the existing note when one is present', () => {
    const orderWithNote = { ...baseOrder, note: 'delivered on time' }
    render(<OrderCard order={orderWithNote} />)
    expect(screen.getByText('delivered on time')).toBeInTheDocument()
    expect(screen.queryByText('Add note')).not.toBeInTheDocument()
  })

  it('enters edit mode when "Add note" is clicked', () => {
    render(<OrderCard order={baseOrder} />)
    fireEvent.click(screen.getByText('Add note'))
    expect(screen.getByPlaceholderText('Add a note...')).toBeInTheDocument()
  })

  it('enters edit mode when clicking an existing note', () => {
    const orderWithNote = { ...baseOrder, note: 'delivered on time' }
    render(<OrderCard order={orderWithNote} />)
    fireEvent.click(screen.getByText('delivered on time'))
    expect(screen.getByDisplayValue('delivered on time')).toBeInTheDocument()
  })

  it('calls updateNote and onNoteUpdated when Save is clicked', async () => {
    const mockUpdateNote = vi.fn().mockResolvedValue(true)
    vi.spyOn(useUpdateOrderNoteModule, 'useUpdateOrderNote').mockReturnValue({
      updateNote: mockUpdateNote,
      submitting: false,
      error: false,
    })

    const onNoteUpdated = vi.fn()
    render(<OrderCard order={baseOrder} onNoteUpdated={onNoteUpdated} />)

    fireEvent.click(screen.getByText('Add note'))
    fireEvent.change(screen.getByPlaceholderText('Add a note...'), {
      target: { value: 'new note text' },
    })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => expect(mockUpdateNote).toHaveBeenCalledWith('order-123456789', 'new note text'))
    await waitFor(() => expect(onNoteUpdated).toHaveBeenCalledOnce())
  })

  it('reverts the draft and exits edit mode when Cancel is clicked', () => {
    const orderWithNote = { ...baseOrder, note: 'original note' }
    render(<OrderCard order={orderWithNote} />)

    fireEvent.click(screen.getByText('original note'))
    fireEvent.change(screen.getByDisplayValue('original note'), {
      target: { value: 'edited but not saved' },
    })
    fireEvent.click(screen.getByText('Cancel'))

    expect(screen.getByText('original note')).toBeInTheDocument()
    expect(screen.queryByText('edited but not saved')).not.toBeInTheDocument()
  })

  it('disables inputs and shows "Saving..." while submitting', () => {
    vi.spyOn(useUpdateOrderNoteModule, 'useUpdateOrderNote').mockReturnValue({
      updateNote: vi.fn(),
      submitting: true,
      error: false,
    })

    render(<OrderCard order={baseOrder} />)
    fireEvent.click(screen.getByText('Add note'))

    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Add a note...')).toBeDisabled()
  })
})