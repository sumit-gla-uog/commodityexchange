import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  DashboardIcon, SwapIcon, ChatIcon,
  ChartScatterIcon, DocumentIcon, MenuIcon
} from '@salt-ds/icons'
import styles from './SideBar.module.css'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/barter', label: 'Barter', icon: <SwapIcon /> },
  { path: '/evals', label: 'Evaluations', icon: <ChartScatterIcon /> },
  { path: '/orders', label: 'Orders', icon: <DocumentIcon /> },
  { path: '/chat', label: 'Expert Advice', icon: <ChatIcon /> },
]

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        {!collapsed && (
          <div className={styles.brandBlock}>
            <h1 className={styles.brandTitle}>CommodEx</h1>
            <p className={styles.brandSubtitle}>Commodity Exchange</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className={styles.toggleButton}>
          <MenuIcon />
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={styles.navLink}>
            {({ isActive }) => (
              <div className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>
                {item.icon}
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className={styles.footer}>
          <p className={styles.footerText}>MSc Dissertation 2025-26</p>
          <p className={styles.footerText}>University of Glasgow</p>
        </div>
      )}
    </aside>
  )
}