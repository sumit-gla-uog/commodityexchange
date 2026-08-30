import { useState, useEffect, useCallback } from 'react'
import { BASE_URL } from '../api/client'

interface Order {
  id: string
  party_a_name: string
  party_a_commodity: string
  party_a_quantity: number
  party_b_name: string
  party_b_commodity: string
  party_b_quantity: number
  fair_value_delta: number
  status: string
  created_at: string
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchOrders = useCallback(() => {
    setIsLoading(true)
    fetch(`${BASE_URL}/api/orders/?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders)
        setIsLoading(false)
      })
      .catch(() => {
        setIsError(true)
        setIsLoading(false)
      })
  }, [user.id])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return { orders, isLoading, isError, refetch: fetchOrders }
}