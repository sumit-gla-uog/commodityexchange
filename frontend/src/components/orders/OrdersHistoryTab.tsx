import { useState, useMemo, useEffect } from 'react'
import { Text } from '@salt-ds/core'
import type { Order } from '../../types/commodity'
import { OrderCard } from './OrderCard'
import { Pagination } from '../ui/Pagination'
import styles from './OrdersHistoryTab.module.css'

interface OrdersHistoryTabProps {
  orders: Order[]
  search: string
  onOrderUpdated?: () => void
}

type StatusFilter = 'all' | 'pending' | 'settled' | 'cancelled'

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'In Progress' },
  { id: 'settled', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

const PAGE_SIZE = 5

export const OrdersHistoryTab = ({ orders, search,onOrderUpdated }: OrdersHistoryTabProps) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => statusFilter === 'all' || o.status === statusFilter)
      .filter((o) =>
        o.party_a_name.toLowerCase().includes(search.toLowerCase()) ||
        o.party_b_name.toLowerCase().includes(search.toLowerCase()) ||
        o.party_a_commodity.toLowerCase().includes(search.toLowerCase()) ||
        o.party_b_commodity.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase())
      )
  }, [orders, statusFilter, search])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, search])

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      settled: orders.filter((o) => o.status === 'settled').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    }
  }, [orders])

  const paginatedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className={styles.wrap}>
      <div className={styles.filterRow}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`${styles.filterButton} ${statusFilter === f.id ? styles.filterButtonActive : ''}`}
          >
            {f.label} <span className={styles.filterCount}>{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <Text className={styles.empty}>No orders found.</Text>
      ) : (
        <>
          {paginatedOrders.map((order) => (
            <OrderCard key={order.id} order={order} onNoteUpdated={onOrderUpdated}/>
          ))}
          <Pagination
            currentPage={page}
            totalItems={filteredOrders.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}