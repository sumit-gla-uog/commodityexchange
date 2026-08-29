import { useState } from 'react'
import { BASE_URL } from '../api/client'

export const useDeleteListing = () => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)

  const deleteListing = async (listingId: string) => {
    setSubmitting(true)
    setError(false)
    try {
      const res = await fetch(`${BASE_URL}/api/barter/listings/${listingId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete listing')
      return true
    } catch {
      setError(true)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  return { deleteListing, submitting, error }
}