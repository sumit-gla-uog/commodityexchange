import { useState } from 'react'
import { BASE_URL } from '../api/client'

interface CreateListingPayload {
  sme_name: string
  commodity_offered: string
  quantity_offered_mt: number
  commodity_wanted: string
  quantity_wanted_mt: number
  location_uk: string
  user_id?: string  
}

export const useCreateListing = () => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)

  const createListing = async (payload: CreateListingPayload) => {
    setSubmitting(true)
    setError(false)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      console.log('user from localStorage:', user)
console.log('payload with user_id:', { ...payload, user_id: user.id })
      const res = await fetch(`${BASE_URL}/api/barter/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        ...payload,
        user_id: user.id  
      }),

      })
      if (!res.ok) throw new Error('Failed to create listing')
      return true
    } catch {
      setError(true)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  return { createListing, submitting, error }
}