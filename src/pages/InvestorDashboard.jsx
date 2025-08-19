import React, { useState, useEffect, useMemo } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { 
  TrendingUp, 
  Euro, 
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Settings,
  Camera,
  X,
  Lock
} from 'lucide-react'
import ModernPerformanceChart from '../components/ModernPerformanceChart'
import PasswordResetModal from '../components/PasswordResetModal'

const InvestorDashboard = () => {
  const { isInvestor, getCurrentInvestorId } = useAuth()
  const { 
    investors, 
    calculateInvestorPerformance,
    updateInvestor
  } = useData()

  const [showSettings, setShowSettings] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [settingsData, setSettingsData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)

  const currentInvestorId = getCurrentInvestorId()
  
  // Debug logging
  console.log('InvestorDashboard Debug:', {
    currentInvestorId,
    investorsCount: investors.length,
    investors: investors.map(inv => ({ id: inv.id, name: inv.name, type: typeof inv.id }))
  })
  
  // Find investor by matching ID (handle both string and number types)
  const investor = investors.find(inv => {
    const invId = inv.id?.toString()
    const currentId = currentInvestorId?.toString()
    return invId === currentId
  })
  
  console.log('Found investor:', investor)
  
  const performance = calculateInvestorPerformance(currentInvestorId)

  if (!isInvestor() || !investor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatPercentage = (percentage) => {
    return `${percentage.toFixed(2)}%`
  }

  const getPerformanceColor = (percentage) => {
    return percentage >= 0 ? 'text-success-600' : 'text-danger-600'
  }

  const getPerformanceIcon = (percentage) => {
    return percentage >= 0 ? (
      <ArrowUpRight className="h-5 w-5 text-success-600" />
    ) : (
      <ArrowDownRight className="h-5 w-5 text-danger-600" />
    )
  }

  // Initialize settings data when investor is found
  useEffect(() => {
    if (investor) {
      setSettingsData({
        name: investor.name || '',
        email: investor.email || '',
        phone: investor.phone || '',
        profilePicture: investor.profilePicture || ''
      })
    }
  }, [investor])



  const handleOpenSettings = () => {
    setShowSettings(true)
  }

  const handleCloseSettings = () => {
    setShowSettings(false)
  }

  const handleSettingsChange = (field, value) => {
    setSettingsData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!investor) return

    setIsUpdating(true)
    try {
      await updateInvestor(investor.id, settingsData)
      setShowSettings(false)
      // Show success message (you could add a toast notification here)
      console.log('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      // Show error message (you could add a toast notification here)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleProfilePictureChange = (e) => {
    try {
      const file = e.target.files[0]
      if (file) {
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size too large. Please select an image smaller than 5MB.')
          return
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          alert('Please select a valid image file.')
          return
        }
        
        const reader = new FileReader()
        reader.onload = (e) => {
          setSettingsData(prev => ({
            ...prev,
            profilePicture: e.target.result
          }))
        }
        reader.onerror = () => {
          alert('Error reading file. Please try again.')
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error('Error handling profile picture change:', error)
      alert('Error uploading image. Please try again.')
    }
  }

  // Prepare chart data for this investor with memoization
  const prepareChartData = useMemo(() => {
    if (!investor.performance || investor.performance.length === 0) return []
    
    let runningAmount = investor.investmentAmount
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    
    // Sort performance entries by year and month in chronological order
    const sortedPerformance = [...investor.performance].sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year
      }
      return a.month - b.month
    })
    
    return sortedPerformance.map(entry => {
      runningAmount += (entry.growthAmount || 0) + (entry.deposit || 0) - (entry.withdrawal || 0)
      return {
        date: `${months[entry.month - 1]} ${entry.year}`,
        balance: runningAmount,
        growth: entry.growthAmount || 0,
        growthPercentage: entry.growthPercentage || 0,
        deposit: entry.deposit || 0,
        withdrawal: entry.withdrawal || 0
      }
    })
  }, [investor.performance, investor.investmentAmount])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200 flex-shrink-0">
            {investor.profilePicture ? (
              <img
                src={investor.profilePicture}
                alt={`${investor.name}'s profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {investor.name}</h1>
            <p className="text-gray-600">Your investment performance overview</p>
          </div>
        </div>
        <button
          onClick={handleOpenSettings}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings className="h-6 w-6" />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Euro className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Initial Investment</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(investor.investmentAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Growth</p>
              <p className="text-2xl font-bold text-gray-900">
                {performance ? formatCurrency(performance.totalGrowthAmount) : formatCurrency(0)}
              </p>
              {performance && (
                <div className="flex items-center mt-1">
                  {getPerformanceIcon(performance.totalNetPercentage)}
                  <span className={`text-sm font-medium ml-1 ${getPerformanceColor(performance.totalNetPercentage)}`}>
                    {formatPercentage(performance.totalNetPercentage)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Deposits</p>
              <p className="text-2xl font-bold text-gray-900">
                {performance ? formatCurrency(performance.totalDeposits) : formatCurrency(0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-danger-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Withdrawals</p>
              <p className="text-2xl font-bold text-gray-900">
                {performance ? formatCurrency(performance.totalWithdrawals) : formatCurrency(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      {performance && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Your Performance Summary</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Amount</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(performance.currentAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Net Profit</p>
              <p className={`text-xl font-bold ${getPerformanceColor(performance.totalNetPercentage)}`}>
                {formatCurrency(performance.totalGrowthAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Net Percentage</p>
              <p className={`text-xl font-bold ${getPerformanceColor(performance.totalNetPercentage)}`}>
                {formatPercentage(performance.totalNetPercentage)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Performance Entries</p>
              <p className="text-xl font-bold text-gray-900">
                {investor.performance.length}
              </p>
            </div>
          </div>
        </div>
      )}



      {/* Performance Chart */}
      <ModernPerformanceChart 
        data={prepareChartData}
        title="Your Performance Over Time"
        height={400}
      />

      {/* Recent Performance Entries */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Your Recent Performance Entries</h2>
        </div>
        {investor.performance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deposit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Withdrawal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...investor.performance]
                  .sort((a, b) => {
                    if (a.year !== b.year) {
                      return a.year - b.year
                    }
                    return a.month - b.month
                  })
                  .slice(-5)
                  .reverse()
                  .map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.year, entry.month - 1).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(entry.growthAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(entry.growthPercentage)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.deposit > 0 ? formatCurrency(entry.deposit) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.withdrawal > 0 ? formatCurrency(entry.withdrawal) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No performance entries yet.</p>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
              <button
                onClick={handleCloseSettings}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200">
                    {settingsData.profilePicture ? (
                      <img
                        src={settingsData.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Click the camera icon to upload a profile picture
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={settingsData.name}
                  onChange={(e) => handleSettingsChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settingsData.email}
                  onChange={(e) => handleSettingsChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settingsData.phone}
                  onChange={(e) => handleSettingsChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              {/* Password Reset */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Lock className="h-4 w-4" />
                  <span>Reset Password</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseSettings}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      <PasswordResetModal 
        isOpen={showPasswordReset} 
        onClose={() => setShowPasswordReset(false)} 
      />
    </div>
  )
}

export default InvestorDashboard
