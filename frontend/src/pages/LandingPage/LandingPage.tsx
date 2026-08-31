import { useState, useEffect } from 'react'
import { LoginForm } from '../LoginPage/LoginForm'
import { RegisterForm } from '../RegisterPage/RegisterForm'
import { MarketPreview } from './MarketPreview'
import { BarterPreview } from './BarterPreview'
import { AiIntelligencePreview } from './AiIntelligencePreview'
import { HelpPreview } from './HelpPreview'
import { usePrices } from '../../api/priceService'

export const LandingPage = () => {
  const [isRegister, setIsRegister] = useState(false)
  const [activeView, setActiveView] = useState<'auth' | 'market' | 'barter' | 'ai' | 'help'>('auth')
  const { commodities } = usePrices()
  const [carouselIndex, setCarouselIndex] = useState(0)

  const STATS_PER_VIEW = 5

  useEffect(() => {
    if (commodities.length <= STATS_PER_VIEW) return
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + STATS_PER_VIEW) % commodities.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [commodities.length])

  const visibleStats = commodities.length > 0
    ? Array.from({ length: STATS_PER_VIEW }, (_, i) =>
        commodities[(carouselIndex + i) % commodities.length]
      )
    : []

  const NAV_ITEMS: { label: string; view: 'market' | 'barter' | 'ai' | 'help' }[] = [
    { label: 'Market Data', view: 'market' },
    { label: 'Barter Exchange', view: 'barter' },
    { label: 'AI Intelligence', view: 'ai' },
    { label: 'Help', view: 'help' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0d1117',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        borderBottom: '1px solid #1e293b'
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => setActiveView('auth')}
        >
          <div style={{
            width: '32px', height: '32px', backgroundColor: '#3b82f6',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>CX</span>
          </div>
          <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px' }}>CommodEx</span>
        </div>

        <div style={{ display: 'flex', gap: '32px' }}>
          {NAV_ITEMS.map(item => (
            <span
              key={item.view}
              onClick={() => setActiveView(item.view)}
              style={{ color: activeView === item.view ? '#ffffff' : '#94a3b8', fontSize: '14px', cursor: 'pointer' }}
            >
              {item.label}
            </span>
          ))}
        </div>

        <button
          onClick={() => { setActiveView('auth'); setIsRegister(true) }}
          style={{
            backgroundColor: '#3b82f6', color: '#ffffff', border: 'none',
            borderRadius: '8px', padding: '8px 20px', fontWeight: '600',
            fontSize: '14px', cursor: 'pointer'
          }}
        >
          Register
        </button>
      </nav>

      {/* Main Content */}
      {activeView === 'market' && <MarketPreview onLoginClick={() => setActiveView('auth')} />}
      {activeView === 'barter' && <BarterPreview onLoginClick={() => setActiveView('auth')} />}
      {activeView === 'ai' && <AiIntelligencePreview onLoginClick={() => setActiveView('auth')} />}
      {activeView === 'help' && <HelpPreview onLoginClick={() => setActiveView('auth')} />}

      {activeView === 'auth' && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'stretch'
        }}>
          {/* Left — Form */}
          <div style={{
            width: '420px',
            flexShrink: 0,
            padding: '60px 48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#0d1117'
          }}>
            {isRegister
              ? <RegisterForm onSwitchToLogin={() => setIsRegister(false)} />
              : <LoginForm onSwitchToRegister={() => setIsRegister(true)} />
            }
          </div>

          {/* Right — Hero Image */}
          <div style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#1e293b'
          }}>
            <img
              src="/trading_image.jpeg"
              alt="Commodity trading floor"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.85
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />

            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(to right, #0d1117 0%, transparent 20%)',
            }} />

            {/* Bottom stats — auto-rotating carousel */}
            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '40px',
              right: '40px',
              display: 'flex',
              gap: '12px',
              overflow: 'hidden'
            }}>
              {visibleStats.map(stat => (
                <div key={stat.name} style={{
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  backdropFilter: 'blur(10px)',
                  maxWidth: '160px',
                  transition: 'opacity 0.4s ease'
                }}>
                  <p style={{ color: '#94a3b8', fontSize: '11px', margin: '0 0 2px 0' }}>{stat.name}</p>
                  <p style={{
                    color: stat.trend === 'up' ? '#22c55e' : '#f87171',
                    fontSize: '14px', fontWeight: '700', margin: 0
                  }}>
                    {stat.trend === 'up' ? '+' : ''}{stat.monthly_change}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}