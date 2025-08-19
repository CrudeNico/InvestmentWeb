import React, { createContext, useContext, useState, useEffect } from 'react'
import { investmentServices, investorServices, chatServices } from '../firebase/services'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

// Collections constant (copied from services.js)
const COLLECTIONS = {
  INVESTMENT_DATA: 'investmentData',
  INVESTORS: 'investors',
  INVESTOR_PERFORMANCE: 'investorPerformance',
  CHAT_CONVERSATIONS: 'chatConversations',
  CHAT_MESSAGES: 'chatMessages',
  USERS: 'users'
}

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [investmentData, setInvestmentData] = useState({
    startingBalance: 0,
    performance: []
  })
  
  const [investors, setInvestors] = useState([])

  // Load data from Firebase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load investment data
        const investmentDataFromFirebase = await investmentServices.getInvestmentData()
        if (investmentDataFromFirebase) {
          // Load performance data for the main investment
          try {
            const performanceRef = collection(db, COLLECTIONS.INVESTMENT_DATA, investmentDataFromFirebase.id, 'performance')
            const performanceSnapshot = await getDocs(performanceRef)
            const performance = performanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            
            setInvestmentData({
              ...investmentDataFromFirebase,
              performance: performance
            })
          } catch (error) {
            console.error('Error loading investment performance data:', error)
            setInvestmentData({
              ...investmentDataFromFirebase,
              performance: []
            })
          }
        }
        
        // Load investors
        const investorsFromFirebase = await investorServices.getInvestors()
        
        // Load performance data for each investor
        const investorsWithPerformance = await Promise.all(
          investorsFromFirebase.map(async (investor) => {
            try {
              const performance = await investorServices.getInvestorPerformance(investor.id)
              return {
                ...investor,
                performance: performance || []
              }
            } catch (error) {
              console.error(`Error loading performance for investor ${investor.id}:`, error)
              return {
                ...investor,
                performance: []
              }
            }
          })
        )
        
        setInvestors(investorsWithPerformance)
        
        // Sync with localStorage as backup
        try {
          localStorage.setItem('investors', JSON.stringify(investorsWithPerformance))
        } catch (localError) {
          console.log('Failed to sync investors to localStorage:', localError)
        }
      } catch (error) {
        console.error('Error loading data from Firebase:', error)
        // Fallback to localStorage if Firebase fails
        const savedInvestmentData = localStorage.getItem('investmentData')
        const savedInvestors = localStorage.getItem('investors')
        
        if (savedInvestmentData) {
          setInvestmentData(JSON.parse(savedInvestmentData))
        }
        
        if (savedInvestors) {
          setInvestors(JSON.parse(savedInvestors))
        }
      }
    }
    
    loadData()
  }, [])

  // Set up real-time listeners for Firebase data
  useEffect(() => {
    const unsubscribeInvestment = investmentServices.onInvestmentDataChange((data) => {
      if (data) {
        // Sort performance entries by date when loading from Firebase
        const sortedData = {
          ...data,
          performance: data.performance ? data.performance.sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year
            return a.month - b.month
          }) : []
        }
        setInvestmentData(sortedData)
      }
    })

    const unsubscribeInvestors = investorServices.onInvestorsChange(async (data) => {
      // Remove duplicates by ID before processing
      const uniqueInvestors = data.filter((investor, index, self) => 
        index === self.findIndex(i => i.id === investor.id)
      )
      
      // Load performance data for each investor when investors change
      const investorsWithPerformance = await Promise.all(
        uniqueInvestors.map(async (investor) => {
          try {
            const performance = await investorServices.getInvestorPerformance(investor.id)
            // Sort performance entries by date for each investor
            const sortedPerformance = performance ? performance.sort((a, b) => {
              if (a.year !== b.year) return a.year - b.year
              return a.month - b.month
            }) : []
            return {
              ...investor,
              performance: sortedPerformance
            }
          } catch (error) {
            console.error(`Error loading performance for investor ${investor.id}:`, error)
            return {
              ...investor,
              performance: []
            }
          }
        })
      )
      setInvestors(investorsWithPerformance)
    })

    return () => {
      unsubscribeInvestment()
      unsubscribeInvestors()
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('investmentData', JSON.stringify(investmentData))
    } catch (error) {
      console.error('Error saving investment data to localStorage:', error)
    }
  }, [investmentData])

  useEffect(() => {
    try {
      localStorage.setItem('investors', JSON.stringify(investors))
    } catch (error) {
      console.error('Error saving investors to localStorage:', error)
    }
  }, [investors])

  // Investment Performance Functions
  const updateStartingBalance = async (balance) => {
    try {
      const updatedData = {
        ...investmentData,
        startingBalance: parseFloat(balance)
      }
      await investmentServices.saveInvestmentData(updatedData)
      setInvestmentData(updatedData)
    } catch (error) {
      console.error('Error updating starting balance:', error)
      // Fallback to local state
      setInvestmentData(prev => ({
        ...prev,
        startingBalance: parseFloat(balance)
      }))
    }
  }

  const addPerformanceEntry = async (entry) => {
    try {
      const newEntry = {
        year: parseInt(entry.year),
        month: parseInt(entry.month),
        growthAmount: parseFloat(entry.growthAmount),
        growthPercentage: parseFloat(entry.growthPercentage),
        deposit: parseFloat(entry.deposit || 0),
        withdrawal: parseFloat(entry.withdrawal || 0),
        date: new Date().toISOString()
      }
      
      const savedEntry = await investmentServices.addPerformanceEntry(newEntry)
      
      setInvestmentData(prev => ({
        ...prev,
        performance: [...prev.performance, savedEntry].sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return a.month - b.month
        })
      }))
    } catch (error) {
      console.error('Error adding performance entry:', error)
      // Fallback to local state
      const newEntry = {
        id: Date.now(),
        year: parseInt(entry.year),
        month: parseInt(entry.month),
        growthAmount: parseFloat(entry.growthAmount),
        growthPercentage: parseFloat(entry.growthPercentage),
        deposit: parseFloat(entry.deposit || 0),
        withdrawal: parseFloat(entry.withdrawal || 0),
        date: new Date().toISOString()
      }
      
      setInvestmentData(prev => ({
        ...prev,
        performance: [...prev.performance, newEntry].sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return a.month - b.month
        })
      }))
    }
  }

  const updatePerformanceEntry = async (id, updates) => {
    try {
      await investmentServices.updatePerformanceEntry(id, updates)
      setInvestmentData(prev => ({
        ...prev,
        performance: prev.performance.map(entry => 
          entry.id === id ? { ...entry, ...updates } : entry
        ).sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return a.month - b.month
        })
      }))
    } catch (error) {
      console.error('Error updating performance entry:', error)
      // Fallback to local state
      setInvestmentData(prev => ({
        ...prev,
        performance: prev.performance.map(entry => 
          entry.id === id ? { ...entry, ...updates } : entry
        ).sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return a.month - b.month
        })
      }))
    }
  }

  const deletePerformanceEntry = async (id) => {
    try {
      await investmentServices.deletePerformanceEntry(id)
      setInvestmentData(prev => ({
        ...prev,
        performance: prev.performance.filter(entry => entry.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting performance entry:', error)
      // Fallback to local state
      setInvestmentData(prev => ({
        ...prev,
        performance: prev.performance.filter(entry => entry.id !== id)
      }))
    }
  }

  const updateInvestorPerformance = async (investorId, entryId, updates) => {
    try {
      await investorServices.updateInvestorPerformance(investorId, entryId, updates)
      setInvestors(prev => 
        prev.map(investor => 
          investor.id === investorId 
            ? {
                ...investor,
                performance: investor.performance.map(entry => 
                  entry.id === entryId ? { ...entry, ...updates } : entry
                ).sort((a, b) => {
                  if (a.year !== b.year) return a.year - b.year
                  return a.month - b.month
                })
              }
            : investor
        )
      )
    } catch (error) {
      console.error('Error updating investor performance entry:', error)
      // Fallback to local state
      setInvestors(prev => 
        prev.map(investor => 
          investor.id === investorId 
            ? {
                ...investor,
                performance: investor.performance.map(entry => 
                  entry.id === entryId ? { ...entry, ...updates } : entry
                ).sort((a, b) => {
                  if (a.year !== b.year) return a.year - b.year
                  return a.month - b.month
                })
              }
            : investor
        )
      )
    }
  }

  const deleteInvestorPerformance = async (investorId, entryId) => {
    try {
      await investorServices.deleteInvestorPerformance(investorId, entryId)
      setInvestors(prev => 
        prev.map(investor => 
          investor.id === investorId 
            ? {
                ...investor,
                performance: investor.performance.filter(entry => entry.id !== entryId)
              }
            : investor
        )
      )
    } catch (error) {
      console.error('Error deleting investor performance entry:', error)
      // Fallback to local state
      setInvestors(prev => 
        prev.map(investor => 
          investor.id === investorId 
            ? {
                ...investor,
                performance: investor.performance.filter(entry => entry.id !== entryId)
              }
            : investor
        )
      )
    }
  }

  // Investor Management Functions
  const addInvestor = async (investor) => {
    try {
      const newInvestor = {
        name: investor.name,
        email: investor.email,
        phone: investor.phone,
        investmentAmount: parseFloat(investor.investmentAmount),
        initiationDate: investor.initiationDate,
        username: investor.username || `${investor.name.toLowerCase().replace(/\s+/g, '')}${Date.now()}`,
        password: investor.password || `investor${Date.now()}`,
        performance: [],
        dateAdded: new Date().toISOString()
      }
      
      const savedInvestor = await investorServices.addInvestor(newInvestor)
      
      // Automatically create a chat conversation for the new investor
      try {
        const conversationData = {
          id: savedInvestor.id, // Use investor ID as conversation ID to ensure uniqueness
          investorId: savedInvestor.id,
          investorName: savedInvestor.name,
          adminId: 'admin',
          adminName: 'Admin',
          lastMessage: 'Welcome! Your investment account has been created.',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        }
        
        await chatServices.createConversation(conversationData)
        
        // Add a welcome message to the conversation
        try {
          const welcomeMessage = {
            conversationId: savedInvestor.id,
            senderId: 'admin',
            senderName: 'Admin',
            content: `Welcome ${savedInvestor.name}! Your investment account has been successfully created. You can now track your investment performance and communicate with us through this chat.`,
            timestamp: new Date().toISOString()
          }
          
          await chatServices.sendMessage(welcomeMessage)
          console.log('Welcome message sent to new investor:', savedInvestor.name)
        } catch (messageError) {
          console.error('Error sending welcome message:', messageError)
        }
        
        console.log('Chat conversation created for new investor:', savedInvestor.name)
      } catch (chatError) {
        console.error('Error creating chat conversation:', chatError)
        // Don't fail the investor creation if chat creation fails
      }
      
      // Don't manually add to state - let the real-time listener handle it
      // This prevents duplication
    } catch (error) {
      console.error('Error adding investor:', error)
      // Fallback to local state
      const newInvestor = {
        id: Date.now(),
        name: investor.name,
        email: investor.email,
        phone: investor.phone,
        investmentAmount: parseFloat(investor.investmentAmount),
        initiationDate: investor.initiationDate,
        username: investor.username || `${investor.name.toLowerCase().replace(/\s+/g, '')}${Date.now()}`,
        password: investor.password || `investor${Date.now()}`,
        performance: [],
        dateAdded: new Date().toISOString()
      }
      
      setInvestors(prev => [...prev, newInvestor])
      
      // Try to create chat conversation even in fallback mode
      try {
        const conversationData = {
          id: newInvestor.id, // Use investor ID as conversation ID to ensure uniqueness
          investorId: newInvestor.id,
          investorName: newInvestor.name,
          adminId: 'admin',
          adminName: 'Admin',
          lastMessage: 'Welcome! Your investment account has been created.',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        }
        
        await chatServices.createConversation(conversationData)
        
        // Add a welcome message to the conversation
        try {
          const welcomeMessage = {
            conversationId: newInvestor.id,
            senderId: 'admin',
            senderName: 'Admin',
            content: `Welcome ${newInvestor.name}! Your investment account has been successfully created. You can now track your investment performance and communicate with us through this chat.`,
            timestamp: new Date().toISOString()
          }
          
          await chatServices.sendMessage(welcomeMessage)
          console.log('Welcome message sent to new investor (fallback):', newInvestor.name)
        } catch (messageError) {
          console.error('Error sending welcome message (fallback):', messageError)
        }
        
        console.log('Chat conversation created for new investor (fallback):', newInvestor.name)
      } catch (chatError) {
        console.error('Error creating chat conversation (fallback):', chatError)
      }
    }
  }

  const updateInvestor = async (id, updates) => {
    console.log('DataContext: updateInvestor called with:', { id, updates })
    
    try {
      const updatedData = {
        ...updates,
        investmentAmount: parseFloat(updates.investmentAmount || 0)
      }
      
      console.log('DataContext: Updated data to save:', updatedData)
      
      // Try Firebase update
      await investorServices.updateInvestor(id, updatedData)
      
      // Update local state
      setInvestors(prev => 
        prev.map(investor => 
          investor.id === id ? { 
            ...investor, 
            ...updates,
            investmentAmount: parseFloat(updates.investmentAmount || investor.investmentAmount)
          } : investor
        )
      )
      
      // Also save to localStorage as backup
      try {
        const currentInvestors = JSON.parse(localStorage.getItem('investors') || '[]')
        const updatedInvestors = currentInvestors.map(investor => 
          investor.id === id ? { 
            ...investor, 
            ...updates,
            investmentAmount: parseFloat(updates.investmentAmount || investor.investmentAmount)
          } : investor
        )
        localStorage.setItem('investors', JSON.stringify(updatedInvestors))
      } catch (localError) {
        console.log('LocalStorage backup failed:', localError)
      }
      
    } catch (error) {
      console.error('Error updating investor:', error)
      console.log('Falling back to local state only')
      
      // Fallback to local state
      setInvestors(prev => 
        prev.map(investor => 
          investor.id === id ? { 
            ...investor, 
            ...updates,
            investmentAmount: parseFloat(updates.investmentAmount || investor.investmentAmount)
          } : investor
        )
      )
      
      // Save to localStorage as backup
      try {
        const currentInvestors = JSON.parse(localStorage.getItem('investors') || '[]')
        const updatedInvestors = currentInvestors.map(investor => 
          investor.id === id ? { 
            ...investor, 
            ...updates,
            investmentAmount: parseFloat(updates.investmentAmount || investor.investmentAmount)
          } : investor
        )
        localStorage.setItem('investors', JSON.stringify(updatedInvestors))
      } catch (localError) {
        console.log('LocalStorage backup failed:', localError)
      }
    }
  }

  const deleteInvestor = async (id) => {
    try {
      // Delete the investor
      await investorServices.deleteInvestor(id)
      
      // Also delete the chat conversation for this investor
      try {
        await chatServices.deleteConversation(id)
        console.log('Chat conversation deleted for investor:', id)
      } catch (chatError) {
        console.error('Error deleting chat conversation:', chatError)
        // Don't fail the investor deletion if chat deletion fails
      }
      
      setInvestors(prev => prev.filter(investor => investor.id !== id))
    } catch (error) {
      console.error('Error deleting investor:', error)
      // Fallback to local state
      setInvestors(prev => prev.filter(investor => investor.id !== id))
      
      // Try to delete chat conversation even in fallback mode
      try {
        await chatServices.deleteConversation(id)
        console.log('Chat conversation deleted for investor (fallback):', id)
      } catch (chatError) {
        console.error('Error deleting chat conversation (fallback):', chatError)
      }
    }
  }

  const addInvestorPerformance = async (investorId, entry) => {
    try {
      const newEntry = {
        year: parseInt(entry.year),
        month: parseInt(entry.month),
        growthAmount: parseFloat(entry.growthAmount),
        growthPercentage: parseFloat(entry.growthPercentage),
        deposit: parseFloat(entry.deposit || 0),
        withdrawal: parseFloat(entry.withdrawal || 0),
        date: new Date().toISOString()
      }
      
      const savedEntry = await investorServices.addInvestorPerformance(investorId, newEntry)
      
      setInvestors(prev => 
        prev.map(investor => 
          investor.id === investorId 
            ? {
                ...investor,
                performance: [...investor.performance, savedEntry].sort((a, b) => {
                  if (a.year !== b.year) return a.year - b.year
                  return a.month - b.month
                })
              }
            : investor
        )
      )
    } catch (error) {
      console.error('Error adding investor performance entry:', error)
      // Fallback to local state
      const newEntry = {
        id: Date.now(),
        year: parseInt(entry.year),
        month: parseInt(entry.month),
        growthAmount: parseFloat(entry.growthAmount),
        growthPercentage: parseFloat(entry.growthPercentage),
        deposit: parseFloat(entry.deposit || 0),
        withdrawal: parseFloat(entry.withdrawal || 0),
        date: new Date().toISOString()
      }
      
      setInvestors(prev => 
        prev.map(investor => 
          investor.id === investorId 
            ? {
                ...investor,
                performance: [...investor.performance, newEntry].sort((a, b) => {
                  if (a.year !== b.year) return a.year - b.year
                  return a.month - b.month
                })
              }
            : investor
        )
      )
    }
  }

  // Calculation Functions
  const calculateTotalPerformance = () => {
    if (investmentData.performance.length === 0) return null
    
    const totalGrowthAmount = investmentData.performance.reduce((sum, entry) => 
      sum + (entry.growthAmount || 0), 0
    )
    
    const totalDeposits = investmentData.performance.reduce((sum, entry) => 
      sum + (entry.deposit || 0), 0
    )
    
    const totalWithdrawals = investmentData.performance.reduce((sum, entry) => 
      sum + (entry.withdrawal || 0), 0
    )
    
    const totalGrowthPercentage = investmentData.performance.reduce((sum, entry) => 
      sum + (entry.growthPercentage || 0), 0
    )
    
    const averageGrowthPercentage = totalGrowthPercentage / investmentData.performance.length
    
    const currentBalance = investmentData.startingBalance + totalGrowthAmount + totalDeposits - totalWithdrawals
    const totalNetPercentage = totalGrowthPercentage
    
    return {
      totalGrowthAmount,
      totalDeposits,
      totalWithdrawals,
      totalGrowthPercentage,
      averageGrowthPercentage,
      currentBalance,
      totalNetPercentage
    }
  }

  // Synchronous version for immediate calculations (uses cached data)
  const calculateInvestorPerformance = (investorId) => {
    // Find investor by matching ID (handle both string and number types)
    const investor = investors.find(inv => {
      const invId = inv.id?.toString()
      const currentId = investorId?.toString()
      return invId === currentId
    })
    if (!investor || !investor.performance || investor.performance.length === 0) return null
    
    const totalGrowthAmount = investor.performance.reduce((sum, entry) => 
      sum + (entry.growthAmount || 0), 0
    )
    
    const totalDeposits = investor.performance.reduce((sum, entry) => 
      sum + (entry.deposit || 0), 0
    )
    
    const totalWithdrawals = investor.performance.reduce((sum, entry) => 
      sum + (entry.withdrawal || 0), 0
    )
    
    const totalGrowthPercentage = investor.performance.reduce((sum, entry) => 
      sum + (entry.growthPercentage || 0), 0
    )
    
    const averageGrowthPercentage = totalGrowthPercentage / investor.performance.length
    
    const currentAmount = investor.investmentAmount + totalGrowthAmount + totalDeposits - totalWithdrawals
    const totalNetPercentage = totalGrowthPercentage
    
    return {
      totalGrowthAmount,
      totalDeposits,
      totalWithdrawals,
      totalGrowthPercentage,
      averageGrowthPercentage,
      currentAmount,
      totalNetPercentage
    }
  }

  // Async version for loading fresh data when needed
  const loadInvestorPerformance = async (investorId) => {
    // Find investor by matching ID (handle both string and number types)
    const investor = investors.find(inv => {
      const invId = inv.id?.toString()
      const currentId = investorId?.toString()
      return invId === currentId
    })
    if (!investor) return null

    // Load performance data if not already loaded
    let performance = investor.performance || []
    if (!performance || performance.length === 0) {
      try {
        performance = await investorServices.getInvestorPerformance(investor.id)
        // Update local state with loaded performance
        setInvestors(prev => 
          prev.map(inv => 
            inv.id === investor.id ? { ...inv, performance } : inv
          )
        )
      } catch (error) {
        console.error(`Error loading performance for investor ${investor.id}:`, error)
        return null
      }
    }
    
    return performance
  }

  // Test function to verify password update
  const testPasswordUpdate = async (investorId, newPassword) => {
    try {
      console.log('Testing password update for investor:', investorId)
      await updateInvestor(investorId, { password: newPassword })
      console.log('Password update test completed')
    } catch (error) {
      console.error('Password update test failed:', error)
    }
  }

  const value = {
    investmentData,
    investors,
    updateStartingBalance,
    addPerformanceEntry,
    updatePerformanceEntry,
    deletePerformanceEntry,
    addInvestor,
    updateInvestor,
    deleteInvestor,
    addInvestorPerformance,
    updateInvestorPerformance,
    deleteInvestorPerformance,
    calculateTotalPerformance,
    calculateInvestorPerformance,
    loadInvestorPerformance,
    testPasswordUpdate
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
