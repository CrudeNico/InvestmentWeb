import React from 'react'
import { MessageCircle } from 'lucide-react'

const ChatNotification = ({ message, type = 'info', onClose }) => {
  const getNotificationStyles = () => {
    switch (type) {
      case 'typing':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'message':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className={`fixed bottom-4 right-4 p-4 border rounded-lg shadow-lg ${getNotificationStyles()} z-50`}>
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm font-medium">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

export default ChatNotification


