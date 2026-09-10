import { usePrices } from '../../api/priceService'
import styles from './MarketPreview.module.css'

interface MarketPreviewProps {
  onLoginClick: () => void
}

export const MarketPreview = ({ onLoginClick }: MarketPreviewProps) => {
  const { commodities, isLoading } = usePrices()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Live Commodity Market Data</h1>
        <p className={styles.subtitle}>
          Real-time pricing across metals, energy, and agriculture || powered by World Bank Pink Sheet data
        </p>
      </div>

      {isLoading ? (
        <p className={styles.loadingText}>Loading market data...</p>
      ) : (
        <div className={styles.grid}>
          {commodities.slice(0, 8).map(commodity => (
            <div key={commodity.name} className={styles.card}>
              <p className={styles.cardCategory}>{commodity.category}</p>
              <p className={styles.cardName}>{commodity.name}</p>
              <p className={styles.cardPrice}>${commodity.latest_price.toLocaleString()}</p>
              <p className={`${styles.cardChange} ${commodity.trend === 'up' ? styles.trendUp : styles.trendDown}`}>
                {commodity.trend === 'up' ? '+' : ''}{commodity.monthly_change}%
              </p>
            </div>
          ))}
        </div>
      )}

      <div className={styles.ctaBox}>
        <p className={styles.ctaTitle}>Get the full picture</p>
        <p className={styles.ctaSubtitle}>
          Log in to access the Barter Exchange, AI-powered market intelligence, and your order history.
        </p>
        <button className={styles.ctaBtn} onClick={onLoginClick}>
          Login / Register
        </button>
      </div>
    </div>
  )
}