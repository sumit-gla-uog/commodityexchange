import { useState, useEffect, useMemo } from 'react'
import { Text } from '@salt-ds/core'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz } from 'ag-grid-community'
import type { ColDef } from 'ag-grid-community'
import { BASE_URL } from '../../api/client' 
import styles from './OrdersPage.module.css'
import type { Order } from '../../types/commodity'

// interface Order {
//   id: string
//   party_a_name: string
//   party_a_commodity: string
//   party_a_quantity: number
//   party_b_name: string
//   party_b_commodity: string
//   party_b_quantity: number
//   fair_value_delta: number
//   status: string
//   created_at: string
// }

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
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetch(`${BASE_URL}/api/orders/`)
      .then(res => res.json())
      .then(data => setOrders(data.orders))
  }, [])

  const totalMatches = orders.length
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const totalValue = orders
    .filter(o => o.status === 'settled')
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
          <p className={styles.summaryValueGreen}>${(totalValue / 1000).toFixed(1)}K</p>
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

      {selectedOrder && (
        <div className={styles.settlementCard}>
          <div className={styles.settlementHeader}>
            <div className={styles.settlementTitleGroup}>
              <span className={styles.pulseDot} />
              <Text styleAs="h3" className="text-white font-bold">Settlement Summary</Text>
              <span className={styles.matchId}>{selectedOrder.id}</span>
            </div>
            <StatusBadge value={selectedOrder.status} />
          </div>

          <div className={styles.detailGrid}>
            <div className={styles.detailBox}>
              <p className={styles.detailLabel}>Commodity A</p>
              <p className={styles.detailValue}>{selectedOrder.party_a_commodity}</p>
              <p className={styles.detailSubtext}>{selectedOrder.party_a_quantity} mt · {selectedOrder.party_a_name}</p>
            </div>
            <div className={styles.detailBox}>
              <p className={styles.detailLabel}>Commodity B</p>
              <p className={styles.detailValue}>{selectedOrder.party_b_commodity}</p>
              <p className={styles.detailSubtext}>{selectedOrder.party_b_quantity} mt · {selectedOrder.party_b_name}</p>
            </div>
            <div className={styles.detailBox}>
              <p className={styles.detailLabel}>Fair Value</p>
              <p className={styles.detailValue}>${Math.abs(selectedOrder.fair_value_delta).toLocaleString()}</p>
            </div>
            <div className={styles.detailBox}>
              <p className={styles.detailLabel}>Delta</p>
              <p className={selectedOrder.fair_value_delta >= 0 ? styles.deltaPositive : styles.deltaNegative}>
                {selectedOrder.fair_value_delta >= 0 ? '+' : ''}${selectedOrder.fair_value_delta.toLocaleString()}
              </p>
            </div>
          </div>

          <div className={styles.detailGrid3}>
            <div>
              <p className={styles.detailLabel}>Escrow Settlement</p>
              <p className={styles.detailValue}>${Math.abs(selectedOrder.fair_value_delta).toLocaleString()}</p>
            </div>
            <div>
              <p className={styles.detailLabel}>Platform Fee</p>
              <p className={styles.detailValue}>${(Math.abs(selectedOrder.fair_value_delta) * 0.003).toFixed(0)}</p>
            </div>
            <div>
              <p className={styles.detailLabel}>VAT Treatment</p>
              <p className={styles.detailValue}>Zero-rated</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}