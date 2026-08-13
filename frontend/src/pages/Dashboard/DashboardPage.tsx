import { useState } from 'react'
import { Text } from '@salt-ds/core'
import { usePrices } from '../../api/priceService'
import { PriceCard } from '../../components/ui/PriceCard'
import { PriceChart } from '../../components/ui/PriceChart'
import type { CommodityPrice } from '../../types/commodity'

type Category = 'All' | 'Metals' | 'Energy' | 'Agriculture'

const CATEGORIES: Category[] = ['All', 'Metals', 'Energy', 'Agriculture']

export const DashboardPage = () => {
  const { commodities, isLoading, isError, mutate } = usePrices()
  const [selected, setSelected] = useState<CommodityPrice | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  const filtered = activeCategory === 'All'
    ? commodities
    : commodities.filter(c => c.category === activeCategory)

  const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  if (isLoading) return <Text className="text-white">Loading prices...</Text>
  if (isError) return <Text className="text-white">Error loading prices.</Text>

  return (
    <div style={{ display: 'flex', gap: '24px' }}>

      {/* Left — Cards + Header */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* <div> */}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>


          {/* Category Filters + Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeCategory === cat ? '#22c55e' : '#1f2937',
                  color: activeCategory === cat ? '#000000' : '#9ca3af',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => mutate()}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '16px'
              }}
              title="Refresh prices"
            >
              ↻
            </button>
          </div>
          
          <div>
            <Text styleAs="h2" className="text-white font-bold">Commodity Pricing</Text>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
              Live market data · Updated {now} BST
            </p>
          </div>

        </div>

        {/* Price Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns:  'repeat(4, 1fr)',
          gap: '16px'
        }}>
          {filtered.map(commodity => (
            <PriceCard
              key={commodity.name}
              commodity={commodity}
              onClick={() => setSelected(commodity)}
              isSelected={selected?.name === commodity.name}
            />
          ))}
        </div>
      </div>

      {/* Right — Chart Side Panel */}
      {/* Right — Chart Side Panel — Fixed overlay */}
{selected && (
  <div style={{
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    width: '400px',
    backgroundColor: '#1f2937',
    borderLeft: '1px solid #374151',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: 100,
    overflowY: 'auto',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.5)'
  }}>
          {/* Panel Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#ffffff', fontWeight: '600', margin: 0, fontSize: '15px' }}>
                {selected.name}
              </p>
              <p style={{ color: '#9ca3af', fontSize: '12px', margin: '2px 0 0 0' }}>
                12-Month Price History
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Current Price */}
          <div style={{
            backgroundColor: '#111827',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '11px', margin: 0, textTransform: 'uppercase' }}>
                Latest Price
              </p>
              <p style={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                ${selected.latest_price.toLocaleString()}
              </p>
              <p style={{ color: '#9ca3af', fontSize: '11px', margin: '2px 0 0 0' }}>
                {selected.unit}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#9ca3af', fontSize: '11px', margin: 0 }}>Monthly Change</p>
              <p style={{
                color: selected.trend === 'up' ? '#4ade80' : '#f87171',
                fontSize: '18px',
                fontWeight: '600',
                margin: '4px 0 0 0'
              }}>
                {selected.trend === 'up' ? '+' : ''}{selected.monthly_change}%
              </p>
            </div>
          </div>

          {/* Chart */}
          <PriceChart commodity={selected} />
        </div>
      )}

    </div>
  )
}