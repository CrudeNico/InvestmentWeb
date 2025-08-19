import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { chatServices } from '../firebase/services'

const ChatContext = createContext()

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const { getUserRole, getCurrentInvestorId } = useAuth()
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState({})

  // Load chat data from Firebase on mount
  useEffect(() => {
    const loadChatData = async () => {
      try {
        const conversationsFromFirebase = await chatServices.getConversations()
        setConversations(conversationsFromFirebase)
        
        // Load messages for each conversation
        const allMessages = []
        for (const conversation of conversationsFromFirebase) {
          const conversationMessages = await chatServices.getMessages(conversation.id)
          allMessages.push(...conversationMessages)
        }
        setMessages(allMessages)
      } catch (error) {
        console.error('Error loading chat data from Firebase:', error)
        // Fallback to localStorage
        const savedConversations = localStorage.getItem('chat_conversations')
        const savedMessages = localStorage.getItem('chat_messages')
        
        if (savedConversations) {
          setConversations(JSON.parse(savedConversations))
        }
        
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages))
        }
      }
    }
    
    loadChatData()
  }, [])

  // Set up real-time listeners for chat data
  useEffect(() => {
    const unsubscribeConversations = chatServices.onConversationsChange((data) => {
      console.log('Conversations updated:', data)
      setConversations(data)
    })

    // Set up messages listener for all conversations
    const unsubscribeMessages = chatServices.onAllMessagesChange((data) => {
      console.log('Messages updated:', data)
      setMessages(data)
    })

    return () => {
      if (unsubscribeConversations) unsubscribeConversations()
      if (unsubscribeMessages) unsubscribeMessages()
    }
  }, [])

  // Get conversations based on user role
  const getConversations = () => {
    const userRole = getUserRole()
    const currentInvestorId = getCurrentInvestorId()

    if (userRole === 'admin') {
      return conversations
    } else if (userRole === 'investor' && currentInvestorId) {
      // Handle ID matching for both string and number types
      return conversations.filter(conv => {
        const convInvestorId = conv.investorId?.toString()
        const currentId = currentInvestorId?.toString()
        return convInvestorId === currentId
      })
    }
    
    return []
  }

  // Get messages for current conversation
  const getConversationMessages = (conversationId) => {
    return messages.filter(msg => msg.conversationId === conversationId)
  }

  // Create a new conversation
  const createConversation = async (investorId, investorName) => {
    try {
      const newConversation = {
        id: Date.now().toString(),
        investorId,
        investorName,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        isActive: true
      }

      // Create in Firebase
      await chatServices.createConversation(newConversation)
      
      // Update local state
      setConversations(prev => [...prev, newConversation])
      return newConversation
    } catch (error) {
      console.error('Error creating conversation:', error)
      // Fallback to local only
      const newConversation = {
        id: Date.now().toString(),
        investorId,
        investorName,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        isActive: true
      }
      setConversations(prev => [...prev, newConversation])
      return newConversation
    }
  }

  // Send a message
  const sendMessage = async (conversationId, content, senderType = 'investor') => {
    try {
      console.log('Sending message:', { conversationId, content, senderType })
      
      const userRole = getUserRole()
      const currentInvestorId = getCurrentInvestorId()
      
      // Determine sender info
      let senderId, senderName
      if (userRole === 'admin') {
        senderId = 'admin'
        senderName = 'Admin'
      } else if (userRole === 'investor') {
        senderId = currentInvestorId
        // Handle ID matching for both string and number types
        senderName = conversations.find(c => {
          const convInvestorId = c.investorId?.toString()
          const currentId = currentInvestorId?.toString()
          return convInvestorId === currentId
        })?.investorName || 'Investor'
      }

      const messageData = {
        conversationId,
        content,
        senderId,
        senderName,
        senderType,
        isRead: false
      }

      console.log('Message data:', messageData)
      const newMessage = await chatServices.sendMessage(messageData)
      console.log('Message sent successfully:', newMessage)
      
      // Don't manually add to state - let the real-time listener handle it
      // This prevents duplication
      
      // Update conversation's last message time
      try {
        await chatServices.updateConversationLastMessage(conversationId)
      } catch (updateError) {
        console.log('Conversation update failed, but message was sent successfully')
      }

      return newMessage
    } catch (error) {
      console.error('Error sending message:', error)
      // Fallback to local state
      const userRole = getUserRole()
      const currentInvestorId = getCurrentInvestorId()
      
      let senderId, senderName
      if (userRole === 'admin') {
        senderId = 'admin'
        senderName = 'Admin'
      } else if (userRole === 'investor') {
        senderId = currentInvestorId
        // Handle ID matching for both string and number types
        senderName = conversations.find(c => {
          const convInvestorId = c.investorId?.toString()
          const currentId = currentInvestorId?.toString()
          return convInvestorId === currentId
        })?.investorName || 'Investor'
      }

      const newMessage = {
        id: Date.now().toString(),
        conversationId,
        content,
        senderId,
        senderName,
        senderType,
        timestamp: new Date().toISOString(),
        isRead: false
      }

      // Only add to local state in fallback case (when Firebase fails)
      setMessages(prev => [...prev, newMessage])

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, lastMessageAt: new Date().toISOString() }
            : conv
        )
      )

      return newMessage
    }
  }

  // Mark messages as read
  const markMessagesAsRead = (conversationId) => {
    const userRole = getUserRole()
    
    setMessages(prev => 
      prev.map(msg => {
        if (msg.conversationId === conversationId) {
          // Only mark messages from the OTHER person as read
          const shouldMarkAsRead = 
            (userRole === 'admin' && msg.senderType === 'investor') ||
            (userRole === 'investor' && msg.senderType === 'admin')
          
          return shouldMarkAsRead ? { ...msg, isRead: true } : msg
        }
        return msg
      })
    )
  }

  // Delete conversation and all its messages
  const deleteConversation = async (conversationId) => {
    try {
      console.log('Deleting conversation:', conversationId)
      
      // Delete from Firebase
      await chatServices.deleteConversation(conversationId)
      
      // Remove from local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      setMessages(prev => prev.filter(msg => msg.conversationId !== conversationId))
      
      console.log('Conversation deleted successfully')
      return true
    } catch (error) {
      console.error('Error deleting conversation:', error)
      // Fallback to local state only
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      setMessages(prev => prev.filter(msg => msg.conversationId !== conversationId))
      return false
    }
  }

  // Get unread message count
  const getUnreadCount = (conversationId) => {
    const userRole = getUserRole()
    const currentInvestorId = getCurrentInvestorId()
    
    const unreadMessages = messages.filter(msg => 
      msg.conversationId === conversationId && 
      !msg.isRead && 
      ((userRole === 'admin' && msg.senderType === 'investor') ||
       (userRole === 'investor' && msg.senderType === 'admin'))
    )
    
    return unreadMessages.length
  }

  // Get or create conversation for current investor
  const getOrCreateInvestorConversation = async () => {
    const userRole = getUserRole()
    const currentInvestorId = getCurrentInvestorId()
    
    if (userRole !== 'investor' || !currentInvestorId) {
      return null
    }

    // Handle ID matching for both string and number types
    let conversation = conversations.find(conv => {
      const convInvestorId = conv.investorId?.toString()
      const currentId = currentInvestorId?.toString()
      return convInvestorId === currentId
    })
    
    if (!conversation) {
      // Create new conversation for this investor
      conversation = await createConversation(currentInvestorId, 'Investor')
    }
    
    return conversation
  }

  // Set typing status
  const setTypingStatus = (conversationId, isTyping, userId) => {
    setTypingUsers(prev => ({
      ...prev,
      [conversationId]: isTyping ? userId : null
    }))
  }

  const value = {
    conversations,
    currentConversation,
    messages,
    isTyping,
    typingUsers,
    getConversations,
    getConversationMessages,
    createConversation,
    sendMessage,
    markMessagesAsRead,
    deleteConversation,
    getUnreadCount,
    getOrCreateInvestorConversation,
    setTypingStatus,
    setCurrentConversation
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}
