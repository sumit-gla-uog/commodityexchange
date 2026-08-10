import { useState, useEffect, useMemo } from 'react'
import { Text } from '@salt-ds/core'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz } from 'ag-grid-community'
import type { ColDef } from 'ag-grid-community'

interface Order {
  id: string
  sme_a: string
  commodity_a: string
  quantity_a: number
  sme_b: string
  commodity_b: string
  quantity_b: number
  fair_value_delta: number
  status: string
  created_at: string
}

const darkTheme = themeQuartz.withParams({
  backgroundColor: '#1f2937',
  foregroundColor: '#f9fafb',
  headerBackgroundColor: '#111827',
  borderColor: '#374151',
  rowHoverColor: '#374151',
  oddRowBackgroundColor: '#1a2432',
})

const StatusBadge = ({ value }: { value: string }) => {
  const styles: Record<string, string> = {
    settled: 'bg-green-900 text-green-400 border border-green-700',
    pending: 'bg-amber-900 text-amber-400 border border-amber-700',
    cancelled: 'bg-red-900 text-red-400 border border-red-700',
  }
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${styles[value] ?? 'bg-gray-700 text-gray-300'}`}>
      {value}
    </span>
  )
}

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/orders/')
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
    { field: 'sme_a', headerName: 'SME A', flex: 1 },
    { field: 'commodity_a', headerName: 'Commodity A', flex: 1 },
    {
      field: 'quantity_a',
      headerName: 'Qty A',
      width: 100,
      valueFormatter: (p: any) => `${p.value} mt`
    },
    { field: 'sme_b', headerName: 'SME B', flex: 1 },
    { field: 'commodity_b', headerName: 'Commodity B', flex: 1 },
    {
      field: 'quantity_b',
      headerName: 'Qty B',
      width: 100,
      valueFormatter: (p: any) => `${p.value} mt`
    },
    {
      field: 'fair_value_delta',
      headerName: 'Fair Value Delta',
      width: 140,
      cellStyle: (p: any) => ({
        color: p.value >= 0 ? '#4ade80' : '#f87171',
        fontWeight: '600'
      }),
      valueFormatter: (p: any) =>
        `${p.value >= 0 ? '+' : ''}$${p.value.toLocaleString()}`
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
        <button
          onClick={() => setSelectedOrder(p.data)}
          className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded transition-colors"
        >
          View
        </button>
      )
    }
  ], [])

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <Text styleAs="h2" className="text-white font-bold">Barter Match History</Text>
        <p className="text-gray-400 text-sm mt-1">Completed and Pending Commodity Exchanges</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Total Matches</p>
          <p className="text-white text-3xl font-bold">{totalMatches}</p>
          <p className="text-gray-500 text-xs mt-1">All time</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Pending Settlement</p>
          <p className="text-amber-400 text-3xl font-bold">{pendingCount}</p>
          <p className="text-gray-500 text-xs mt-1">Awaiting confirmation</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Total Value Exchanged</p>
          <p className="text-green-400 text-3xl font-bold">${(totalValue / 1000).toFixed(1)}K</p>
          <p className="text-gray-500 text-xs mt-1">USD equivalent</p>
        </div>
      </div>

      {/* AG Grid */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
          <Text styleAs="h3" className="text-white font-bold">Match History</Text>
          <span className="text-gray-400 text-sm">{orders.length} records</span>
        </div>
        <div style={{ height: '400px' }}>
          <AgGridReact
            rowData={orders}
            columnDefs={columnDefs}
            theme={darkTheme}
            pagination={true}
            paginationPageSize={10}
          />
        </div>
      </div>

      {/* Settlement Summary — AG Grid ke BAHAR */}
      {selectedOrder && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <Text styleAs="h3" className="text-white font-bold">Settlement Summary</Text>
              <span className="text-blue-400 font-mono text-sm">{selectedOrder.id}</span>
            </div>
            <StatusBadge value={selectedOrder.status} />
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-900 rounded p-4">
              <p className="text-gray-400 text-xs uppercase mb-1">Commodity A</p>
              <p className="text-white font-semibold">{selectedOrder.commodity_a}</p>
              <p className="text-gray-400 text-xs">{selectedOrder.quantity_a} mt</p>
            </div>
            <div className="bg-gray-900 rounded p-4">
              <p className="text-gray-400 text-xs uppercase mb-1">Commodity B</p>
              <p className="text-white font-semibold">{selectedOrder.commodity_b}</p>
              <p className="text-gray-400 text-xs">{selectedOrder.quantity_b} mt</p>
            </div>
            <div className="bg-gray-900 rounded p-4">
              <p className="text-gray-400 text-xs uppercase mb-1">Fair Value</p>
              <p className="text-white font-semibold">${Math.abs(selectedOrder.fair_value_delta).toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 rounded p-4">
              <p className="text-gray-400 text-xs uppercase mb-1">Delta</p>
              <p className={`font-semibold ${selectedOrder.fair_value_delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {selectedOrder.fair_value_delta >= 0 ? '+' : ''}${selectedOrder.fair_value_delta.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-gray-700 pt-4">
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">Escrow Settlement</p>
              <p className="text-white font-semibold">${Math.abs(selectedOrder.fair_value_delta).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">Platform Fee</p>
              <p className="text-white font-semibold">${(Math.abs(selectedOrder.fair_value_delta) * 0.003).toFixed(0)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">VAT Treatment</p>
              <p className="text-white font-semibold">Zero-rated</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}