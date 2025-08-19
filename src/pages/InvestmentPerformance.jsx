import React, { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp,
  Euro,
  Percent,
  Calendar
} from 'lucide-react'

const InvestmentPerformance = () => {
  const { isViewer } = useAuth()
  const { 
    investmentData, 
    updateStartingBalance, 
    addPerformanceEntry, 
    updatePerformanceEntry, 
    deletePerformanceEntry,
    calculateTotalPerformance 
  } = useData()

  const [showStartingBalanceForm, setShowStartingBalanceForm] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [formData, setFormData] = useState({
    startingBalance: investmentData.startingBalance,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    growthAmount: '',
    growthPercentage: '',
    deposit: '',
    withdrawal: ''
  })

  const totalPerformance = calculateTotalPerformance()

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.growthAmount || !formData.growthPercentage) {
      alert('Please fill in all required fields (Growth Amount and Growth Percentage)')
      return
    }
    
    // Validate numeric values
    if (isNaN(parseFloat(formData.growthAmount)) || isNaN(parseFloat(formData.growthPercentage))) {
      alert('Please enter valid numeric values for Growth Amount and Growth Percentage')
      return
    }
    
    // Validate year and month
    if (!formData.year || !formData.month) {
      alert('Please select a valid year and month')
      return
    }
    
    setIsLoading(true)
    
    try {
      if (editingEntry) {
        const updateData = {
          year: parseInt(formData.year),
          month: parseInt(formData.month),
          growthAmount: parseFloat(formData.growthAmount),
          growthPercentage: parseFloat(formData.growthPercentage),
          deposit: parseFloat(formData.deposit) || 0,
          withdrawal: parseFloat(formData.withdrawal) || 0
        }
        console.log('Updating performance entry with data:', updateData)
        await updatePerformanceEntry(editingEntry.id, updateData)
        setEditingEntry(null)
      } else {
        console.log('Adding performance entry with data:', formData)
        await addPerformanceEntry(formData)
      }
      
      setFormData({
        startingBalance: investmentData.startingBalance,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        growthAmount: '',
        growthPercentage: '',
        deposit: '',
        withdrawal: ''
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error saving performance entry:', error)
      alert('Failed to save performance entry. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    setFormData({
      startingBalance: investmentData.startingBalance,
      year: entry.year,
      month: entry.month,
      growthAmount: entry.growthAmount.toString(),
      growthPercentage: entry.growthPercentage.toString(),
      deposit: (entry.deposit || 0).toString(),
      withdrawal: (entry.withdrawal || 0).toString()
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this performance entry?')) {
      setDeletingId(id)
      try {
        await deletePerformanceEntry(id)
      } catch (error) {
        console.error('Error deleting performance entry:', error)
        alert('Failed to delete performance entry. Please try again.')
      } finally {
        setDeletingId(null)
      }
    }
  }

  const handleStartingBalanceSubmit = async (e) => {
    e.preventDefault()
    setIsUpdatingBalance(true)
    
    try {
      await updateStartingBalance(parseFloat(formData.startingBalance))
      setShowStartingBalanceForm(false)
    } catch (error) {
      console.error('Error updating starting balance:', error)
      alert('Failed to update starting balance. Please try again.')
    } finally {
      setIsUpdatingBalance(false)
    }
  }



  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Performance</h1>
          <p className="text-gray-600">Track and manage your investment growth over time</p>
        </div>
        {!isViewer() && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </button>
        )}
      </div>

      {/* Starting Balance Section */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Euro className="h-6 w-6 text-primary-600 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Starting Balance</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(investmentData.startingBalance)}
              </p>
            </div>
          </div>
          {!isViewer() && (
            <button
              onClick={() => setShowStartingBalanceForm(!showStartingBalanceForm)}
              className="btn-secondary text-xs px-2 py-1"
            >
              {showStartingBalanceForm ? 'Cancel' : 'Edit'}
            </button>
          )}
        </div>
        
        {showStartingBalanceForm && (
          <form onSubmit={handleStartingBalanceSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Starting Balance (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.startingBalance}
                onChange={(e) => setFormData({...formData, startingBalance: e.target.value})}
                className="input-field mt-1"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button 
                type="submit" 
                className="btn-success text-sm px-3 py-1 flex items-center"
                disabled={isUpdatingBalance}
              >
                {isUpdatingBalance ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
              <button 
                type="button" 
                onClick={() => setShowStartingBalanceForm(false)}
                className="btn-secondary text-sm px-3 py-1"
                disabled={isUpdatingBalance}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Performance Summary */}
      {totalPerformance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="card">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-success-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Growth</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalPerformance.totalGrowthAmount)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-success-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Deposits</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalPerformance.totalDeposits)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-danger-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Withdrawals</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalPerformance.totalWithdrawals)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <Percent className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Net %</p>
                <p className={`text-xl font-bold ${getPerformanceColor(totalPerformance.totalNetPercentage)}`}>
                  {formatPercentage(totalPerformance.totalNetPercentage)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-warning-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Avg. Return</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatPercentage(totalPerformance.averageGrowthPercentage)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <Euro className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalPerformance.currentBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingEntry ? 'Edit Performance Entry' : 'Add Performance Entry'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  className="input-field mt-1"
                  min="2000"
                  max="2100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Month</label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({...formData, month: e.target.value})}
                  className="input-field mt-1"
                  required
                >
                  {months.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Growth Amount (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.growthAmount}
                  onChange={(e) => setFormData({...formData, growthAmount: e.target.value})}
                  className="input-field mt-1"
                  placeholder="Enter growth amount"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Growth Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.growthPercentage}
                  onChange={(e) => setFormData({...formData, growthPercentage: e.target.value})}
                  className="input-field mt-1"
                  placeholder="Enter growth percentage"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deposit (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.deposit}
                  onChange={(e) => setFormData({...formData, deposit: e.target.value})}
                  className="input-field mt-1"
                  placeholder="Enter deposit amount (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Withdrawal (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.withdrawal}
                  onChange={(e) => setFormData({...formData, withdrawal: e.target.value})}
                  className="input-field mt-1"
                  placeholder="Enter withdrawal amount (optional)"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                type="submit" 
                className="btn-success flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingEntry ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingEntry ? 'Update Entry' : 'Add Entry'
                )}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddForm(false)
                  setEditingEntry(null)
                }}
                className="btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Performance Entries Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Performance Entries</h2>
        </div>
        
        {investmentData.performance.length > 0 ? (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {investmentData.performance.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {months[entry.month - 1]} {entry.year}
                      </div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!isViewer() && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-danger-600 hover:text-danger-900"
                            disabled={deletingId === entry.id}
                          >
                            {deletingId === entry.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No performance entries yet. Add your first entry to start tracking your investment growth.
          </p>
        )}
      </div>
    </div>
  )
}

export default InvestmentPerformance
