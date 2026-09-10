import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useDeleteListing } from '../../hooks/useDeleteListing'

describe('useDeleteListing', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns true and clears error on a successful delete', async () => {
    ;(fetch as any).mockResolvedValue({ ok: true })

    const { result } = renderHook(() => useDeleteListing())

    let success: boolean = false
    await act(async () => {
      success = await result.current.deleteListing('L1')
    })

    expect(success).toBe(true)
    expect(result.current.error).toBe(false)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/barter/listings/L1'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('returns false and sets error when the response is not ok', async () => {
    ;(fetch as any).mockResolvedValue({ ok: false })

    const { result } = renderHook(() => useDeleteListing())

    let success: boolean = true
    await act(async () => {
      success = await result.current.deleteListing('L1')
    })

    expect(success).toBe(false)
    expect(result.current.error).toBe(true)
  })

  it('returns false and sets error when fetch throws', async () => {
    ;(fetch as any).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useDeleteListing())

    let success: boolean = true
    await act(async () => {
      success = await result.current.deleteListing('L1')
    })

    expect(success).toBe(false)
    expect(result.current.error).toBe(true)
  })

  it('sets submitting to true during the request', async () => {
    let resolveRequest: (value: any) => void
    ;(fetch as any).mockReturnValue(new Promise((resolve) => { resolveRequest = resolve }))

    const { result } = renderHook(() => useDeleteListing())

    act(() => {
      result.current.deleteListing('L1')
    })

    await waitFor(() => expect(result.current.submitting).toBe(true))

    await act(async () => {
      resolveRequest({ ok: true })
    })

    await waitFor(() => expect(result.current.submitting).toBe(false))
  })
})