import type { BarterListing } from '../../types/commodity'
import styles from './MyListingsTab.module.css'
import { useState, useEffect } from 'react'
import { Pagination } from '../ui/Pagination'
import { useDeleteListing } from '../../hooks/useDeleteListing'
import { DeleteIcon } from '@salt-ds/icons'

const PAGE_SIZE = 2

interface MyListingsTabProps {
  listings: BarterListing[]
  onDeleted?: () => void
}

const statusLabel: Record<BarterListing['status'], string> = {
  active: 'Active',
  matched: 'Matched',
  expired: 'Expired',
}

const statusClass: Record<BarterListing['status'], string> = {
  active: styles.statusActive,
  matched: styles.statusMatched,
  expired: styles.statusExpired,
}

export const MyListingsTab = ({ listings, onDeleted }: MyListingsTabProps) => {
  const [page, setPage] = useState(1)
  const { deleteListing, submitting } = useDeleteListing()



  useEffect(() => {
    setPage(1)
  }, [listings])

  if (listings.length === 0) {
    return <div className={styles.empty}>You haven't posted any listings yet.</div>
  }

  const paginatedListings = listings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = async (listingId: string) => {
    const confirmed = window.confirm('Delete this listing?')
    if (!confirmed) return
    const success = await deleteListing(listingId)
    if (success) onDeleted?.()
  }

  return (
    <div className={styles.wrap}>
      {/* {listings.map((l) => ( */}
      {paginatedListings.map((l) => (
        <div key={l.id} className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.summary}>
              <span className={styles.commodity}>{l.commodity_offered}</span>
              <span className={styles.detail}>{l.quantity_offered_mt}t</span>
              <span className={styles.detail}>· {l.location_uk}</span>
              <span className={styles.arrow}> -- </span>
              <span className={styles.wanted}>{l.commodity_wanted}</span>
            </div>
            <div className={styles.actions}>
              <span className={`${styles.statusBadge} ${statusClass[l.status]}`}>
                • {statusLabel[l.status]}
              </span>
              {l.status === 'active' && (
                <button className={styles.deleteButton} title="Delete listing" onClick={() => handleDelete(l.id)} disabled={submitting}>
                  <DeleteIcon /> Delete
                </button>
              )}
            </div>
          </div>

          <div className={styles.cardBottom}>
            <span className={styles.posted}>Posted {new Date(l.created_at).toLocaleString()}</span>
            <button className={styles.addNoteButton}> Add note</button>
          </div>
        </div>
      ))}

      <Pagination
        currentPage={page}
        totalItems={listings.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  )
}