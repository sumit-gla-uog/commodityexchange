interface PreviewProps {
  onLoginClick: () => void
}

export const AiIntelligencePreview = ({ onLoginClick }: PreviewProps) => {
  const sampleQuestions = [
    'Should I buy copper now or wait for prices to drop?',
    'What is the current price trend for wheat?',
    'Is now a good time to procure aluminium for manufacturing?',
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
          AI Commodity Intelligence
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
          Ask questions about pricing and procurement, grounded in live data and historical trends
        </p>
      </div>

      <div style={{
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '600px',
        width: '100%',
        marginBottom: '40px'
      }}>
        {sampleQuestions.map((q, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: i < sampleQuestions.length - 1 ? '16px' : 0
            }}
          >
            <div style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '13px',
              maxWidth: '80%'
            }}>
              {q}
            </div>
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
          Get grounded procurement advice
        </p>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px 0' }}>
          Log in to chat with CommodEx's AI, backed by World Bank pricing data and live market feeds.
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