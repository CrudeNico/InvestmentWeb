import React, { useState, useEffect } from 'react'
import { Send, MessageCircle, X, User, Clock } from 'lucide-react'
import { chatServices } from '../firebase/services'

const LiveChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [showUserForm, setShowUserForm] = useState(true)
  const [conversationId, setConversationId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load messages for the conversation
  useEffect(() => {
    if (conversationId) {
      const loadMessages = async () => {
        try {
          const conversationMessages = await chatServices.getMessages(conversationId)
          setMessages(conversationMessages)
        } catch (error) {
          console.error('Error loading messages:', error)
        }
      }

      loadMessages()

      // Set up real-time listener for new messages
      const unsubscribe = chatServices.onMessagesChange(conversationId, (newMessages) => {
        setMessages(newMessages)
      })

      return () => {
        if (unsubscribe) unsubscribe()
      }
    }
  }, [conversationId])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !conversationId) return

    setIsLoading(true)

    try {
      // Send message to Firebase
      const messageData = {
        conversationId,
        content: newMessage,
        senderId: userInfo.email, // Use email as sender ID for live chat users
        senderName: userInfo.name,
        senderType: 'live_chat_user',
        isRead: false
      }

      await chatServices.sendMessage(messageData)
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      // Fallback: add message locally
      const userMessage = {
        id: Date.now(),
        content: newMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, userMessage])
      setNewMessage('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserInfoSubmit = async (e) => {
    e.preventDefault()
    if (userInfo.name && userInfo.email) {
      setIsLoading(true)
      
      try {
        // Create conversation in Firebase
        const conversationData = {
          id: `live_chat_${Date.now()}`,
          investorId: userInfo.email, // Use email as investor ID for live chat
          investorName: `${userInfo.name} (Live Chat)`,
          createdAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString(),
          isActive: true,
          isLiveChat: true // Flag to identify live chat conversations
        }

        await chatServices.createConversation(conversationData)
        setConversationId(conversationData.id)

        // Send welcome message
        const welcomeMessage = {
          conversationId: conversationData.id,
          content: "Hello! Welcome to Opessocius. How can I help you today?",
          senderId: 'admin',
          senderName: 'Admin',
          senderType: 'admin',
          isRead: false
        }

        await chatServices.sendMessage(welcomeMessage)
        
        setShowUserForm(false)
      } catch (error) {
        console.error('Error creating conversation:', error)
        // Fallback to local mode
        setShowUserForm(false)
        const userInfoMessage = {
          id: Date.now(),
          content: `New chat started by ${userInfo.name} (${userInfo.email})`,
          sender: 'system',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [userInfoMessage])
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Live Chat</h3>
              <p className="text-sm text-gray-500">Opessocius Support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info Form */}
        {showUserForm && (
          <div className="p-4 border-b border-gray-200">
            <form onSubmit={handleUserInfoSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Starting Chat...' : 'Start Chat'}
              </button>
            </form>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {messages.map((message) => {
            const isUser = message.senderType === 'live_chat_user' || message.senderId === userInfo.email
            const isAdmin = message.senderType === 'admin'
            const isSystem = message.senderType === 'system'
            
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isUser
                      ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                      : isSystem
                      ? 'bg-gray-100 text-gray-600 text-xs'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center mt-1 text-xs ${
                    isUser ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    <Clock className="h-3 w-3 mr-1" />
                    {message.timestamp?.toDate ? 
                      message.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                      new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  </div>
                </div>
              </div>
            )
          })}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">Admin is typing...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        {!showUserForm && (
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your message..."
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isLoading}
                                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveChat
