import { useState, useEffect, useCallback, useRef } from 'react'
import { Notification } from '../models/types'
import { notificationsApi } from '../services/api'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const notificationsRef = useRef<Notification[]>([])

  useEffect(() => {
    const loadNotifications = async () => {
      // Get current user
      const storedUser = localStorage.getItem('CURRENT_USER')
      const currentUser = storedUser ? JSON.parse(storedUser) : null
      const userId = currentUser?.id

      if (userId) {
        try {
          // Load notifications from backend API
          const backendNotifications = await notificationsApi.getNotifications(userId)
          // Transform backend notifications to frontend format
          const frontendNotifications = backendNotifications.map((notif) => ({
            id: notif.id,
            title: notif.title,
            message: notif.message,
            time: new Date(notif.created_at || new Date()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            read: notif.read,
            type: notif.type as Notification['type'],
            date: notif.date
          }))
          setNotifications(frontendNotifications)
          notificationsRef.current = frontendNotifications
        } catch (error) {
          console.error('Failed to load notifications from backend:', error)
        }
      } else {
        // No user ID, start with empty notifications
        setNotifications([])
        notificationsRef.current = []
      }
    }

    loadNotifications()
  }, [])

  const saveNotifications = useCallback((newNotifications: Notification[]) => {
    setNotifications(newNotifications)
    notificationsRef.current = newNotifications
  }, [])

  const addNotification = useCallback(async (
    title: string,
    message: string,
    type: Notification['type']
  ) => {
    const now = new Date()
    
    // Get current user
    const storedUser = localStorage.getItem('CURRENT_USER')
    const currentUser = storedUser ? JSON.parse(storedUser) : null
    const userId = currentUser?.id

    let notificationId = `notif-${Date.now()}`
    
    if (userId) {
      try {
        // Save to backend database
        const backendNotification = await notificationsApi.createNotification(userId, {
          title,
          message,
          type,
          date: now.toISOString().split('T')[0]
        })
        notificationId = backendNotification.id
      } catch (error) {
        console.error('Failed to save notification to backend:', error)
      }
    }

    const newNotification: Notification = {
      id: notificationId,
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

  const markAsRead = useCallback(async (notifId: string) => {
    // Update local state immediately for better UX
    const updatedNotifications = notifications.map(notif =>
      notif.id === notifId ? { ...notif, read: true } : notif
    )
    saveNotifications(updatedNotifications)

    // Persist to backend database
    try {
      await notificationsApi.markAsRead(notifId)
    } catch (error) {
      console.error('Failed to mark notification as read in backend:', error)
    }
  }, [notifications, saveNotifications])

  const markAllAsRead = useCallback(async () => {
    // Update local state immediately for better UX
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }))
    saveNotifications(updatedNotifications)

    // Persist to backend database
    const storedUser = localStorage.getItem('CURRENT_USER')
    const currentUser = storedUser ? JSON.parse(storedUser) : null
    const userId = currentUser?.id
    if (userId) {
      try {
        await notificationsApi.markAllAsRead(userId)
      } catch (error) {
        console.error('Failed to mark all notifications as read in backend:', error)
      }
    }
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