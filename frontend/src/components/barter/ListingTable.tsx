import { useState, useEffect } from 'react'
import { Button, Text } from '@salt-ds/core'
import type { BarterListing, MatchResult } from '../../types/commodity'
import { BASE_URL } from '../../api/client'

interface ListingsTableProps {
  onMatch: (result: MatchResult) => void
}

export const ListingsTable = ({ onMatch }: ListingsTableProps) => {
  const [listings, setListings] = useState<BarterListing[]>([])
  const [loading, setLoading] = useState(false)

  const fetchListings = async () => {
    setLoading(true)
    const res = await fetch(`${BASE_URL}/api/barter/listings`)
    const data = await res.json()
    setListings(data.listings)
    setLoading(false)
  }
  useEffect(() => {
    fetchListings()
  }, [])

  const findMatch = async (id: string) => {
    const res = await fetch(`${BASE_URL}/api/barter/match/${id}`, {
      method: 'POST'
    })
    const data = await res.json()
    onMatch(data)
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <Text styleAs="h3" className="text-white font-bold">
          Active Listings
        </Text>
        {/* <Button onClick={fetchListings} variant="primary">
          {loading ? 'Loading...' : 'Refresh'}
        </Button> */}

        <button
          type="submit"
          onClick={fetchListings}
          style={{
            backgroundColor: '#22c55e',
            color: '#000000',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {listings.length === 0 ? (
        <Text className="text-gray-400">Click Refresh to load active listings.</Text>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-gray-900 rounded border border-gray-600 p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Text styleAs="label" className="text-white font-semibold">
                    {listing.sme_name}
                  </Text>
                  <Text styleAs="label" className="text-gray-400 text-sm">
                    Offering: {listing.quantity_offered_mt}mt {listing.commodity_offered}
                  </Text>
                  <Text styleAs="label" className="text-gray-400 text-sm">
                    Wanting: {listing.quantity_wanted_mt}mt {listing.commodity_wanted}
                  </Text>
                  <Text styleAs="label" className="text-gray-500 text-xs">
                    {listing.location_uk}
                  </Text>
                </div>
                {/* <Button
                  onClick={() => findMatch(listing.id)}
                  variant="primary"
                >
                  Find Match
                </Button> */}

                <button
                  type="submit"
                  onClick={() => findMatch(listing.id)}
                  style={{
                    backgroundColor: '#22c55e',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 20px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Find Match
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}