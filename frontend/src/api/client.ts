// Base URL for all API calls
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Generic fetcher function for SWR
export const fetcher = (url: string) =>
  fetch(`${BASE_URL}${url}`).then(res => {
    if (!res.ok) throw new Error('API error')
    return res.json()
  })