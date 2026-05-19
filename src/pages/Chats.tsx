import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Icon from '../components/ui/Icon'
import Navbar from '../components/ui/Navbar'
import { sampleDoctors, sampleUser } from '../data/seed'
import { useChat } from '../hooks/useChat'

const Chats: React.FC = () => {
  const navigate = useNavigate()
  const { getLastMessage, getUnreadCount } = useChat(sampleUser.id)

  // Create chat data from doctors with real message data
  const chats = sampleDoctors.map(doctor => {
    const lastMessage = getLastMessage(doctor.id)
    const unreadCount = getUnreadCount(doctor.id)
    
    return {
      id: doctor.id,
      doctor: doctor,
      lastMessage: lastMessage?.message || "No messages yet",
      time: lastMessage ? formatTimeAgo(lastMessage.timestamp) : "",
      unread: unreadCount
    }
  }).filter(chat => chat.unread > 0 || getLastMessage(chat.id) !== null)

  function formatTimeAgo(timestamp: string): string {
    const now = new Date()
    const messageDate = new Date(timestamp)
    const diffInMs = now.getTime() - messageDate.getTime()
    const diffInMinutes = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays}d ago`
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleChatClick = (doctorId: string) => {
    navigate(`/home/chats/${doctorId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Chats</h1>

        {chats.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Icon name="chat" size="lg" className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No conversations yet</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <Card 
                key={chat.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleChatClick(chat.id)}
              >
                <div className="flex items-center space-x-4">
                  <Avatar src={chat.doctor.photoUrl} name={chat.doctor.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 truncate">{chat.doctor.name}</h3>
                      <span className="text-xs text-gray-400">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="ml-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
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

export default Chats