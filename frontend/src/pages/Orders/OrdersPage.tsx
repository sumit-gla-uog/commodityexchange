import { useState, useEffect, useMemo, useCallback } from 'react'
import { Text } from '@salt-ds/core'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz } from 'ag-grid-community'
import type { ColDef } from 'ag-grid-community'
import { BASE_URL } from '../../api/client'
import styles from './OrdersPage.module.css'
import type { Order } from '../../types/commodity'
import { OrderCard } from '../../components/orders/OrderCard'
import { useOrders } from '../../hooks/useOrders'


const darkTheme = themeQuartz.withParams({
  backgroundColor: '#1f2937',
  foregroundColor: '#f9fafb',
  headerBackgroundColor: '#111827',
  borderColor: '#374151',
  rowHoverColor: '#374151',
  oddRowBackgroundColor: '#1a2432',
})

const statusClassMap: Record<string, string> = {
  settled: styles.statusSettled,
  pending: styles.statusPending,
  cancelled: styles.statusCancelled,
}

const StatusBadge = ({ value }: { value: string }) => (
  <span className={`${styles.statusBadge} ${statusClassMap[value] ?? styles.statusDefault}`}>
    {value}
  </span>
)

export const OrdersPage = () => {
  // const [orders, setOrders] = useState<Order[]>([])
  const { orders, isLoading, refetch } = useOrders()

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // const fetchOrders = useCallback(() => {
  //   fetch(`${BASE_URL}/api/orders/`)
  //     .then(res => res.json())
  //     .then(data => setOrders(data.orders))
  // }, [])

  // useEffect(() => {
  //   fetchOrders()
  // }, [fetchOrders])

  const handleOrderUpdated = () => {
  refetch()
}

  const totalMatches = orders.length
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const totalValue = orders
    // .filter(o => o.status === 'settled') // calculating totalvalue of all as there is no way of settlement because of legagl financial issue
    .reduce((sum, o) => sum + Math.abs(o.fair_value_delta), 0)

  const columnDefs = useMemo((): ColDef<Order>[] => [
    { field: 'id', headerName: 'Match ID', width: 120 },
    { field: 'party_a_name', headerName: 'Party A', flex: 1 },
    { field: 'party_a_commodity', headerName: 'Commodity A', flex: 1 },
    { field: 'party_a_quantity', headerName: 'Qty A', width: 100, valueFormatter: (p: any) => `${p.value} mt` },
    { field: 'party_b_name', headerName: 'Party B', flex: 1 },
    { field: 'party_b_commodity', headerName: 'Commodity B', flex: 1 },
    { field: 'party_b_quantity', headerName: 'Qty B', width: 100, valueFormatter: (p: any) => `${p.value} mt` },
    {
      field: 'fair_value_delta',
      headerName: 'Fair Value Delta',
      width: 140,
      cellStyle: (p: any) => ({
        color: p.value >= 0 ? '#4ade80' : '#f87171',
        fontWeight: '600'
      }),
      valueFormatter: (p: any) => `${p.value >= 0 ? '+' : ''}$${p.value.toLocaleString()}`
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      cellRenderer: (p: any) => <StatusBadge value={p.value} />
    },
    { field: 'created_at', headerName: 'Date', width: 120 },
    {
      headerName: 'Actions',
      width: 100,
      cellRenderer: (p: any) => (
        <button onClick={() => setSelectedOrder(p.data)} className={styles.viewButton}>
          View
        </button>
      )
    }
  ], [])

  return (
    <div className={styles.page}>
      <div>
        <Text styleAs="h2" className="text-white font-bold">Barter Match History</Text>
        <p className={styles.subtitle}>Completed and Pending Commodity Exchanges</p>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Total Matches</p>
          <p className={styles.summaryValue}>{totalMatches}</p>
          <p className={styles.summaryFootnote}>All time</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Pending Settlement</p>
          <p className={styles.summaryValueAmber}>{pendingCount}</p>
          <p className={styles.summaryFootnote}>Awaiting confirmation</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Total Value Exchanged</p>
          <p className={styles.summaryValueGreen}>${totalValue.toLocaleString()}K</p>
          <p className={styles.summaryFootnote}>USD equivalent</p>
        </div>
      </div>

      <div className={styles.gridCard}>
        <div className={styles.gridCardHeader}>
          <Text styleAs="h3" className="text-white font-bold">Match History</Text>
          <span className={styles.recordCount}>{orders.length} records</span>
        </div>
        <div className={styles.gridWrap}>
          <AgGridReact
            rowData={orders}
            columnDefs={columnDefs}
            theme={darkTheme}
            pagination={true}
            paginationPageSize={10}
          />
        </div>
      </div>

      {selectedOrder && <OrderCard order={selectedOrder} onNoteUpdated={handleOrderUpdated} />}
    </div>
  )
}