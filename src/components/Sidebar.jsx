import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  LogOut, 
  Menu,
  X,
  MessageCircle,
  Check,
  Newspaper,
  Home,
  Calendar
} from 'lucide-react'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation()
  const { logout, getUserRole, isInvestor } = useAuth()
  const { getUnreadCount, getConversations } = useChat()

  const navigation = [
    { name: isInvestor() ? 'My Dashboard' : 'Dashboard', href: '/dashboard', icon: BarChart3 },
    ...(isInvestor() ? [] : [
      { name: 'Investment Performance', href: '/performance', icon: TrendingUp },
      { name: 'Investors', href: '/investors', icon: Users },
      { name: 'Consultations', href: '/consultations', icon: Calendar }
    ]),
    { name: 'Market News', href: '/market-news', icon: Newspaper },
    { 
      name: 'Chat', 
      href: '/chat', 
      icon: MessageCircle,
      badge: getConversations().reduce((total, conv) => total + getUnreadCount(conv.id), 0) > 0
    },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                      <h1 className="text-xl font-bold text-gray-900">Opessocius</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive(item.href)
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon 
                    size={20} 
                    className={`
                      mr-3 flex-shrink-0
                      ${isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}
                    `} 
                  />
                  <span className="flex-1">{item.name}</span>
                          {item.badge && (
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
        )}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="mb-2 px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded">
            {getUserRole() === 'admin' ? 'Admin Mode' : 
             getUserRole() === 'investor' ? 'Investor Mode' : 'Viewer Mode'}
          </div>
          <div className="space-y-2">
            <Link
              to="/"
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
            >
              <Home size={20} className="mr-3 text-gray-400" />
              Return to Main Page
            </Link>
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
            >
              <LogOut size={20} className="mr-3 text-gray-400" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-md bg-white shadow-lg text-gray-600 hover:text-gray-900"
        >
          <Menu size={20} />
        </button>
      </div>
    </>
  )
}

export default Sidebar
