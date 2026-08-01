import { NavigationItem } from '@salt-ds/core'
import {
  DashboardIcon,
  SwapIcon,
  ChatIcon,
  ChartScatterIcon,
  DocumentIcon,
} from '@salt-ds/icons'
import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/barter', label: 'Barter', icon: <SwapIcon /> },
  { path: '/evals', label: 'Evaluations', icon: <ChartScatterIcon /> },
  { path: '/orders', label: 'Orders', icon: <DocumentIcon /> },
  { path: '/chat', label: 'Chat', icon: <ChatIcon /> },
]

export const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-[#1F4E79] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-xl font-bold text-white">CommodEx</h1>
        <p className="text-xs text-blue-300 mt-1">Commodity Exchange Platform</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path}>
            {({ isActive }) => (
              <NavigationItem
                active={isActive}
                className="w-full"
              >
                {item.icon}
                {item.label}
              </NavigationItem>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-700">
        <p className="text-xs text-blue-300">MSc Dissertation 2025-26</p>
        <p className="text-xs text-blue-300">University of Glasgow</p>
      </div>
    </aside>
  )
}