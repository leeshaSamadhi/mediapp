import { ChatMessage } from '../models/types'
import useLocalStorage from './useLocalStorage'
import { sampleChatMessages } from '../data/seed'

interface ChatHook {
  messages: ChatMessage[]
  getMessagesForDoctor: (doctorId: string) => ChatMessage[]
  sendMessage: (doctorId: string, message: string) => void
  markAsRead: (doctorId: string) => void
  getUnreadCount: (doctorId: string) => number
  getLastMessage: (doctorId: string) => ChatMessage | null
}

export function useChat(currentUserId: string = 'user-1'): ChatHook {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(
    'MEDI_CHAT_MESSAGES',
    sampleChatMessages
  )

  const getMessagesForDoctor = (doctorId: string): ChatMessage[] => {
    return messages.filter(
      (msg) =>
        (msg.senderId === doctorId && msg.receiverId === currentUserId) ||
        (msg.senderId === currentUserId && msg.receiverId === doctorId)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const sendMessage = (doctorId: string, message: string): void => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      receiverId: doctorId,
      message,
      timestamp: new Date().toISOString(),
      isRead: true
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const markAsRead = (doctorId: string): void => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.senderId === doctorId && msg.receiverId === currentUserId && !msg.isRead) {
          return { ...msg, isRead: true }
        }
        return msg
      })
    )
  }

  const getUnreadCount = (doctorId: string): number => {
    return messages.filter(
      (msg) =>
        msg.senderId === doctorId &&
        msg.receiverId === currentUserId &&
        !msg.isRead
    ).length
  }

  const getLastMessage = (doctorId: string): ChatMessage | null => {
    const doctorMessages = getMessagesForDoctor(doctorId)
    return doctorMessages.length > 0 ? doctorMessages[doctorMessages.length - 1] : null
  }

  return {
    messages,
    getMessagesForDoctor,
    sendMessage,
    markAsRead,
    getUnreadCount,
    getLastMessage
  }
}

export default useChat