import { Text } from '@salt-ds/core'
import { NotificationIcon, UserIcon } from '@salt-ds/icons'
import styles from './Header.module.css'

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
      <Text styleAs="h3" className="text-white font-semibold">
        {title}
      </Text>

      <div className="header-right">
        <button className="icon-button">
          <NotificationIcon size={1} />
        </button>
        <div className="header-right">
          <span style={{ color: '#9ca3af', fontSize: '13px' }}>{user.sme_name}</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}