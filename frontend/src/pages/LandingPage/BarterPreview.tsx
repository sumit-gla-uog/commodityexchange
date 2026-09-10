interface PreviewProps {
  onLoginClick: () => void
}

export const BarterPreview = ({ onLoginClick }: PreviewProps) => {
  const sampleListings = [
    { company: 'Midlands Steel Works Ltd', offering: 'Steel (HRC)', qty: '200t', wanting: 'Copper' },
    { company: 'Northern Grain Co.', offering: 'Wheat', qty: '500t', wanting: 'Natural Gas' },
    { company: 'Thames Energy Partners', offering: 'Brent Crude', qty: '1,000 bbl', wanting: 'Aluminium' },
  ]

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
          Barter Matching Engine
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
          List your surplus commodities, get matched with UK SMEs, and settle at a fair, market-calculated value
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '700px',
        width: '100%',
        marginBottom: '40px'
      }}>
        {sampleListings.map((l, i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              filter: 'blur(1px)',
              opacity: 0.7
            }}
          >
            <div>
              <p style={{ color: '#ffffff', fontWeight: '600', margin: '0 0 4px 0' }}>{l.company}</p>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                Offering {l.qty} {l.offering} → Wants {l.wanting}
              </p>
            </div>
            <span style={{
              backgroundColor: '#2563eb', color: '#ffffff', fontSize: '12px',
              padding: '6px 14px', borderRadius: '6px', fontWeight: '600'
            }}>
              ⇄ Match
            </span>
          </div>
        ))}
      </div>

      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #3b82f6',
        borderRadius: '12px',
        padding: '32px 48px',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <p style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
          Start trading surplus stock
        </p>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px 0' }}>
          Log in to list your commodities, view live matches, and initiate trades through secure escrow.
        </p>
        <button
          onClick={onLoginClick}
          style={{
            backgroundColor: '#3b82f6', color: '#ffffff', border: 'none',
            borderRadius: '8px', padding: '12px 32px', fontWeight: '600',
            fontSize: '15px', cursor: 'pointer'
          }}
        >
          Login / Register
        </button>
      </div>
    </div>
  )
}