import { useState, useEffect, useCallback, useRef } from 'react'
import { Notification } from '../models/types'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const notificationsRef = useRef<Notification[]>([])

  useEffect(() => {
    const storedNotifications = localStorage.getItem('MEDI_NOTIFICATIONS')
    if (storedNotifications) {
      const parsed = JSON.parse(storedNotifications)
      setNotifications(parsed)
      notificationsRef.current = parsed
    }
  }, [])

  const saveNotifications = useCallback((newNotifications: Notification[]) => {
    setNotifications(newNotifications)
    notificationsRef.current = newNotifications
    localStorage.setItem('MEDI_NOTIFICATIONS', JSON.stringify(newNotifications))
  }, [])

  const addNotification = useCallback((
    title: string,
    message: string,
    type: Notification['type']
  ) => {
    const now = new Date()
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      read: false,
      type,
      date: now.toISOString().split('T')[0]
    }

    const updatedNotifications = [newNotification, ...notificationsRef.current]
    saveNotifications(updatedNotifications)
    return newNotification
  }, [saveNotifications])

  const markAsRead = useCallback((notifId: string) => {
    const updatedNotifications = notifications.map(notif =>
      notif.id === notifId ? { ...notif, read: true } : notif
    )
    saveNotifications(updatedNotifications)
  }, [notifications, saveNotifications])

  const markAllAsRead = useCallback(() => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }))
    saveNotifications(updatedNotifications)
  }, [notifications, saveNotifications])

  const clearNotifications = useCallback(() => {
    saveNotifications([])
  }, [saveNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount
  }
}

export default useNotifications