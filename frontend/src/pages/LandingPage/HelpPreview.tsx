interface PreviewProps {
  onLoginClick: () => void
}

export const HelpPreview = ({ onLoginClick }: PreviewProps) => {
  const faqs = [
    { q: 'What is CommodEx?', a: 'A B2B commodity intelligence and barter platform for UK industrial SMEs.' },
    { q: 'How does the Barter Matching Engine work?', a: 'List a surplus commodity, get matched with a compatible listing, and settle at a fair, market-calculated value via escrow.' },
    { q: 'Where does pricing data come from?', a: 'World Bank Pink Sheet data combined with live market feeds.' },
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
          Help & FAQs
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
          Everything you need to know before getting started
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
        {faqs.map((item, i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              padding: '16px 20px'
            }}
          >
            <p style={{ color: '#ffffff', fontWeight: '600', margin: '0 0 6px 0' }}>{item.q}</p>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>{item.a}</p>
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
          Still have questions?
        </p>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px 0' }}>
          Log in to explore the full platform and reach out through the Expert Advice chat.
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