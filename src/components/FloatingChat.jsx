import React, { useState, useEffect } from 'react'
import { MessageCircle, X, Send, User, Mail } from 'lucide-react'
import { addDoc, collection, serverTimestamp, onSnapshot, query, orderBy, doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: ''
  })
  const [showUserForm, setShowUserForm] = useState(true)
  const [conversationId, setConversationId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Create conversation when user form is submitted
  const createLiveChatConversation = async (userInfo) => {
    try {
      const conversationId = `live-chat-${Date.now()}`
      
      // Create the conversation document in chatConversations collection
      await setDoc(doc(db, 'chatConversations', conversationId), {
        id: conversationId,
        investorId: userInfo.email, // Use email as investorId for live chats
        investorName: userInfo.name,
        isLiveChat: true,
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        isActive: true,
        userInfo: userInfo
      })

      // Create initial message from user in chatMessages collection
      await addDoc(collection(db, 'chatMessages'), {
        conversationId: conversationId,
        content: `New live chat started by ${userInfo.name} (${userInfo.email})`,
        senderId: userInfo.email,
        senderName: userInfo.name,
        senderType: 'user',
        timestamp: serverTimestamp(),
        isRead: false,
        userInfo: userInfo
      })

      // Send automatic welcome message from admin
      setTimeout(async () => {
        await addDoc(collection(db, 'chatMessages'), {
          conversationId: conversationId,
          content: `Hello ${userInfo.name}! Thank you for reaching out to Opessocius. An advisor will be with you shortly to assist you with your investment inquiries. In the meantime, feel free to ask any questions you may have.`,
          senderId: 'admin',
          senderName: 'Admin',
          senderType: 'admin',
          timestamp: serverTimestamp(),
          isRead: false
        })
        
        // Update conversation's lastMessageAt
        await setDoc(doc(db, 'chatConversations', conversationId), {
          lastMessageAt: serverTimestamp()
        }, { merge: true })
      }, 1000) // Small delay to make it feel more natural

      return conversationId
    } catch (error) {
      console.error('Error creating live chat conversation:', error)
      throw error
    }
  }

  // Listen to messages
  useEffect(() => {
    if (!conversationId) return

    const q = query(
      collection(db, 'chatMessages'),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = []
      snapshot.forEach((doc) => {
        const message = { id: doc.id, ...doc.data() }
        // Only show messages for this conversation
        if (message.conversationId === conversationId) {
          messageList.push(message)
        }
      })
      setMessages(messageList)
    })

    return () => unsubscribe()
  }, [conversationId])

  const handleUserFormSubmit = async (e) => {
    e.preventDefault()
    if (userInfo.name && userInfo.email) {
      setIsLoading(true)
      
      try {
        const newConversationId = await createLiveChatConversation(userInfo)
        setConversationId(newConversationId)
        setShowUserForm(false)
      } catch (error) {
        console.error('Error starting chat:', error)
        alert('Failed to start chat. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId) return

    const messageData = {
      conversationId: conversationId,
      content: newMessage,
      senderId: userInfo.email,
      senderName: userInfo.name,
      senderType: 'user',
      timestamp: serverTimestamp(),
      isRead: false,
      userInfo: userInfo
    }

    try {
      await addDoc(collection(db, 'chatMessages'), messageData)
      
      // Update conversation's lastMessageAt
      await setDoc(doc(db, 'chatConversations', conversationId), {
        lastMessageAt: serverTimestamp()
      }, { merge: true })
      
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-8 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-slate-800 to-slate-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white hover:scale-110 border border-slate-600"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-8 right-6 z-50">
      {/* Chat Window */}
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-12' : 'w-80 h-96'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-2xl p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">Live Chat</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* User Form */}
            {showUserForm ? (
              <div className="p-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Start a Conversation</h3>
                  <p className="text-sm text-gray-600">Please provide your details to begin chatting</p>
                </div>
                <form onSubmit={handleUserFormSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-slate-800 to-slate-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-slate-700 hover:to-slate-600 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
                  >
                    {isLoading ? 'Starting Chat...' : 'Start Chat'}
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 p-4 h-64 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message, index) => (
                        <div
                          key={message.id || index}
                          className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              message.senderType === 'user'
                                ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderType === 'user' ? 'text-slate-200' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 px-3 py-2 rounded-lg">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-2 rounded-lg hover:from-slate-700 hover:to-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default FloatingChat
