import { useState } from 'react'
import type { BarterListing } from '../../types/commodity'
import styles from './MarketListingsTab.module.css'
import { Pagination } from '../ui/Pagination'

const PAGE_SIZE = 5
// const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

interface MarketListingsTabProps {
  listings: BarterListing[]
  onMatch: (listingId: string) => void
}

export const MarketListingsTab = ({ listings, onMatch }: MarketListingsTabProps) => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const [page, setPage] = useState(1)
  const paginatedListings = listings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (listings.length === 0) {
    return <div className={styles.empty}>No listings yet.</div>
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>Active Market Listings</span>
        <span className={styles.count}>{listings.length} listings</span>
      </div>

      <div className={styles.tableHeaderRow}>
        <span>Company</span>
        <span>Location</span>
        <span>Offering</span>
        <span>Qty</span>
        <span>Wanting</span>
        <span>Fair Value</span>
        <span>Posted</span>
        <span></span>
      </div>

      {paginatedListings.map((l) => {
        const isMyListing = l.user_id === currentUser.id
        return (
          <div key={l.id} className={styles.row}>
            <span className={styles.company}>{l.sme_name}</span>
            <span className={styles.location}>{l.location_uk}</span>
            <span>{l.commodity_offered}</span>
            <span className={styles.qty}>{l.quantity_offered_mt}t</span>
            <span>{l.commodity_wanted}</span>
            <span className={styles.fairValue}>—</span>
            <span className={styles.posted}>{new Date(l.created_at).toLocaleDateString()}</span>
            <button
              className={styles.matchButton}
              onClick={() => isMyListing && onMatch(l.id)}
              disabled={!isMyListing}
              title={!isMyListing ? 'You can only match your own listings' : 'Find a match'}
              style={{
                opacity: isMyListing ? 1 : 0.4,
                cursor: isMyListing ? 'pointer' : 'not-allowed',
              }}
            >
              ⇄ Match
            </button>
          </div>
        )
      })}

      <Pagination
        currentPage={page}
        totalItems={listings.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  )
}