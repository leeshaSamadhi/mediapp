import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from './Icon'

const Navbar: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { path: '/home', icon: 'home', label: 'Home' },
    { path: '/home/chats', icon: 'chat', label: 'Chats' },
    { path: '/home/profile', icon: 'profile', label: 'Profile' },
    { path: '/home/calendar', icon: 'calendar', label: 'Appointments' }
  ]

  const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors duration-200 ${
              isActive(item.path) 
                ? 'text-primary' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label={item.label}
            aria-current={isActive(item.path) ? 'page' : undefined}
          >
            <Icon 
              name={item.icon} 
              size="md" 
              active={isActive(item.path)}
            />
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default Navbar