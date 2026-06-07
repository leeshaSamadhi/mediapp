import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import { Notification } from '../../models/types'

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'scheduled_appointment':
      case 'appointment':
        return 'calendar'
      case 'scheduled_changes':
        return 'edit'
      case 'medical_notes':
        return 'info'
      case 'medical_history_update':
        return 'check'
      default:
        return 'bell'
    }
  }

  const categorizeNotifications = (notifs: Notification[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const categories: { [key: string]: Notification[] } = {
      today: [],
      yesterday: [],
      earlier: []
    }

    notifs.forEach(notif => {
      const notifDate = new Date(notif.date)
      notifDate.setHours(0, 0, 0, 0)

      if (notifDate.getTime() === today.getTime()) {
        categories.today.push(notif)
      } else if (notifDate.getTime() === yesterday.getTime()) {
        categories.yesterday.push(notif)
      } else {
        categories.earlier.push(notif)
      }
    })

    return categories
  }

  const handleNotificationClick = (notif: Notification) => {
    setSelectedId(notif.id)
    if (!notif.read) {
      onMarkAsRead(notif.id)
    }
  }

  if (!isOpen) return null

  const categorized = categorizeNotifications(notifications)

  const renderNotificationItem = (notif: Notification) => {
    const isSelected = selectedId === notif.id
    return (
      <div
        key={notif.id}
        onClick={() => handleNotificationClick(notif)}
        className={`p-3 cursor-pointer transition-colors ${
          isSelected
            ? 'bg-[#4A8816] text-white'
            : !notif.read
            ? 'bg-green-50 hover:bg-green-100'
            : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full flex-shrink-0 ${
            isSelected
              ? 'bg-white/20'
              : !notif.read
              ? 'bg-primary-light'
              : 'bg-gray-100'
          }`}>
            <Icon
              name={getNotificationIcon(notif.type)}
              size="sm"
              className={isSelected ? 'text-white' : !notif.read ? 'text-primary' : 'text-gray-500'}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium truncate ${
              isSelected ? 'text-white' : !notif.read ? 'text-gray-800' : 'text-gray-600'
            }`}>
              {notif.title}
            </h4>
            <p className={`text-xs mt-1 line-clamp-2 ${
              isSelected ? 'text-white/90' : 'text-gray-500'
            }`}>
              {notif.message}
            </p>
            <p className={`text-xs mt-1 ${
              isSelected ? 'text-white/70' : 'text-gray-400'
            }`}>
              {notif.time}
            </p>
          </div>
          {!notif.read && !isSelected && (
            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Icon name="close" size="sm" className="text-gray-500" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="bell" size="lg" className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No notifications</p>
          </div>
        ) : (
          <>
            {/* Today */}
            {categorized.today.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Today</span>
                </div>
                {categorized.today.map(renderNotificationItem)}
              </div>
            )}

            {/* Yesterday */}
            {categorized.yesterday.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Yesterday</span>
                </div>
                {categorized.yesterday.map(renderNotificationItem)}
              </div>
            )}

            {/* Earlier */}
            {categorized.earlier.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Earlier</span>
                </div>
                {categorized.earlier.map(renderNotificationItem)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100">
          <Link
            to="/home/notifications"
            onClick={onClose}
            className="block text-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown