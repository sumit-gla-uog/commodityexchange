import { useState, useEffect } from 'react'
import { LoginForm } from '../LoginPage/LoginForm'
import { RegisterForm } from '../RegisterPage/RegisterForm'
import { MarketPreview } from './MarketPreview'
import { BarterPreview } from './BarterPreview'
import { AiIntelligencePreview } from './AiIntelligencePreview'
import { HelpPreview } from './HelpPreview'
import { usePrices } from '../../api/priceService'
import { MenuIcon } from '@salt-ds/icons'
import styles from './LandingPage.module.css'

export const LandingPage = () => {
  const [isRegister, setIsRegister] = useState(false)
  const [activeView, setActiveView] = useState<'auth' | 'market' | 'barter' | 'ai' | 'help'>('auth')
  const { commodities } = usePrices()
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <div className={styles.brand} onClick={() => setActiveView('auth')}>
          <div className={styles.brandMark}>
            <span className={styles.brandMarkText}>CX</span>
          </div>
          <span className={styles.brandName}>CommodEx</span>
        </div>

        <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
          {NAV_ITEMS.map(item => (
    <button
      key={item.view}
      className={`${styles.navLink} ${activeView === item.view ? styles.navLinkActive : ''}`}
      onClick={() => { setActiveView(item.view); setMobileMenuOpen(false) }}
    >
      {item.label}
    </button>
  ))}

        </div>
<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className={styles.registerBtn}
          onClick={() => { setActiveView('auth'); setIsRegister(true) }}
        >
          Register
        </button>
        <button className={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(o => !o)}>

 <MenuIcon />
</button>
 </div>
      </nav>

      {activeView === 'market' && <MarketPreview onLoginClick={() => setActiveView('auth')} />}
      {activeView === 'barter' && <BarterPreview onLoginClick={() => setActiveView('auth')} />}
      {activeView === 'ai' && <AiIntelligencePreview onLoginClick={() => setActiveView('auth')} />}
      {activeView === 'help' && <HelpPreview onLoginClick={() => setActiveView('auth')} />}

      {activeView === 'auth' && (
        <div className={styles.authWrapper}>
          <div className={styles.formPanel}>
            {isRegister
              ? <RegisterForm onSwitchToLogin={() => setIsRegister(false)} />
              : <LoginForm onSwitchToRegister={() => setIsRegister(true)} />
            }
          </div>

          <div className={styles.heroPanel}>
            <img
              src="/trading_image.jpeg"
              alt="Commodity trading floor"
              className={styles.heroImage}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className={styles.heroFade} />

            <div className={styles.statsRow}>
              {visibleStats.map(stat => (
                <div key={stat.name} className={styles.statCard}>
                  <p className={styles.statName}>{stat.name}</p>
                  <p className={`${styles.statValue} ${stat.trend === 'up' ? styles.statUp : styles.statDown}`}>
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