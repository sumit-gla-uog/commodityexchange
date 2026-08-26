import { useState } from 'react'
import { Text } from '@salt-ds/core'
import styles from './BarterPage.module.css'

type BarterTab = 'market' | 'my-listings' | 'orders'

interface Listing {
  id: string
  commodity: string
  quantity: string
  location: string
  wantedInReturn: string
}

const TABS: { id: BarterTab; label: string }[] = [
  { id: 'market', label: 'Market Listings' },
  { id: 'my-listings', label: 'My Listings' },
  { id: 'orders', label: 'Orders & History' },
]

export const BarterPage = () => {
  const [activeTab, setActiveTab] = useState<BarterTab>('market')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [form, setForm] = useState({ commodity: '', quantity: '', location: '', wantedInReturn: '' })

  const handleCreateListing = () => {
    if (!form.commodity || !form.quantity || !form.location || !form.wantedInReturn) return
    setListings((prev) => [...prev, { id: crypto.randomUUID(), ...form }])
    setForm({ commodity: '', quantity: '', location: '', wantedInReturn: '' })
    setModalOpen(false)
  }

  const filteredListings = listings.filter((l) =>
    l.commodity.toLowerCase().includes(search.toLowerCase()) ||
    l.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.page}>

       <div>
        <Text styleAs="h2" className="text-white font-bold">
          Barter Matching Engine
        </Text>
        <Text className={styles.subtitle}>
          List surplus · Match with UK SMEs · Settle at fair value
        </Text>
      </div>

      
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
          <button onClick={() => setModalOpen(true)} className={styles.newListingButton}>
            + New Listing
          </button>
        )}
      </div>

      {activeTab === 'market' && (
        <Text className={styles.tabContent}>
          {filteredListings.length === 0
            ? 'No listings yet.'
            : `${filteredListings.length} listing(s) found — TODO: render as table`}
        </Text>
      )}
      {activeTab === 'my-listings' && <Text className={styles.tabContent}>My Listings — TODO</Text>}
      {activeTab === 'orders' && <Text className={styles.tabContent}>Orders & History — TODO</Text>}

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>List Surplus Commodity</span>
              <button className={styles.modalClose} onClick={() => setModalOpen(false)}>×</button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Offering Commodity</label>
                <input
                  className={styles.formInput}
                  value={form.commodity}
                  onChange={(e) => setForm({ ...form, commodity: e.target.value })}
                  placeholder="e.g. Aluminium"
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Quantity</label>
                <input
                  className={styles.formInput}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="e.g. 150t"
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Location (UK)</label>
                <input
                  className={styles.formInput}
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Sheffield"
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Wanted In Return</label>
                <input
                  className={styles.formInput}
                  value={form.wantedInReturn}
                  onChange={(e) => setForm({ ...form, wantedInReturn: e.target.value })}
                  placeholder="e.g. Copper"
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setModalOpen(false)}>Cancel</button>
              <button className={styles.postButton} onClick={handleCreateListing}>Post Listing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}