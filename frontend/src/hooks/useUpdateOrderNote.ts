import { useState } from 'react'
import { BASE_URL } from '../api/client'

export const useUpdateOrderNote = () => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)

  const updateNote = async (orderId: string, note: string) => {
    setSubmitting(true)
    setError(false)
    try {
      const res = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      })
      if (!res.ok) throw new Error('Failed to update note')
      return true
    } catch {
      setError(true)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  return { updateNote, submitting, error }
}