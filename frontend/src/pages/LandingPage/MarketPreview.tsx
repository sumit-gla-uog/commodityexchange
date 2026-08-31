import { usePrices } from '../../api/priceService'

interface MarketPreviewProps {
  onLoginClick: () => void
}

export const MarketPreview = ({ onLoginClick }: MarketPreviewProps) => {
  const { commodities, isLoading } = usePrices()

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 40px',
      backgroundColor: '#0d1117'
    }}>
      <div style={{ maxWidth: '900px', width: '100%', textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#ffffff', fontSize: '32px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
          Live Commodity Market Data
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
          Real-time pricing across metals, energy, and agriculture ||  powered by World Bank Pink Sheet data
        </p>
      </div>

      {isLoading ? (
        <p style={{ color: '#94a3b8' }}>Loading market data...</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          maxWidth: '900px',
          width: '100%',
          marginBottom: '40px'
        }}>
          {commodities.slice(0, 8).map(commodity => (
            <div
              key={commodity.name}
              style={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '16px'
              }}
            >
              <p style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                {commodity.category}
              </p>
              <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600', margin: '0 0 6px 0' }}>
                {commodity.name}
              </p>
              <p style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                ${commodity.latest_price.toLocaleString()}
              </p>
              <p style={{
                color: commodity.trend === 'up' ? '#4ade80' : '#f87171',
                fontSize: '13px',
                fontWeight: '600',
                margin: 0
              }}>
                {commodity.trend === 'up' ? '+' : ''}{commodity.monthly_change}%
              </p>
            </div>
          ))}
        </div>
      )}

      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #3b82f6',
        borderRadius: '12px',
        padding: '32px 48px',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <p style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
          Get the full picture
        </p>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px 0' }}>
          Log in to access the Barter Exchange, AI-powered market intelligence, and your order history.
        </p>
        <button
          onClick={onLoginClick}
          style={{
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 32px',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer'
          }}
        >
          Login / Register
        </button>
      </div>
    </div>
  )
}