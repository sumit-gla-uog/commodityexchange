import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Pagination } from '../../../components/ui/Pagination'

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(
      <Pagination currentPage={1} totalItems={5} pageSize={10} onPageChange={vi.fn()} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when totalItems is zero', () => {
    const { container } = render(
      <Pagination currentPage={1} totalItems={0} pageSize={10} onPageChange={vi.fn()} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('displays the correct page info', () => {
    render(<Pagination currentPage={2} totalItems={45} pageSize={10} onPageChange={vi.fn()} />)
    expect(screen.getByText('Page 2 of 5 · 45 total')).toBeInTheDocument()
  })

  it('disables the Prev button on the first page', () => {
    render(<Pagination currentPage={1} totalItems={45} pageSize={10} onPageChange={vi.fn()} />)
    expect(screen.getByText('‹ Prev')).toBeDisabled()
    expect(screen.getByText('Next ›')).not.toBeDisabled()
  })

  it('disables the Next button on the last page', () => {
    render(<Pagination currentPage={5} totalItems={45} pageSize={10} onPageChange={vi.fn()} />)
    expect(screen.getByText('Next ›')).toBeDisabled()
    expect(screen.getByText('‹ Prev')).not.toBeDisabled()
  })

  it('calls onPageChange with the next page number when Next is clicked', () => {
    const handlePageChange = vi.fn()
    render(<Pagination currentPage={2} totalItems={45} pageSize={10} onPageChange={handlePageChange} />)

    fireEvent.click(screen.getByText('Next ›'))

    expect(handlePageChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageChange with the previous page number when Prev is clicked', () => {
    const handlePageChange = vi.fn()
    render(<Pagination currentPage={2} totalItems={45} pageSize={10} onPageChange={handlePageChange} />)

    fireEvent.click(screen.getByText('‹ Prev'))

    expect(handlePageChange).toHaveBeenCalledWith(1)
  })

  it('rounds up total pages when items do not divide evenly', () => {
    render(<Pagination currentPage={1} totalItems={21} pageSize={10} onPageChange={vi.fn()} />)
    expect(screen.getByText('Page 1 of 3 · 21 total')).toBeInTheDocument()
  })
})