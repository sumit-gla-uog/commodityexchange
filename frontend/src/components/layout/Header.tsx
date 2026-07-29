import { Text } from '@salt-ds/core'
import { NotificationIcon, UserIcon } from '@salt-ds/icons'

interface HeaderProps {
  title: string
}

export const Header = ({ title }: HeaderProps) => {
  return (
    <header className="h-16 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-6">
      {/* Page Title */}
      <Text styleAs="h3" className="text-white font-semibold">
        {title}
      </Text>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white transition-colors">
          <NotificationIcon size={1} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2E7D32] flex items-center justify-center">
            <UserIcon size={1} className="text-white" />
          </div>
          <Text styleAs="label" className="text-gray-300">
            Sumit Kumar
          </Text>
        </div>
      </div>
    </header>
  )
}
