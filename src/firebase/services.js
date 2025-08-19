import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { db, auth } from './config'

// Collections
const COLLECTIONS = {
  INVESTMENT_DATA: 'investmentData',
  INVESTORS: 'investors',
  INVESTOR_PERFORMANCE: 'investorPerformance',
  CHAT_CONVERSATIONS: 'chatConversations',
  CHAT_MESSAGES: 'chatMessages',
  USERS: 'users',
  NEWS_SOURCES: 'newsSources',
  ADMINS: 'admins'
}

// Investment Data Services
export const investmentServices = {
  // Get investment data
  async getInvestmentData() {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.INVESTMENT_DATA))
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { id: doc.id, ...doc.data() }
      }
      return null
    } catch (error) {
      console.error('Error getting investment data:', error)
      throw error
    }
  },

  // Create or update investment data
  async saveInvestmentData(data) {
    try {
      const existingData = await this.getInvestmentData()
      if (existingData) {
        await updateDoc(doc(db, COLLECTIONS.INVESTMENT_DATA, existingData.id), {
          ...data,
          updatedAt: serverTimestamp()
        })
        return { id: existingData.id, ...data }
      } else {
        const docRef = await addDoc(collection(db, COLLECTIONS.INVESTMENT_DATA), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        return { id: docRef.id, ...data }
      }
    } catch (error) {
      console.error('Error saving investment data:', error)
      throw error
    }
  },

  // Add performance entry
  async addPerformanceEntry(entry) {
    try {
      let investmentData = await this.getInvestmentData()
      
      // Create investment data document if it doesn't exist
      if (!investmentData) {
        console.log('Creating new investment data document...')
        investmentData = await this.saveInvestmentData({
          startingBalance: 0,
          performance: []
        })
      }

      const performanceRef = collection(db, COLLECTIONS.INVESTMENT_DATA, investmentData.id, 'performance')
      const docRef = await addDoc(performanceRef, {
        ...entry,
        createdAt: serverTimestamp()
      })
      return { id: docRef.id, ...entry }
    } catch (error) {
      console.error('Error adding performance entry:', error)
      throw error
    }
  },

  // Update performance entry
  async updatePerformanceEntry(entryId, entry) {
    try {
      let investmentData = await this.getInvestmentData()
      
      // Create investment data document if it doesn't exist
      if (!investmentData) {
        console.log('Creating new investment data document for update...')
        investmentData = await this.saveInvestmentData({
          startingBalance: 0,
          performance: []
        })
      }

      await updateDoc(doc(db, COLLECTIONS.INVESTMENT_DATA, investmentData.id, 'performance', entryId), {
        ...entry,
        updatedAt: serverTimestamp()
      })
      return { id: entryId, ...entry }
    } catch (error) {
      console.error('Error updating performance entry:', error)
      throw error
    }
  },

  // Delete performance entry
  async deletePerformanceEntry(entryId) {
    try {
      let investmentData = await this.getInvestmentData()
      
      // Create investment data document if it doesn't exist
      if (!investmentData) {
        console.log('Creating new investment data document for delete...')
        investmentData = await this.saveInvestmentData({
          startingBalance: 0,
          performance: []
        })
      }

      await deleteDoc(doc(db, COLLECTIONS.INVESTMENT_DATA, investmentData.id, 'performance', entryId))
    } catch (error) {
      console.error('Error deleting performance entry:', error)
      throw error
    }
  },

  // Listen to investment data changes
  onInvestmentDataChange(callback) {
    const q = query(collection(db, COLLECTIONS.INVESTMENT_DATA))
    return onSnapshot(q, async (querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const investmentData = { id: doc.id, ...doc.data() }
        
        // Load performance data for this investment
        try {
          const performanceRef = collection(db, COLLECTIONS.INVESTMENT_DATA, doc.id, 'performance')
          const performanceSnapshot = await getDocs(performanceRef)
          const performance = performanceSnapshot.docs.map(perfDoc => ({ id: perfDoc.id, ...perfDoc.data() }))
          
          callback({
            ...investmentData,
            performance: performance
          })
        } catch (error) {
          console.error('Error loading performance data:', error)
          callback({
            ...investmentData,
            performance: []
          })
        }
      } else {
        callback(null)
      }
    })
  }
}

