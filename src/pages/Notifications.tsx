import React, { useEffect } from 'react'
import Card from '../components/ui/Card'
import Icon from '../components/ui/Icon'
import Navbar from '../components/ui/Navbar'
import useNotifications from '../hooks/useNotifications'
import { sampleNotifications } from '../data/seed'

const Notifications: React.FC = () => {
  const { notifications, markAsRead } = useNotifications()

  useEffect(() => {
    const storedNotifications = localStorage.getItem('MEDI_NOTIFICATIONS')
    if (!storedNotifications) {
      localStorage.setItem('MEDI_NOTIFICATIONS', JSON.stringify(sampleNotifications))
    }
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'scheduled_appointment':
      case 'appointment': return 'calendar'
      case 'scheduled_changes': return 'edit'
      case 'reminder': return 'bell'
      case 'medical_notes':
      case 'medical_history_update': return 'info'
      default: return 'bell'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h1>

        {notifications.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Icon name="bell" size="lg" className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No notifications</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`cursor-pointer ${!notification.read ? 'border-l-4 border-primary' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${!notification.read ? 'bg-primary-light' : 'bg-gray-100'}`}>
                    <Icon 
                      name={getNotificationIcon(notification.type)} 
                      size="md" 
                      className={!notification.read ? 'text-primary' : 'text-gray-500'}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  )
}

export default Notifications