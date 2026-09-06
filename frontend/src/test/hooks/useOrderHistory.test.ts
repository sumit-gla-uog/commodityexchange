import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useOrderHistory } from '../../hooks/useOrderHistory'

describe('useOrderHistory', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    localStorage.setItem('user', JSON.stringify({ id: 'user-123' }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('does not fetch automatically on mount', () => {
    renderHook(() => useOrderHistory())
    expect(fetch).not.toHaveBeenCalled()
  })

  it('fetchOrders loads orders scoped to the current user', async () => {
    const mockOrders = [{ id: 'O1', party_a_name: 'Sumit Exchange Ltd' }]
    ;(fetch as any).mockResolvedValue({
      json: async () => ({ orders: mockOrders }),
    })

    const { result } = renderHook(() => useOrderHistory())

    act(() => {
      result.current.fetchOrders()
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.orders).toEqual(mockOrders)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/orders/?user_id=user-123')
    )
  })

  it('fetchOrders does not refetch once already fetched', async () => {
    ;(fetch as any).mockResolvedValue({
      json: async () => ({ orders: [] }),
    })

    const { result } = renderHook(() => useOrderHistory())

    act(() => { result.current.fetchOrders() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const callCountAfterFirstFetch = (fetch as any).mock.calls.length

    act(() => { result.current.fetchOrders() })

    expect((fetch as any).mock.calls.length).toBe(callCountAfterFirstFetch)
  })

  it('refetch always triggers a new fetch, even after fetchOrders has already run', async () => {
    ;(fetch as any).mockResolvedValue({
      json: async () => ({ orders: [] }),
    })

    const { result } = renderHook(() => useOrderHistory())

    act(() => { result.current.fetchOrders() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const callCountAfterFirstFetch = (fetch as any).mock.calls.length

    act(() => { result.current.refetch() })

    await waitFor(() =>
      expect((fetch as any).mock.calls.length).toBeGreaterThan(callCountAfterFirstFetch)
    )
  })

  it('sets isError to true when the fetch fails', async () => {
    ;(fetch as any).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useOrderHistory())

    act(() => { result.current.fetchOrders() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isError).toBe(true)
  })
})