import type { BarterListing } from '../../types/commodity'
import styles from './MarketListingsTab.module.css'

interface MarketListingsTabProps {
  listings: BarterListing[]
  onMatch: (listingId: string) => void
}

export const MarketListingsTab = ({ listings, onMatch }: MarketListingsTabProps) => {
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

      {listings.map((l) => (
        <div key={l.id} className={styles.row}>
          <span className={styles.company}>{l.sme_name}</span>
          <span className={styles.location}>{l.location_uk}</span>
          <span>{l.commodity_offered}</span>
          <span className={styles.qty}>{l.quantity_offered_mt}t</span>
          <span>{l.commodity_wanted}</span>
          <span className={styles.fairValue}>—</span>
          <span className={styles.posted}>{new Date(l.created_at).toLocaleDateString()}</span>
          <button className={styles.matchButton} onClick={() => onMatch(l.id)}>
            ⇄ Match
          </button>
        </div>
      ))}
    </div>
  )
}