import React, { useState, useEffect, useRef } from 'react'
import { useChat } from '../contexts/ChatContext'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { 
  Send, 
  MessageCircle, 
  Users, 
  Clock, 
  Check,
  CheckCheck,
  MoreVertical,
  Search,
  Trash2,
  Plus,
  Minus,
  User
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

const Chat = () => {
  const { getUserRole, getCurrentInvestorId } = useAuth()
  const { investors } = useData()
  
  // Check if user is authenticated
  const userRole = getUserRole()
  if (!userRole) {
    return (
      <div className="flex h-full bg-gray-50 items-center justify-center">
        <div className="text-center text-gray-500">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p>Please log in to access the chat.</p>
        </div>
      </div>
    )
  }
      let chatContext
  try {
    chatContext = useChat()
  } catch (error) {
    console.error('Error loading chat context:', error)
    return (
      <div className="flex h-full bg-gray-50 items-center justify-center">
        <div className="text-center text-gray-500">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Chat Error</h3>
          <p>Unable to load chat functionality. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  const {
    conversations,
    currentConversation,
    messages,
    getConversations,
    getConversationMessages,
    createConversation,
    sendMessage,
    markMessagesAsRead,
    deleteConversation,
    getUnreadCount,
    getOrCreateInvestorConversation,
    setCurrentConversation
  } = chatContext

  // Debug logging
  console.log('Chat component rendered:', {
    userRole: getUserRole(),
    currentInvestorId: getCurrentInvestorId(),
    conversationsCount: conversations?.length || 0,
    messagesCount: messages?.length || 0,
    investorsCount: investors?.length || 0
  })

  const [messageInput, setMessageInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [isProcessingRequest, setIsProcessingRequest] = useState(false)
  const messagesEndRef = useRef(null)
  const currentInvestorId = getCurrentInvestorId()

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, selectedConversation])

  // Initialize conversation for investors
  useEffect(() => {
    if (userRole === 'investor') {
      const initializeConversation = async () => {
        const conversation = await getOrCreateInvestorConversation()
        if (conversation) {
          setSelectedConversation(conversation)
          setCurrentConversation(conversation)
        }
      }
      initializeConversation()
    }
  }, [userRole, currentInvestorId])

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      markMessagesAsRead(selectedConversation.id)
    }
  }, [selectedConversation])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedConversation) return

    const senderType = userRole === 'admin' ? 'admin' : 'investor'
    sendMessage(selectedConversation.id, messageInput.trim(), senderType)
    setMessageInput('')
  }

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation)
    setCurrentConversation(conversation)
  }

  const handleDeleteConversation = async (e, conversationId) => {
    e.stopPropagation() // Prevent conversation selection
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      const success = await deleteConversation(conversationId)
      if (success && selectedConversation?.id === conversationId) {
        // Clear selected conversation if it was the deleted one
        setSelectedConversation(null)
        setCurrentConversation(null)
      }
    }
  }

  const handleDepositRequest = async () => {
    if (!selectedConversation || isProcessingRequest) return
    
    setIsProcessingRequest(true)
    
    try {
      // Send investor's request message
      await sendMessage(selectedConversation.id, 'I would like to make a deposit request.', 'investor')
      
      // Send automatic admin response
      setTimeout(async () => {
        await sendMessage(
          selectedConversation.id, 
          'Thank you for your deposit request. Our support team will review and respond within 10 hours to process your deposit.',
          'admin'
        )
        setIsProcessingRequest(false)
      }, 1000) // Small delay to make it feel more natural
    } catch (error) {
      console.error('Error processing deposit request:', error)
      setIsProcessingRequest(false)
    }
  }

  const handleWithdrawalRequest = async () => {
    if (!selectedConversation || isProcessingRequest) return
    
    setIsProcessingRequest(true)
    
    try {
      // Send investor's request message
      await sendMessage(selectedConversation.id, 'I would like to make a withdrawal request.', 'investor')
      
      // Send automatic admin response
      setTimeout(async () => {
        await sendMessage(
          selectedConversation.id, 
          'Thank you for your withdrawal request. Our support team will review and respond within 10 hours to process your withdrawal.',
          'admin'
        )
        setIsProcessingRequest(false)
      }, 1000) // Small delay to make it feel more natural
    } catch (error) {
      console.error('Error processing withdrawal request:', error)
      setIsProcessingRequest(false)
    }
  }

  const getInvestorName = (investorId) => {
    // Handle live chat conversations
    if (investorId && investorId.includes('@')) {
      // This is a live chat conversation (email as investorId)
      return investorId
    }
    
    const investor = investors.find(inv => inv.id === investorId)
    return investor ? investor.name : 'Unknown Investor'
  }

  const filteredConversations = (getConversations() || []).filter(conv => {
    if (!searchTerm) return true
    const investorName = getInvestorName(conv.investorId)
    return investorName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const currentMessages = selectedConversation 
    ? (getConversationMessages(selectedConversation.id) || [])
    : []

  const formatMessageTime = (timestamp) => {
    try {
      if (!timestamp) return ''
      
      // Handle Firebase Timestamp objects
      let date
      if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
        date = timestamp.toDate()
      } else if (timestamp) {
        date = new Date(timestamp)
      } else {
        return ''
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return ''
      }
      
      const now = new Date()
      const diffInHours = (now - date) / (1000 * 60 * 60)
      
      if (diffInHours < 24) {
        return format(date, 'HH:mm')
      } else if (diffInHours < 48) {
        return 'Yesterday'
      } else {
        return format(date, 'MMM dd')
      }
    } catch (error) {
      console.error('Error formatting message time:', error, timestamp)
      return ''
    }
  }

  const formatLastMessageTime = (timestamp) => {
    try {
      if (!timestamp) return 'No messages'
      
      // Handle Firebase Timestamp objects
      let date
      if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
        date = timestamp.toDate()
      } else if (timestamp) {
        date = new Date(timestamp)
      } else {
        return 'No messages'
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'No messages'
      }
      
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp)
      return 'No messages'
    }
  }

  // Add loading state
  if (!conversations && !messages) {
    return (
      <div className="flex h-full bg-gray-50 items-center justify-center">
        <div className="text-center text-gray-500">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300 animate-pulse" />
          <h3 className="text-lg font-medium mb-2">Loading chat...</h3>
          <p>Please wait while we load your conversations</p>
        </div>
      </div>
    )
  }

  // Add error handling for missing context
  if (!getConversations || !getConversationMessages) {
    return (
      <div className="flex h-full bg-gray-50 items-center justify-center">
        <div className="text-center text-gray-500">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Chat Error</h3>
          <p>Unable to load chat functionality. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar - Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {userRole === 'admin' ? (
            // Admin view - show all conversations
            filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => {
                const unreadCount = getUnreadCount(conversation.id)
                const lastMessage = getConversationMessages(conversation.id).slice(-1)[0]
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-primary-50 border-primary-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                          {(() => {
                            // Handle live chat conversations
                            if (conversation.isLiveChat) {
                              return (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
                                  <MessageCircle className="h-5 w-5 text-white" />
                                </div>
                              )
                            }
                            
                            const investor = investors.find(inv => inv.id === conversation.investorId)
                            return investor?.profilePicture ? (
                              <img
                                src={investor.profilePicture}
                                alt={`${getInvestorName(conversation.investorId)}'s profile`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-400" />
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {conversation.isLiveChat ? 'Live Chat' : getInvestorName(conversation.investorId)}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatLastMessageTime(conversation.lastMessageAt)}
                            </span>
                            <button
                              onClick={(e) => handleDeleteConversation(e, conversation.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                              title="Delete conversation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {lastMessage ? lastMessage.content : 'No messages yet'}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <Check className="ml-2 h-4 w-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No conversations yet</p>
              </div>
            )
          ) : (
            // Investor view - show only their conversation
            selectedConversation && (
              <div
                onClick={() => handleConversationSelect(selectedConversation)}
                className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors bg-primary-50 border-primary-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        Opessocius Support Chat
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatLastMessageTime(selectedConversation.lastMessageAt)}
                        </span>
                        <button
                          onClick={(e) => handleDeleteConversation(e, selectedConversation.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                          title="Delete conversation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      Matthew
                    </p>
                  </div>
                  {getUnreadCount(selectedConversation.id) > 0 && (
                    <Check className="ml-2 h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-primary-600 flex items-center justify-center">
                    {userRole === 'admin' ? (
                      (() => {
                        const investor = investors.find(inv => inv.id === selectedConversation.investorId)
                        return investor?.profilePicture ? (
                          <img
                            src={investor.profilePicture}
                            alt={`${getInvestorName(selectedConversation.investorId)}'s profile`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="h-5 w-5 text-white" />
                        )
                      })()
                    ) : (
                      <img
                        src="/images/advisor-marcos.jpg"
                        alt="Matthew"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    )}
                    {userRole !== 'admin' && (
                      <div className="w-full h-full bg-primary-600 rounded-full flex items-center justify-center" style={{ display: 'none' }}>
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {userRole === 'admin' 
                        ? getInvestorName(selectedConversation.investorId)
                        : 'Opessocius Support Chat'
                      }
                    </h2>
                    <p className="text-sm text-gray-500 flex items-center">
                      {userRole === 'admin' ? 'Investor' : (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Matthew
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.length > 0 ? (
                currentMessages.map((message) => {
                  const isOwnMessage = 
                    (userRole === 'admin' && message.senderType === 'admin') ||
                    (userRole === 'investor' && message.senderType === 'investor')

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <div className="flex items-end space-x-2">
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs opacity-70">
                              {formatMessageTime(message.timestamp)}
                            </span>
                            {isOwnMessage && (
                              <CheckCheck className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Buttons - Only for Investors */}
            {userRole === 'investor' && (
              <div className="bg-gray-50 border-t border-gray-200 p-3">
                <div className="flex space-x-3">
                  <button
                    onClick={handleDepositRequest}
                    disabled={!selectedConversation || isProcessingRequest}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className={`h-4 w-4 ${isProcessingRequest ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium">
                      {isProcessingRequest ? 'Processing...' : 'Deposit'}
                    </span>
                  </button>
                  <button
                    onClick={handleWithdrawalRequest}
                    disabled={!selectedConversation || isProcessingRequest}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className={`h-4 w-4 ${isProcessingRequest ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium">
                      {isProcessingRequest ? 'Processing...' : 'Withdraw'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={!selectedConversation}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || !selectedConversation}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          // No conversation selected
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
