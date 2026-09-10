import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useGuardrailLogs } from '../../hooks/useGuardrailLogs'
import { BASE_URL } from '../../api/client'

const mockLogsResponse = {
  logs: [
    { status: 'BLOCKED', query: 'What is Bitcoin price?', reason: 'Not a commodity', timestamp: '2026-09-10T11:47:03+00:00' },
    { status: 'PASSED', query: 'Copper price trend?', reason: 'Valid commodity query', timestamp: '2026-09-10T11:47:19+00:00' },
  ],
  total: 2,
}

describe('useGuardrailLogs', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('fetches logs on mount with default page and page size', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(mockLogsResponse),
    })

    const { result } = renderHook(() => useGuardrailLogs(5))

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/guardrails/log?page=1&page_size=5`
    )
    expect(result.current.logs).toHaveLength(2)
    expect(result.current.total).toBe(2)
    expect(result.current.page).toBe(1)
  })

  it('refetches when page changes', async () => {
    ;(fetch as any)
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockLogsResponse) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ logs: [], total: 2 }) })

    const { result } = renderHook(() => useGuardrailLogs(5))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setPage(2)
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/guardrails/log?page=2&page_size=5`
    )
    expect(result.current.page).toBe(2)
  })

  it('resets to empty state on fetch failure', async () => {
    ;(fetch as any).mockRejectedValueOnce(new Error('network error'))

    const { result } = renderHook(() => useGuardrailLogs(5))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.logs).toEqual([])
    expect(result.current.total).toBe(0)
  })

  it('respects a custom page size', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(mockLogsResponse),
    })

    renderHook(() => useGuardrailLogs(10))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/guardrails/log?page=1&page_size=10`
      )
    )
  })
})