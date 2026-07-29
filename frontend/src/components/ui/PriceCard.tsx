import { Card, Text } from '@salt-ds/core'
import { ArrowUpIcon, ArrowDownIcon } from '@salt-ds/icons'
import type { CommodityPrice } from '../../types/commodity'

interface PriceCardProps {
  commodity: CommodityPrice
}

export const PriceCard = ({ commodity }: PriceCardProps) => {
  const isUp = commodity.trend === 'up'

  return (
    <div className="p-4 rounded-lg border border-gray-700 bg-gray-800 hover:border-blue-500 transition-colors cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {commodity.category}
        </span>
        <span className={`flex items-center gap-1 text-sm font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? <ArrowUpIcon size={1} /> : <ArrowDownIcon size={1} />}
          {Math.abs(commodity.monthly_change)}%
        </span>
      </div>
      <div className="mb-2">
        <Text styleAs="label" className="text-gray-300 font-medium">
          {commodity.name}
        </Text>
      </div>
      <div className="mb-1">
        <Text styleAs="h3" className="text-white font-bold">
          ${commodity.latest_price.toLocaleString()}
        </Text>
      </div>
      <Text styleAs="label" className="text-gray-500 text-xs">
        {commodity.unit}
      </Text>
    </div>
  )
}