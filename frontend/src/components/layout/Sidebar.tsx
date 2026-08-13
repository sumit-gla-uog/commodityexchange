import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  DashboardIcon, SwapIcon, ChatIcon,
  ChartScatterIcon, DocumentIcon, MenuIcon
} from '@salt-ds/icons'

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
    <aside style={{
      width: collapsed ? '64px' : '240px',
      minHeight: '100vh',
      backgroundColor: '#1F4E79',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      flexShrink: 0
    }}>
      {/* Logo + Toggle */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid #1e4a75',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between'
      }}>
        {!collapsed && (
          <div>
            <h1 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>CommodEx</h1>
            <p style={{ color: '#93c5fd', fontSize: '11px', margin: '2px 0 0 0' }}>Commodity Exchange</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: '#93c5fd',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <MenuIcon />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '10px' : '10px 12px',
                borderRadius: '8px',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#1F4E79' : '#bfdbfe',
                cursor: 'pointer',
                justifyContent: collapsed ? 'center' : 'flex-start',
                transition: 'background-color 0.2s'
              }}>
                {item.icon}
                {!collapsed && (
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{ padding: '16px', borderTop: '1px solid #1e4a75' }}>
          <p style={{ color: '#93c5fd', fontSize: '11px', margin: 0 }}>MSc Dissertation 2025-26</p>
          <p style={{ color: '#93c5fd', fontSize: '11px', margin: '2px 0 0 0' }}>University of Glasgow</p>
        </div>
      )}
    </aside>
  )
}