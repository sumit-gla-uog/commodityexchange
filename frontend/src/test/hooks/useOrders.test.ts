import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useOrders } from '../../hooks/useOrders'

describe('useOrders', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    localStorage.setItem('user', JSON.stringify({ id: 'user-123' }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('fetches orders scoped to the current user id from localStorage', async () => {
    const mockOrders = [{ id: 'O1', party_a_name: 'OM Exchange Ltd' }]
    ;(fetch as any).mockResolvedValue({
      json: async () => ({ orders: mockOrders }),
    })

    const { result } = renderHook(() => useOrders())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.orders).toEqual(mockOrders)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/orders/?user_id=user-123')
    )
  })

  it('sets isError to true when the fetch fails', async () => {
    ;(fetch as any).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useOrders())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isError).toBe(true)
  })

  it('falls back to an empty user id when localStorage has no user', async () => {
    localStorage.clear()
    ;(fetch as any).mockResolvedValue({
      json: async () => ({ orders: [] }),
    })

    renderHook(() => useOrders())

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders/?user_id=undefined')
      )
    })
  })

  it('refetch re-triggers the fetch call', async () => {
    ;(fetch as any).mockResolvedValue({
      json: async () => ({ orders: [] }),
    })

    const { result } = renderHook(() => useOrders())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const callCountAfterMount = (fetch as any).mock.calls.length

    result.current.refetch()

    await waitFor(() => expect((fetch as any).mock.calls.length).toBeGreaterThan(callCountAfterMount))
  })
})