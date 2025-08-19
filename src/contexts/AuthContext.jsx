import React, { createContext, useContext, useState, useEffect } from 'react'
import { authServices, investorServices } from '../firebase/services'
import { comparePassword } from '../utils/security'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  // Initialize authentication state from localStorage immediately
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authStatus = localStorage.getItem('isAuthenticated')
    return authStatus === 'true'
  })
  
  // Initialize user role state from localStorage
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'admin'
  })
  
  const [currentInvestorId, setCurrentInvestorId] = useState(() => {
    return localStorage.getItem('currentInvestorId')
  })
  
  const [isLoading, setIsLoading] = useState(false)

  // Sync state with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const authStatus = localStorage.getItem('isAuthenticated')
        const role = localStorage.getItem('userRole') || 'admin'
        const investorId = localStorage.getItem('currentInvestorId')
        
        setIsAuthenticated(authStatus === 'true')
        setUserRole(role)
        setCurrentInvestorId(investorId)
      } catch (error) {
        console.error('Error handling localStorage change:', error)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const getUserRole = () => {
    return userRole
  }

  const isViewer = () => {
    return userRole === 'viewer'
  }

  const isInvestor = () => {
    return userRole === 'investor'
  }

  const getCurrentInvestorId = () => {
    return currentInvestorId
  }

  const login = async (username, password) => {
    try {
      // Try Firebase authentication first
      if (username === 'admin' && password === 'CrudeNico') {
        setIsAuthenticated(true)
        setUserRole('admin')
        setCurrentInvestorId(null)
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userRole', 'admin')
        localStorage.removeItem('currentInvestorId')
        return { success: true, role: 'admin' }
      } else {
        // Check if it's an investor login - try localStorage first (since Firebase might be blocked), then Firebase
        let investor = null
        
        // Try localStorage first
        try {
          const localInvestors = JSON.parse(localStorage.getItem('investors') || '[]')
          investor = localInvestors.find(inv => inv.username === username)
          if (investor) {
            const isPasswordValid = await comparePassword(password, investor.password)
            if (!isPasswordValid) {
              investor = null
            }
          }
        } catch (localError) {
          console.log('LocalStorage check failed:', localError)
        }
        
        // If not found in localStorage, try Firebase
        if (!investor) {
          try {
            const investors = await investorServices.getInvestors()
            investor = investors.find(inv => inv.username === username)
            if (investor) {
              const isPasswordValid = await comparePassword(password, investor.password)
              if (!isPasswordValid) {
                investor = null
              }
            }
          } catch (firebaseError) {
            console.log('Firebase investor check failed:', firebaseError)
          }
        }
        
        if (investor) {
          setIsAuthenticated(true)
          setUserRole('investor')
          setCurrentInvestorId(investor.id.toString())
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('userRole', 'investor')
          localStorage.setItem('currentInvestorId', investor.id.toString())
          return { success: true, role: 'investor', investorId: investor.id }
        }
      }
      return { success: false, error: 'Invalid credentials' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUserRole('admin')
    setCurrentInvestorId(null)
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userRole')
    localStorage.removeItem('currentInvestorId')
  }

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getUserRole,
    isViewer,
    isInvestor,
    getCurrentInvestorId
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