// Investor Services
export const investorServices = {
  // Get all investors
  async getInvestors() {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.INVESTORS))
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Error getting investors:', error)
      throw error
    }
  },

  // Get investor by ID
  async getInvestor(id) {
    try {
      const docRef = doc(db, COLLECTIONS.INVESTORS, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Error getting investor:', error)
      throw error
    }
  },

  // Add investor
  async addInvestor(investorData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.INVESTORS), {
        ...investorData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return { id: docRef.id, ...investorData }
    } catch (error) {
      console.error('Error adding investor:', error)
      throw error
    }
  },

  // Update investor
  async updateInvestor(id, investorData) {
    try {
      await updateDoc(doc(db, COLLECTIONS.INVESTORS, id), {
        ...investorData,
        updatedAt: serverTimestamp()
      })
      return { id, ...investorData }
    } catch (error) {
      console.error('Error updating investor:', error)
      throw error
    }
  },

  // Delete investor
  async deleteInvestor(id) {
    try {
      // Delete all performance data for this investor
      try {
        const performanceRef = collection(db, COLLECTIONS.INVESTORS, id, 'performance')
        const performanceSnapshot = await getDocs(performanceRef)
        const deletePerformancePromises = performanceSnapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePerformancePromises)
      } catch (performanceError) {
        console.log('No performance data to delete for investor:', id)
      }

      // Delete chat conversations for this investor
      try {
        const conversationsRef = collection(db, COLLECTIONS.CHAT_CONVERSATIONS)
        const conversationsQuery = query(conversationsRef, where('investorId', '==', id))
        const conversationsSnapshot = await getDocs(conversationsQuery)
        
        for (const conversationDoc of conversationsSnapshot.docs) {
          // Delete all messages for this conversation
          const messagesRef = collection(db, COLLECTIONS.CHAT_MESSAGES)
          const messagesQuery = query(messagesRef, where('conversationId', '==', conversationDoc.id))
          const messagesSnapshot = await getDocs(messagesQuery)
          
          const deleteMessagesPromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref))
          await Promise.all(deleteMessagesPromises)
          
          // Delete the conversation
          await deleteDoc(conversationDoc.ref)
        }
      } catch (chatError) {
        console.log('No chat data to delete for investor:', id)
      }

      // Delete the investor document
      await deleteDoc(doc(db, COLLECTIONS.INVESTORS, id))
      
      console.log('Investor and all related data deleted successfully')
    } catch (error) {
      console.error('Error deleting investor:', error)
      throw error
    }
  },

  // Add investor performance
  async addInvestorPerformance(investorId, performanceData) {
    try {
      const performanceRef = collection(db, COLLECTIONS.INVESTORS, investorId, 'performance')
      const docRef = await addDoc(performanceRef, {
        ...performanceData,
        createdAt: serverTimestamp()
      })
      return { id: docRef.id, ...performanceData }
    } catch (error) {
      console.error('Error adding investor performance:', error)
      throw error
    }
  },

  // Get investor performance
  async getInvestorPerformance(investorId) {
    try {
      const performanceRef = collection(db, COLLECTIONS.INVESTORS, investorId, 'performance')
      const querySnapshot = await getDocs(performanceRef)
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Error getting investor performance:', error)
      throw error
    }
  },

  // Update investor performance entry
  async updateInvestorPerformance(investorId, entryId, updates) {
    try {
      const performanceRef = doc(db, COLLECTIONS.INVESTORS, investorId, 'performance', entryId)
      await updateDoc(performanceRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return { id: entryId, ...updates }
    } catch (error) {
      console.error('Error updating investor performance entry:', error)
      throw error
    }
  },

  // Delete investor performance entry
  async deleteInvestorPerformance(investorId, entryId) {
    try {
      const performanceRef = doc(db, COLLECTIONS.INVESTORS, investorId, 'performance', entryId)
      await deleteDoc(performanceRef)
    } catch (error) {
      console.error('Error deleting investor performance entry:', error)
      throw error
    }
  },

  // Listen to investors changes
  onInvestorsChange(callback) {
    const q = query(collection(db, COLLECTIONS.INVESTORS))
    return onSnapshot(q, (querySnapshot) => {
      const investors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      // Sort locally to avoid composite index requirement
      const sortedInvestors = investors.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return timeB - timeA // Descending order
      })
      callback(sortedInvestors)
    })
  }
}

