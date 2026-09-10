import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetcher } from '../../api/client'

describe('fetcher', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('prepends BASE_URL and returns parsed JSON on success', async () => {
    const mockData = { commodities: [{ name: 'Copper' }] }
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    })

    const result = await fetcher('/api/prices/historical')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/prices/historical')
    )
    expect(result).toEqual(mockData)
  })

  it('throws an error when the response is not ok', async () => {
    ;(fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    })

    await expect(fetcher('/api/prices/historical')).rejects.toThrow('API error')
  })
})