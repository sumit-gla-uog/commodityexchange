import { Text } from '@salt-ds/core'
import { NotificationIcon, UserIcon } from '@salt-ds/icons'

interface HeaderProps {
  title: string
}

const user = JSON.parse(localStorage.getItem('user') || '{}')

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/'
}

export const Header = ({ title }: HeaderProps) => {
  return (
  <header className="app-header">
    {/* Page Title */}
  <Text styleAs="h3" className="text-white font-semibold">
    {title}
  </Text>

  {/* Right side */}
  <div className="header-right">
    <button className="icon-button">
      <NotificationIcon size={1} />
    </button>
    <div className="header-right">
      <span style={{ color: '#9ca3af', fontSize: '13px' }}>{user.sme_name}</span>
      <button
        onClick={handleLogout}
        style={{
          backgroundColor: 'transparent',
          border: '1px solid #374151',
          color: '#9ca3af',
          borderRadius: '6px',
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: '13px'
        }}
      >
        Logout
      </button>
    </div>
  </div>
</header>
  )
}
