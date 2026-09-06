import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import useSWR from 'swr'
import { usePrices } from '../../api/priceService'

vi.mock('swr')

describe('usePrices', () => {
  it('returns commodities array when data loads successfully', () => {
    const mockData = {
      commodities: [
        { name: 'Copper', category: 'Metals', latest_price: 13552, trend: 'up', monthly_change: 0.07 },
      ],
    }

    ;(useSWR as any).mockReturnValue({
      data: mockData,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    })

    const { result } = renderHook(() => usePrices())

    expect(result.current.commodities).toEqual(mockData.commodities)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('returns empty array when data is undefined', () => {
    ;(useSWR as any).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    })

    const { result } = renderHook(() => usePrices())

    expect(result.current.commodities).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })

  it('sets isError to true when SWR returns an error', () => {
    ;(useSWR as any).mockReturnValue({
      data: undefined,
      error: new Error('API error'),
      isLoading: false,
      mutate: vi.fn(),
    })

    const { result } = renderHook(() => usePrices())

    expect(result.current.isError).toBe(true)
  })

  it('calls useSWR with the correct endpoint and fetcher', () => {
    ;(useSWR as any).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    })

    usePrices()

    expect(useSWR).toHaveBeenCalledWith('/api/prices/historical', expect.any(Function))
  })
})