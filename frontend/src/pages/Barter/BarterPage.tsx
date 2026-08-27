import { useState, useMemo } from 'react'
import { Text } from '@salt-ds/core'
import { useListings } from '../../hooks/useListing'
import styles from './BarterPage.module.css'
import { MarketListingsTab } from '../../components/barter/MarketListingsTab'
import { CreateListingDialog } from '../../components/barter/CreateListingDialog'
import { MyListingsTab } from '../../components/barter/MyListingsTab'


type BarterTab = 'market' | 'my-listings' | 'orders'

const TABS: { id: BarterTab; label: string }[] = [
  { id: 'market', label: 'Market Listings' },
  { id: 'my-listings', label: 'My Listings' },
  { id: 'orders', label: 'Orders & History' },
]

const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

export const BarterPage = () => {
  const [activeTab, setActiveTab] = useState<BarterTab>('market')
  const [search, setSearch] = useState('')
  const { listings, isLoading, isError, refetch } = useListings()
  const [dialogOpen, setDialogOpen] = useState(false)

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

  return (
    <div className={styles.page}>
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      {!isLoading && !isError && activeTab === 'market' && (
        <MarketListingsTab listings={filteredMarket} onMatch={(id) => console.log('match', id)} />
      )}
      {!isLoading && !isError && activeTab === 'my-listings' && (
        <MyListingsTab listings={filteredMine} />
      )}
      {activeTab === 'orders' && <Text className={styles.tabContent}>Orders & History — TODO</Text>}

      <CreateListingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={refetch}
      />
    </div>
  )
}