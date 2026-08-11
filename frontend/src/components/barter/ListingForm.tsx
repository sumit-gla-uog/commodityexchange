import { useForm } from 'react-hook-form'
import { Button, Text } from '@salt-ds/core'
import { BASE_URL } from '../../api/client'

const COMMODITIES = [
  'Copper', 'Aluminum', 'Nickel', 'Zinc', 'Lead',
  'Iron ore, cfr spot', 'Crude oil, Brent', 'Natural gas, Europe',
  'Coal, Australian', 'Wheat, US HRW', 'Maize', 'Sugar, world',
  'Palm oil', 'Soybeans'
]

interface ListingFormData {
  sme_name: string
  commodity_offered: string
  quantity_offered_mt: number
  commodity_wanted: string
  quantity_wanted_mt: number
  location_uk: string
}

export const ListingForm = () => {
  const { register, handleSubmit, reset } = useForm<ListingFormData>()

  const onSubmit = async (data: ListingFormData) => {
    await fetch(`${BASE_URL}/api/barter/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    reset()
    alert('Listing created successfully!')
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <Text styleAs="h3" className="text-white font-bold mb-4">
        Create Surplus Listing
      </Text>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="text-gray-400 text-sm mb-1 block">Company Name</label>
          <input
            {...register('sme_name', { required: true })}
            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
            placeholder="Acme Steel Ltd"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-1 block">Commodity Offered</label>
          <select
            {...register('commodity_offered', { required: true })}
            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
          >
            <option value="">Select commodity</option>
            {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-1 block">Quantity Offered (mt)</label>
          <input
            {...register('quantity_offered_mt', { required: true })}
            type="number"
            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
            placeholder="50"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-1 block">Commodity Wanted</label>
          <select
            {...register('commodity_wanted', { required: true })}
            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
          >
            <option value="">Select commodity</option>
            {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-1 block">Quantity Wanted (mt)</label>
          <input
            {...register('quantity_wanted_mt', { required: true })}
            type="number"
            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
            placeholder="45"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-1 block">Location (UK City)</label>
          <input
            {...register('location_uk', { required: true })}
            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white"
            placeholder="Glasgow"
          />
        </div>

        <Button type="submit" variant="primary">
          Create Listing
        </Button>
      </form>
    </div>
  )
}