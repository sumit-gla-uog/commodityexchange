import { useState, useCallback } from 'react'
import { BASE_URL } from '../api/client'
import type { Order } from '../types/commodity'

export const useOrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  const loadOrders = useCallback(() => {
    setIsLoading(true)
    setIsError(false)

    return fetch(`${BASE_URL}/api/orders/`)
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? data))
      .catch(() => setIsError(true))
      .finally(() => {
        setIsLoading(false)
        setHasFetched(true)
      })
  }, [])

  const fetchOrders = useCallback(() => {
    if (hasFetched) return
    loadOrders()
  }, [hasFetched, loadOrders])

  const refetch = useCallback(() => {
    loadOrders()
  }, [loadOrders])

  return { orders, isLoading, isError, fetchOrders, refetch }
}