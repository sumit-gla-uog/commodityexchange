import { usePrices } from '../../api/priceService'
import { PriceCard } from '../../components/ui/PriceCard'
import { Text } from '@salt-ds/core'

export const DashboardPage = () => {
  const { commodities, isLoading, isError } = usePrices()

  if (isLoading) return <Text>Loading prices...</Text>
  if (isError) return <Text>Error loading prices.</Text>

  return (
    <div className="flex flex-col gap-6">
      <Text styleAs="h2" className="text-white font-bold">
        Commodity Pricing Dashboard
      </Text>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {commodities.map((commodity) => (
          <PriceCard key={commodity.name} commodity={commodity} />
        ))}
      </div>
    </div>
  )
}