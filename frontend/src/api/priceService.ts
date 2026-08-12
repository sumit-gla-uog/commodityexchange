import useSWR from 'swr'
import { fetcher } from './client'
import type { CommodityPrice } from '../types/commodity'

export const usePrices = () => {
  const { data, error, isLoading } = useSWR<{ commodities: CommodityPrice[] }>(
    '/api/prices/historical',
    fetcher
  )

  return {
    commodities: data?.commodities ?? [],
    isLoading,
    isError: !!error,
  }
}