import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useListings } from '../../hooks/useListing'

describe('useListings', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches listings on mount and sets isLoading to false when done', async () => {
    const mockListings = [{ id: 'L1', commodity_offered: 'Copper' }]
    ;(fetch as any).mockResolvedValue({
      json: async () => ({ listings: mockListings }),
    })

    const { result } = renderHook(() => useListings())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.listings).toEqual(mockListings)
    expect(result.current.isError).toBe(false)
  })

  it('sets isError to true when the fetch fails', async () => {
    ;(fetch as any).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useListings())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isError).toBe(true)
    expect(result.current.listings).toEqual([])
  })

  it('refetch re-triggers the fetch call', async () => {
    ;(fetch as any).mockResolvedValue({
      json: async () => ({ listings: [] }),
    })

    const { result } = renderHook(() => useListings())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const callCountAfterMount = (fetch as any).mock.calls.length

    result.current.refetch()

    await waitFor(() => expect((fetch as any).mock.calls.length).toBeGreaterThan(callCountAfterMount))
  })
})