import { useEffect, useState } from 'react'
import { LoginForm } from '../LoginPage/LoginForm'
import { RegisterForm } from '../RegisterPage/RegisterForm'
import { usePrices } from '../../api/priceService'


export const LandingPage = () => {
  const [isRegister, setIsRegister] = useState(false)
  const { commodities } = usePrices()
  const [carouselIndex, setCarouselIndex] = useState(0)

  const STATS_PER_VIEW = 10

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', backgroundColor: '#3b82f6',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>CX</span>
          </div>
          <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px' }}>CommodEx</span>
        </div>

        <div style={{ display: 'flex', gap: '32px' }}>
          {['Market Data', 'Barter Exchange', 'AI Intelligence', 'Help'].map(item => (
            <span key={item} style={{ color: '#94a3b8', fontSize: '14px', cursor: 'pointer' }}>{item}</span>
          ))}
        </div>

        <button
          onClick={() => setIsRegister(true)}
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
          {/* Replace src with your downloaded image */}
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
              // Fallback if image not found
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />

          {/* Overlay gradient */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to right, #0d1117 0%, transparent 20%)',
          }} />

          {/* Bottom stats */}
          {/* <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '40px',
            right: '40px',
            display: 'flex',
            gap: '12px'
          }}>
            {[
              { label: 'Copper', value: '+3.2%', color: '#22c55e' },
              { label: 'Crude Oil', value: '-0.5%', color: '#f87171' },
              { label: 'Wheat', value: '+1.8%', color: '#22c55e' },
              { label: 'Gold', value: '+3.6%', color: '#22c55e' },
            ].map(stat => (
              <div key={stat.label} style={{
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: '8px',
                padding: '10px 16px',
                backdropFilter: 'blur(10px)'
              }}>
                <p style={{ color: '#94a3b8', fontSize: '11px', margin: '0 0 2px 0' }}>{stat.label}</p>
                <p style={{ color: stat.color, fontSize: '14px', fontWeight: '700', margin: 0 }}>{stat.value}</p>
              </div>
            ))}
          </div> */}

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
    </div>
  )
}