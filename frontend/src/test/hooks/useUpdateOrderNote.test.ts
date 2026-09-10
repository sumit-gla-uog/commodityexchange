import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useUpdateOrderNote } from '../../hooks/useUpdateOrderNote'

describe('useUpdateOrderNote', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns true and clears error on a successful update', async () => {
    ;(fetch as any).mockResolvedValue({ ok: true })

    const { result } = renderHook(() => useUpdateOrderNote())

    let success: boolean = false
    await act(async () => {
      success = await result.current.updateNote('O1', 'delivered on time')
    })

    expect(success).toBe(true)
    expect(result.current.error).toBe(false)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/orders/O1'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ note: 'delivered on time' }),
      })
    )
  })

  it('returns false and sets error when the response is not ok', async () => {
    ;(fetch as any).mockResolvedValue({ ok: false })

    const { result } = renderHook(() => useUpdateOrderNote())

    let success: boolean = true
    await act(async () => {
      success = await result.current.updateNote('O1', 'some note')
    })

    expect(success).toBe(false)
    expect(result.current.error).toBe(true)
  })

  it('returns false and sets error when fetch throws', async () => {
    ;(fetch as any).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useUpdateOrderNote())

    let success: boolean = true
    await act(async () => {
      success = await result.current.updateNote('O1', 'some note')
    })

    expect(success).toBe(false)
    expect(result.current.error).toBe(true)
  })

  it('sets submitting to true during the request', async () => {
    let resolveRequest: (value: any) => void
    ;(fetch as any).mockReturnValue(new Promise((resolve) => { resolveRequest = resolve }))

    const { result } = renderHook(() => useUpdateOrderNote())

    act(() => {
      result.current.updateNote('O1', 'some note')
    })

    await waitFor(() => expect(result.current.submitting).toBe(true))

    await act(async () => {
      resolveRequest({ ok: true })
    })

    await waitFor(() => expect(result.current.submitting).toBe(false))
  })
})