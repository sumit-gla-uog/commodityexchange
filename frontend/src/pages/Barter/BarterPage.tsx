import { useState, useMemo } from 'react'
import { Text } from '@salt-ds/core'
import { useListings } from '../../hooks/useListing'
import styles from './BarterPage.module.css'
import { MarketListingsTab } from '../../components/barter/MarketListingsTab'
import { CreateListingDialog } from '../../components/barter/CreateListingDialog'
import { MyListingsTab } from '../../components/barter/MyListingsTab'
import { MatchResultPanel } from '../../components/barter/MatchResultPanel'
import { useOrderHistory } from '../../hooks/useOrderHistory'
import { OrdersHistoryTab } from '../../components/orders/OrdersHistoryTab'


type BarterTab = 'market' | 'my-listings' | 'orders'

const TABS: { id: BarterTab; label: string }[] = [
  { id: 'market', label: 'Market Listings' },
  { id: 'my-listings', label: 'My Listings' },
  { id: 'orders', label: 'Orders & History' },
]

const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

export const BarterPage = () => {
  const { orders, isLoading: ordersLoading, isError: ordersError, fetchOrders, refetch: refetchOrders } = useOrderHistory()
  const [activeTab, setActiveTab] = useState<BarterTab>('market')
  const [search, setSearch] = useState('')
  const { listings, isLoading, isError, refetch } = useListings()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [matchedListingId, setMatchedListingId] = useState<string | null>(null)
  

  // const searchFilter = (l: typeof listings[number]) =>
  //   l.commodity_offered.toLowerCase().includes(search.toLowerCase()) ||
  //   l.commodity_wanted.toLowerCase().includes(search.toLowerCase()) ||
  //   l.location_uk.toLowerCase().includes(search.toLowerCase())

  // const filteredMarket = listings.filter(searchFilter)
  // const filteredMine = listings.filter((l) => l.sme_name === currentUser.sme_name).filter(searchFilter)

  const filteredMarket = useMemo(() => {
    return listings.filter((l) =>
      l.commodity_offered.toLowerCase().includes(search.toLowerCase()) ||
      l.commodity_wanted.toLowerCase().includes(search.toLowerCase()) ||
      l.location_uk.toLowerCase().includes(search.toLowerCase()) ||
      l.sme_name.toLowerCase().includes(search.toLowerCase())
     )
  }, [listings, search])

  const filteredMine = useMemo(() => {
    return listings
      .filter((l) => l.sme_name === currentUser.sme_name)
      .filter((l) =>
        l.commodity_offered.toLowerCase().includes(search.toLowerCase()) ||
        l.commodity_wanted.toLowerCase().includes(search.toLowerCase()) ||
        l.location_uk.toLowerCase().includes(search.toLowerCase())
      )
  }, [listings, search])

  const handleTabClick = (tabId: BarterTab) => {
  setActiveTab(tabId)
  if (tabId === 'orders') fetchOrders()
}

  return (
    <div className={styles.page}>
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.controlsRow}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search listings..."
          className={styles.searchInput}
        />
        {activeTab === 'market' && (
          <button className={styles.newListingButton} onClick={() => setDialogOpen(true)}>
            + New Listing
          </button>
        )}
      </div>

      {isLoading && <Text className={styles.tabContent}>Loading listings...</Text>}
      {isError && <Text className={styles.tabContent}>Failed to load listings.</Text>}

      {/* {!isLoading && !isError && activeTab === 'market' && (
        <MarketListingsTab listings={filteredMarket} onMatch={(id) => console.log('match', id)} />
      )} */}
    {!isLoading && !isError && activeTab === 'market' && (
  <>
    {matchedListingId && (
      <MatchResultPanel
        listingId={matchedListingId}
        onClose={() => setMatchedListingId(null)}
        onSuccess={() => {
          refetch()
          setMatchedListingId(null)
        }}
      />
    )}
    <MarketListingsTab
      listings={filteredMarket}
      onMatch={(id) => setMatchedListingId(id)}
    />
  </>
)} 
      {!isLoading && !isError && activeTab === 'my-listings' && (
        <MyListingsTab listings={filteredMine} onDeleted={refetch}/>
      )}
      {activeTab === 'orders' && (
  <>
    {ordersLoading && <Text className={styles.tabContent}>Loading orders...</Text>}
    {ordersError && <Text className={styles.tabContent}>Failed to load orders.</Text>}
    {!ordersLoading && !ordersError && (
      <OrdersHistoryTab orders={orders} search={search} onOrderUpdated={refetchOrders}/>
    )}
  </>
)}

      <CreateListingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={refetch}
      />
    </div>
  )
}