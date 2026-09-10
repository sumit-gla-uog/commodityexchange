import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MyListingsTab } from '../../../components/barter/MyListingsTab'
import * as useDeleteListingModule from '../../../hooks/useDeleteListing'
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
  user_id: null,
  ...overrides,
})

describe('MyListingsTab', () => {
  beforeEach(() => {
    vi.spyOn(useDeleteListingModule, 'useDeleteListing').mockReturnValue({
      deleteListing: vi.fn().mockResolvedValue(true),
      submitting: false,
      error: false,
    })
    vi.stubGlobal('confirm', vi.fn())
  })

  it('shows an empty state message when there are no listings', () => {
    render(<MyListingsTab listings={[]} />)
    expect(screen.getByText("You haven't posted any listings yet.")).toBeInTheDocument()
  })

  it('renders listing details for each listing', () => {
    const listings = [makeListing({})]
    render(<MyListingsTab listings={listings} />)

    expect(screen.getByText('Copper')).toBeInTheDocument()
    expect(screen.getByText('50t')).toBeInTheDocument()
    expect(screen.getByText('Aluminum')).toBeInTheDocument()
    expect(screen.getByText('Active', { exact: false })).toBeInTheDocument()
  })

  it('shows the Delete button for active listings', () => {
    const listings = [makeListing({ status: 'active' })]
    render(<MyListingsTab listings={listings} />)
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('hides the Delete button for matched listings', () => {
    const listings = [makeListing({ status: 'matched' })]
    render(<MyListingsTab listings={listings} />)
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })

  it('hides the Delete button for expired listings', () => {
    const listings = [makeListing({ status: 'expired' })]
    render(<MyListingsTab listings={listings} />)
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })

  it('does not call deleteListing if the confirm dialog is dismissed', async () => {
    ;(window.confirm as any).mockReturnValue(false)
    const mockDeleteListing = vi.fn()
    vi.spyOn(useDeleteListingModule, 'useDeleteListing').mockReturnValue({
      deleteListing: mockDeleteListing,
      submitting: false,
      error: false,
    })

    const listings = [makeListing({ id: 'L1', status: 'active' })]
    render(<MyListingsTab listings={listings} />)

    fireEvent.click(screen.getByText('Delete'))

    expect(mockDeleteListing).not.toHaveBeenCalled()
  })

  it('calls deleteListing and onDeleted when confirmed', async () => {
    ;(window.confirm as any).mockReturnValue(true)
    const mockDeleteListing = vi.fn().mockResolvedValue(true)
    vi.spyOn(useDeleteListingModule, 'useDeleteListing').mockReturnValue({
      deleteListing: mockDeleteListing,
      submitting: false,
      error: false,
    })

    const onDeleted = vi.fn()
    const listings = [makeListing({ id: 'L1', status: 'active' })]
    render(<MyListingsTab listings={listings} onDeleted={onDeleted} />)

    fireEvent.click(screen.getByText('Delete'))

    await waitFor(() => expect(mockDeleteListing).toHaveBeenCalledWith('L1'))
    await waitFor(() => expect(onDeleted).toHaveBeenCalledOnce())
  })

  it('does not call onDeleted if deleteListing fails', async () => {
    ;(window.confirm as any).mockReturnValue(true)
    const mockDeleteListing = vi.fn().mockResolvedValue(false)
    vi.spyOn(useDeleteListingModule, 'useDeleteListing').mockReturnValue({
      deleteListing: mockDeleteListing,
      submitting: false,
      error: false,
    })

    const onDeleted = vi.fn()
    const listings = [makeListing({ id: 'L1', status: 'active' })]
    render(<MyListingsTab listings={listings} onDeleted={onDeleted} />)

    fireEvent.click(screen.getByText('Delete'))

    await waitFor(() => expect(mockDeleteListing).toHaveBeenCalled())
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('paginates listings, showing only PAGE_SIZE per page', () => {
    const listings = Array.from({ length: 8 }, (_, i) =>
      makeListing({ id: `L${i}`, status: 'active' })
    )
    render(<MyListingsTab listings={listings} />)

    expect(screen.getAllByText('Delete')).toHaveLength(5) // PAGE_SIZE
  })
})