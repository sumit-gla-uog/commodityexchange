import { useState } from 'react'
import { StackLayout, Tab, TabBar, TabList, Tabs, TabTrigger, Text } from '@salt-ds/core'

type BarterTab = 'market' | 'my-listings' | 'orders'

export const BarterPage = () => {
  const [activeTab, setActiveTab] = useState<BarterTab>('market')

  return (
    <StackLayout gap={3}>
      <div>
        <Text styleAs="h2" className="text-white font-bold">
          Barter Matching Engine
        </Text>
        <Text className="text-gray-400">
          List surplus · Match with UK SMEs · Settle at fair value
        </Text>
      </div>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value as any)}>
        <TabBar>
          <TabList>
            <Tab value="market">
              <TabTrigger>Market Listings</TabTrigger>
            </Tab>
            <Tab value="my-listings">
              <TabTrigger>My Listings</TabTrigger>
            </Tab>
            <Tab value="orders">
              <TabTrigger>Orders & History</TabTrigger>
            </Tab>
          </TabList>
        </TabBar>
      </Tabs>

      {activeTab === 'market' && <Text className="text-gray-400">Market Listings — TODO</Text>}
      {activeTab === 'my-listings' && <Text className="text-gray-400">My Listings — TODO</Text>}
      {activeTab === 'orders' && <Text className="text-gray-400">Orders & History — TODO</Text>}
    </StackLayout>
  )
}