// Chat Services
export const chatServices = {
  // Get conversations
  async getConversations() {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.CHAT_CONVERSATIONS))
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Error getting conversations:', error)
      throw error
    }
  },

  // Create conversation
  async createConversation(conversationData) {
    try {
      let docRef
      if (conversationData.id) {
        // Create with specific ID
        docRef = doc(db, COLLECTIONS.CHAT_CONVERSATIONS, conversationData.id)
        await setDoc(docRef, {
          ...conversationData,
          createdAt: serverTimestamp(),
          lastMessageAt: serverTimestamp(),
          isActive: true
        })
      } else {
        // Create with auto-generated ID
        docRef = await addDoc(collection(db, COLLECTIONS.CHAT_CONVERSATIONS), {
          ...conversationData,
          createdAt: serverTimestamp(),
          lastMessageAt: serverTimestamp()
        })
      }
      return { id: docRef.id, ...conversationData }
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  },

  // Get messages for conversation
  async getMessages(conversationId) {
    try {
      const messagesRef = collection(db, COLLECTIONS.CHAT_MESSAGES)
      const q = query(
        messagesRef, 
        where('conversationId', '==', conversationId)
      )
      const querySnapshot = await getDocs(q)
      const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      // Sort messages by timestamp locally to avoid composite index requirement
      return messages.sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0)
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0)
        return timeA - timeB
      })
    } catch (error) {
      console.error('Error getting messages:', error)
      throw error
    }
  },

  // Send message
  async sendMessage(messageData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.CHAT_MESSAGES), {
        ...messageData,
        timestamp: serverTimestamp()
      })
      return { id: docRef.id, ...messageData }
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  },

  // Update conversation last message
  async updateConversationLastMessage(conversationId) {
    try {
      const conversationRef = doc(db, COLLECTIONS.CHAT_CONVERSATIONS, conversationId)
      await updateDoc(conversationRef, {
        lastMessageAt: serverTimestamp()
      })
    } catch (error) {
      // If conversation doesn't exist, create it
      if (error.code === 'not-found') {
        console.log('Conversation not found, creating new one...')
        await this.createConversation({
          id: conversationId,
          createdAt: serverTimestamp(),
          lastMessageAt: serverTimestamp(),
          isActive: true
        })
      } else {
        console.error('Error updating conversation:', error)
        throw error
      }
    }
  },

  // Listen to conversations
  onConversationsChange(callback) {
    const q = query(collection(db, COLLECTIONS.CHAT_CONVERSATIONS))
    return onSnapshot(q, (querySnapshot) => {
      const conversations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      // Sort conversations by lastMessageAt locally to avoid index requirement
      const sortedConversations = conversations.sort((a, b) => {
        const timeA = a.lastMessageAt?.toDate ? a.lastMessageAt.toDate() : new Date(a.lastMessageAt || 0)
        const timeB = b.lastMessageAt?.toDate ? b.lastMessageAt.toDate() : new Date(b.lastMessageAt || 0)
        return timeB - timeA // Descending order
      })
      callback(sortedConversations)
    })
  },

  // Listen to messages for a conversation
  onMessagesChange(conversationId, callback) {
    const messagesRef = collection(db, COLLECTIONS.CHAT_MESSAGES)
    const q = query(
      messagesRef, 
      where('conversationId', '==', conversationId)
    )
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      // Sort messages by timestamp locally to avoid composite index requirement
      const sortedMessages = messages.sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0)
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0)
        return timeA - timeB
      })
      callback(sortedMessages)
    })
  },

  // Listen to all messages
  onAllMessagesChange(callback) {
    const messagesRef = collection(db, COLLECTIONS.CHAT_MESSAGES)
    return onSnapshot(messagesRef, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      // Sort messages by timestamp locally to avoid composite index requirement
      const sortedMessages = messages.sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0)
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0)
        return timeA - timeB
      })
      callback(sortedMessages)
    })
  },

  // Delete conversation and all its messages
  async deleteConversation(conversationId) {
    try {
      // Delete all messages for this conversation
      const messagesRef = collection(db, COLLECTIONS.CHAT_MESSAGES)
      const messagesQuery = query(messagesRef, where('conversationId', '==', conversationId))
      const messagesSnapshot = await getDocs(messagesQuery)
      
      // Delete each message
      const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      
      // Delete the conversation document
      await deleteDoc(doc(db, COLLECTIONS.CHAT_CONVERSATIONS, conversationId))
      
      console.log('Conversation and messages deleted successfully')
    } catch (error) {
      console.error('Error deleting conversation:', error)
      throw error
    }
  }
}

// Authentication Services
export const authServices = {
  // Sign in
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  },

  // Sign up
  async signUp(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  },

  // Sign out
  async signOut() {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback)
  }
}

