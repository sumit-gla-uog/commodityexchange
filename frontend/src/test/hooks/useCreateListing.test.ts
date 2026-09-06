import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCreateListing } from '../../hooks/useCreateListing'

const validPayload = {
  sme_name: 'OM Exchange Ltd',
  commodity_offered: 'Copper',
  quantity_offered_mt: 50,
  commodity_wanted: 'Aluminum',
  quantity_wanted_mt: 197,
  location_uk: 'London',
}

describe('useCreateListing', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns true and clears error on a successful request', async () => {
    ;(fetch as any).mockResolvedValue({ ok: true })

    const { result } = renderHook(() => useCreateListing())

    let success: boolean = false
    await act(async () => {
      success = await result.current.createListing(validPayload)
    })

    expect(success).toBe(true)
    expect(result.current.error).toBe(false)
    expect(result.current.submitting).toBe(false)
  })

  it('returns false and sets error when the response is not ok', async () => {
    ;(fetch as any).mockResolvedValue({ ok: false })

    const { result } = renderHook(() => useCreateListing())

    let success: boolean = true
    await act(async () => {
      success = await result.current.createListing(validPayload)
    })

    expect(success).toBe(false)
    expect(result.current.error).toBe(true)
  })

  it('returns false and sets error when fetch throws', async () => {
    ;(fetch as any).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useCreateListing())

    let success: boolean = true
    await act(async () => {
      success = await result.current.createListing(validPayload)
    })

    expect(success).toBe(false)
    expect(result.current.error).toBe(true)
  })

  it('sets submitting to true during the request', async () => {
    let resolveRequest: (value: any) => void
    ;(fetch as any).mockReturnValue(new Promise((resolve) => { resolveRequest = resolve }))

    const { result } = renderHook(() => useCreateListing())

    act(() => {
      result.current.createListing(validPayload)
    })

    await waitFor(() => expect(result.current.submitting).toBe(true))

    await act(async () => {
      resolveRequest({ ok: true })
    })

    await waitFor(() => expect(result.current.submitting).toBe(false))
  })
})