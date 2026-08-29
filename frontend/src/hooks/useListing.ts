import { useState, useEffect, useCallback } from 'react'
import { BASE_URL } from '../api/client'
import type { BarterListing } from '../types/commodity'

export const useListings = () => {
  const [listings, setListings] = useState<BarterListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const fetchListings = useCallback(() => {
    setIsLoading(true)
    setIsError(false)

    // fetch(`${BASE_URL}/api/barter/listings`)
    fetch(`${BASE_URL}/api/barter/listings?status=all`)
      .then((res) => res.json())
      .then((data) => setListings(data.listings ?? data))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  return { listings, isLoading, isError, refetch: fetchListings }
}