// Migration helper to move data from localStorage to Firebase
export const migrationServices = {
  async migrateFromLocalStorage() {
    try {
      const batch = writeBatch(db)
      
      // Migrate investment data
      const localInvestmentData = localStorage.getItem('investmentData')
      if (localInvestmentData) {
        const data = JSON.parse(localInvestmentData)
        const docRef = doc(collection(db, COLLECTIONS.INVESTMENT_DATA))
        batch.set(docRef, { ...data, createdAt: serverTimestamp() })
      }

      // Migrate investors
      const localInvestors = localStorage.getItem('investors')
      if (localInvestors) {
        const investors = JSON.parse(localInvestors)
        for (const investor of investors) {
          const docRef = doc(collection(db, COLLECTIONS.INVESTORS))
          batch.set(docRef, { ...investor, createdAt: serverTimestamp() })
        }
      }

      // Migrate chat data
      const localConversations = localStorage.getItem('chat_conversations')
      const localMessages = localStorage.getItem('chat_messages')
      
      if (localConversations) {
        const conversations = JSON.parse(localConversations)
        for (const conversation of conversations) {
          const docRef = doc(collection(db, COLLECTIONS.CHAT_CONVERSATIONS))
          batch.set(docRef, { ...conversation, createdAt: serverTimestamp() })
        }
      }

      if (localMessages) {
        const messages = JSON.parse(localMessages)
        for (const message of messages) {
          const docRef = doc(collection(db, COLLECTIONS.CHAT_MESSAGES))
          batch.set(docRef, { ...message, timestamp: serverTimestamp() })
        }
      }

      await batch.commit()
      console.log('Migration completed successfully')
    } catch (error) {
      console.error('Error during migration:', error)
      throw error
    }
  }
}

// News Sources Services
export const newsSourcesServices = {
  // Get all news sources
  async getNewsSources() {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.NEWS_SOURCES))
      if (!querySnapshot.empty) {
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }
      return []
    } catch (error) {
      console.error('Error getting news sources:', error)
      throw error
    }
  },

  // Save news sources (initialize with defaults if empty)
  async saveNewsSources(sources) {
    try {
      const batch = writeBatch(db)
      
      // Clear existing sources
      const existingSources = await this.getNewsSources()
      for (const source of existingSources) {
        const docRef = doc(db, COLLECTIONS.NEWS_SOURCES, source.id)
        batch.delete(docRef)
      }
      
      // Add new sources
      for (const source of sources) {
        const docRef = doc(collection(db, COLLECTIONS.NEWS_SOURCES))
        batch.set(docRef, {
          ...source,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
      
      await batch.commit()
      return sources
    } catch (error) {
      console.error('Error saving news sources:', error)
      throw error
    }
  },

  // Add a new news source
  async addNewsSource(sourceData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.NEWS_SOURCES), {
        ...sourceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return { id: docRef.id, ...sourceData }
    } catch (error) {
      console.error('Error adding news source:', error)
      throw error
    }
  },

  // Update a single news source
  async updateNewsSource(id, updates) {
    try {
      const docRef = doc(db, COLLECTIONS.NEWS_SOURCES, id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return { id, ...updates }
    } catch (error) {
      console.error('Error updating news source:', error)
      throw error
    }
  },

  // Delete a single news source
  async deleteNewsSource(id) {
    try {
      const docRef = doc(db, COLLECTIONS.NEWS_SOURCES, id)
      await deleteDoc(docRef)
      return { id }
    } catch (error) {
      console.error('Error deleting news source:', error)
      throw error
    }
  },

  // Clear all news sources
  async clearAllNewsSources() {
    try {
      console.log('Starting clear operation...')
      
      // Get all documents in the collection
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.NEWS_SOURCES))
      console.log('Total documents found:', querySnapshot.size)
      
      if (querySnapshot.empty) {
        console.log('No documents to delete')
        return true
      }
      
      // Delete in batches of 500 (Firestore limit)
      const batch = writeBatch(db)
      let deleteCount = 0
      
      querySnapshot.docs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref)
        deleteCount++
        console.log('Marked for deletion:', docSnapshot.id, docSnapshot.data().name)
      })
      
      await batch.commit()
      console.log(`Batch commit completed. Deleted ${deleteCount} documents.`)
      
      // Verify deletion
      const remainingSnapshot = await getDocs(collection(db, COLLECTIONS.NEWS_SOURCES))
      console.log('Remaining documents after deletion:', remainingSnapshot.size)
      
      return true
    } catch (error) {
      console.error('Error clearing news sources:', error)
      throw error
    }
  },

  // Listen to news sources changes
  onNewsSourcesChange(callback) {
    const q = query(collection(db, COLLECTIONS.NEWS_SOURCES))
    return onSnapshot(q, (querySnapshot) => {
      const sources = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(sources)
    })
  },

  // Update admin password
  async updateAdminPassword(currentPassword, newPassword) {
    try {
      console.log('COLLECTIONS.ADMINS:', COLLECTIONS.ADMINS)
      
      // First verify current password
      const adminDoc = await getDocs(collection(db, 'admins'))
      if (adminDoc.empty) {
        throw new Error('No admin account found')
      }
      
      const admin = adminDoc.docs[0]
      const adminData = admin.data()
      
      // In a real app, you'd hash and compare passwords
      // For now, we'll use simple comparison
      if (adminData.password !== currentPassword) {
        throw new Error('Current password is incorrect')
      }
      
      // Update password
      await updateDoc(doc(db, 'admins', admin.id), {
        password: newPassword,
        updatedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error updating admin password:', error)
      throw error
    }
  }
}
