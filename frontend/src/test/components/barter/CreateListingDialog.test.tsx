import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateListingDialog } from '../../../components/barter/CreateListingDialog'
import * as useCreateListingModule from '../../../hooks/useCreateListing'

describe('CreateListingDialog', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ sme_name: 'Sumit Exchange Ltd' }))
    vi.spyOn(useCreateListingModule, 'useCreateListing').mockReturnValue({
      createListing: vi.fn().mockResolvedValue(true),
      submitting: false,
      error: false,
    })
  })

  it('renders nothing when open is false', () => {
    const { container } = render(
      <CreateListingDialog open={false} onClose={vi.fn()} onSuccess={vi.fn()} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the form when open is true', () => {
    render(<CreateListingDialog open={true} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByText('List Surplus Commodity')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. Aluminium')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<CreateListingDialog open={true} onClose={onClose} onSuccess={vi.fn()} />)
    fireEvent.click(screen.getByText('×'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when the Cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<CreateListingDialog open={true} onClose={onClose} onSuccess={vi.fn()} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not close when clicking inside the dialog box', () => {
    const onClose = vi.fn()
    render(<CreateListingDialog open={true} onClose={onClose} onSuccess={vi.fn()} />)
    fireEvent.click(screen.getByText('List Surplus Commodity'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes when clicking the overlay background', () => {
    const onClose = vi.fn()
    const { container } = render(
      <CreateListingDialog open={true} onClose={onClose} onSuccess={vi.fn()} />
    )
    fireEvent.click(container.firstChild as HTMLElement)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not submit when required fields are empty', async () => {
    const mockCreateListing = vi.fn()
    vi.spyOn(useCreateListingModule, 'useCreateListing').mockReturnValue({
      createListing: mockCreateListing,
      submitting: false,
      error: false,
    })

    render(<CreateListingDialog open={true} onClose={vi.fn()} onSuccess={vi.fn()} />)
    fireEvent.click(screen.getByText('Post Listing'))

    expect(mockCreateListing).not.toHaveBeenCalled()
  })

  it('submits the form with correctly typed values when all fields are filled', async () => {
    const mockCreateListing = vi.fn().mockResolvedValue(true)
    vi.spyOn(useCreateListingModule, 'useCreateListing').mockReturnValue({
      createListing: mockCreateListing,
      submitting: false,
      error: false,
    })

    const onSuccess = vi.fn()
    const onClose = vi.fn()
    render(<CreateListingDialog open={true} onClose={onClose} onSuccess={onSuccess} />)

    fireEvent.change(screen.getByPlaceholderText('e.g. Aluminium'), { target: { value: 'Copper' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. 150'), { target: { value: '50' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. Sheffield'), { target: { value: 'London' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. Copper'), { target: { value: 'Aluminum' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. 25'), { target: { value: '197' } })

    fireEvent.click(screen.getByText('Post Listing'))

    await waitFor(() =>
      expect(mockCreateListing).toHaveBeenCalledWith({
        sme_name: 'Sumit Exchange Ltd',
        commodity_offered: 'Copper',
        quantity_offered_mt: 50,
        commodity_wanted: 'Aluminum',
        quantity_wanted_mt: 197,
        location_uk: 'London',
      })
    )
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())
  })

  it('does not call onSuccess/onClose if createListing fails', async () => {
    const mockCreateListing = vi.fn().mockResolvedValue(false)
    vi.spyOn(useCreateListingModule, 'useCreateListing').mockReturnValue({
      createListing: mockCreateListing,
      submitting: false,
      error: false,
    })

    const onSuccess = vi.fn()
    const onClose = vi.fn()
    render(<CreateListingDialog open={true} onClose={onClose} onSuccess={onSuccess} />)

    fireEvent.change(screen.getByPlaceholderText('e.g. Aluminium'), { target: { value: 'Copper' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. 150'), { target: { value: '50' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. Sheffield'), { target: { value: 'London' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. Copper'), { target: { value: 'Aluminum' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. 25'), { target: { value: '197' } })

    fireEvent.click(screen.getByText('Post Listing'))

    await waitFor(() => expect(mockCreateListing).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('shows "Posting..." and disables the button while submitting', () => {
    vi.spyOn(useCreateListingModule, 'useCreateListing').mockReturnValue({
      createListing: vi.fn(),
      submitting: true,
      error: false,
    })

    render(<CreateListingDialog open={true} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByText('Posting...')).toBeInTheDocument()
    expect(screen.getByText('Posting...')).toBeDisabled()
  })
})