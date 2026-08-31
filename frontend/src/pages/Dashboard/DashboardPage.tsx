import { useState, useMemo } from 'react'
import { Text } from '@salt-ds/core'
import { usePrices } from '../../api/priceService'
import { PriceCard } from '../../components/ui/PriceCard'
import { PriceChart } from '../../components/ui/PriceChart'
import { Pagination } from '../../components/ui/Pagination'
import type { CommodityPrice } from '../../types/commodity'
import styles from './DashboardPage.module.css'

type Category = 'All' | 'Metals' | 'Energy' | 'Agriculture'

const CATEGORIES: Category[] = ['All', 'Metals', 'Energy', 'Agriculture']
const PAGE_SIZE = 10

export const DashboardPage = () => {
  const { commodities, isLoading, isError, mutate } = usePrices()
  const [selected, setSelected] = useState<CommodityPrice | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return commodities
      .filter((c) => activeCategory === 'All' || c.category === activeCategory)
      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  }, [commodities, activeCategory, search])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  if (isLoading) return <Text className="text-white">Loading prices...</Text>
  if (isError) return <Text className="text-white">Error loading prices.</Text>

  return (
    <div className={styles.page}>
      <div className={styles.leftColumn}>
        <div className={styles.leftColumn}>
 <div className={styles.leftColumn}>

  <div className={styles.headerRow}>
    <div className={styles.controlsRow}>
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => { setActiveCategory(cat); setPage(1) }}
          className={`${styles.categoryButton} ${activeCategory === cat ? styles.categoryButtonActive : ''}`}
        >
          {cat}
        </button>
      ))}
      <button onClick={() => mutate()} className={styles.refreshButton} title="Refresh prices">↻</button>
    </div>

    <div>
      <Text styleAs="h2" className="text-white font-bold">Commodity Pricing</Text>
      <Text className={styles.subtitle}>Live market data · Updated {now} BST</Text>
    </div>
  </div>

  <input
    value={search}
    onChange={(e) => { setSearch(e.target.value); setPage(1) }}
    placeholder="Search commodities..."
    className={styles.searchInputFull}
  />

  <div className={styles.cardsGrid}>
    {paginated.map(commodity => (
      <PriceCard
        key={commodity.name}
        commodity={commodity}
        onClick={() => setSelected(commodity)}
        isSelected={selected?.name === commodity.name}
      />
    ))}
  </div>

  <Pagination
    currentPage={page}
    totalItems={filtered.length}
    pageSize={PAGE_SIZE}
    onPageChange={setPage}
  />
</div>
</div>

      {/* <div className={styles.headerRow}>
  <div>
    <div className={styles.controlsRow}>
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => { setActiveCategory(cat); setPage(1) }}
          className={`${styles.categoryButton} ${activeCategory === cat ? styles.categoryButtonActive : ''}`}
        >
          {cat}
        </button>
      ))}

      <button onClick={() => mutate()} className={styles.refreshButton} title="Refresh prices">
        ↻
      </button>
    </div>

    <input
      value={search}
      onChange={(e) => { setSearch(e.target.value); setPage(1) }}
      placeholder="Search commodities..."
      className={styles.searchInputFull}
    />
  </div>

  <div>
    <Text styleAs="h2" className="text-white font-bold">Commodity Pricing</Text>
    <Text className={styles.subtitle}>Live market data · Updated {now} BST</Text>
  </div>
</div> */}

        {/* <div className={styles.cardsGrid}>
          {paginated.map(commodity => (
            <PriceCard
              key={commodity.name}
              commodity={commodity}
              onClick={() => setSelected(commodity)}
              isSelected={selected?.name === commodity.name}
            />
          ))}
        </div> */}

        {/* <Pagination
          currentPage={page}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        /> */}
      </div>

      {selected && (
        <div className={styles.sidePanel}>
          <div className={styles.panelHeader}>
            <div>
              <Text className={styles.panelTitle}>{selected.name}</Text>
              <Text className={styles.panelSubtitle}>12-Month Price History</Text>
            </div>
            <button onClick={() => setSelected(null)} className={styles.closeButton}>×</button>
          </div>

          <div className={styles.priceBox}>
            <div>
              <Text className={styles.priceLabel}>Latest Price</Text>
              <Text className={styles.priceValue}>${selected.latest_price.toLocaleString()}</Text>
              <Text className={styles.priceUnit}>{selected.unit}</Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text className={styles.priceLabel}>Monthly Change</Text>
              <Text className={selected.trend === 'up' ? styles.changeValueUp : styles.changeValueDown}>
                {selected.trend === 'up' ? '+' : ''}{selected.monthly_change}%
              </Text>
            </div>
          </div>

          <PriceChart commodity={selected} />
        </div>
      )}
    </div>
  )
}