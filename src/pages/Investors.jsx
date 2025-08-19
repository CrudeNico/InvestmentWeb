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
  User,
  Mail,
  Phone,
  Calendar,
  Eye,
  Users
} from 'lucide-react'

const Investors = () => {
  const { isViewer, isInvestor } = useAuth()
  const { 
    investors, 
    addInvestor, 
    updateInvestor, 
    deleteInvestor,
    addInvestorPerformance,
    calculateInvestorPerformance 
  } = useData()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingInvestor, setEditingInvestor] = useState(null)
  const [selectedInvestor, setSelectedInvestor] = useState(null)
  const [showPerformanceForm, setShowPerformanceForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    investmentAmount: '',
    initiationDate: new Date().toISOString().split('T')[0],
    username: '',
    password: ''
  })
  const [performanceData, setPerformanceData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    growthAmount: '',
    growthPercentage: '',
    deposit: '',
    withdrawal: ''
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatPercentage = (percentage) => {
    if (percentage === undefined || percentage === null) return '0.00%'
    return `${percentage.toFixed(2)}%`
  }

  const getPerformanceColor = (percentage) => {
    return percentage >= 0 ? 'text-success-600' : 'text-danger-600'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.investmentAmount) {
      alert('Please fill in all required fields (Name, Email, and Investment Amount)')
      return
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address')
      return
    }
    
    // Validate investment amount
    if (isNaN(parseFloat(formData.investmentAmount)) || parseFloat(formData.investmentAmount) <= 0) {
      alert('Please enter a valid investment amount (greater than 0)')
      return
    }
    
    // Validate phone number (optional but if provided, should be valid)
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(formData.phone)) {
      alert('Please enter a valid phone number')
      return
    }
    
    if (editingInvestor) {
      console.log('Updating investor with data:', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        investmentAmount: parseFloat(formData.investmentAmount),
        initiationDate: formData.initiationDate,
        username: formData.username,
        password: formData.password
      })
      
      updateInvestor(editingInvestor.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        investmentAmount: parseFloat(formData.investmentAmount),
        initiationDate: formData.initiationDate,
        username: formData.username,
        password: formData.password
      })
      setEditingInvestor(null)
    } else {
      addInvestor(formData)
    }
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      investmentAmount: '',
      initiationDate: new Date().toISOString().split('T')[0],
      username: '',
      password: ''
    })
    setShowAddForm(false)
  }

  const handlePerformanceSubmit = (e) => {
    e.preventDefault()
    addInvestorPerformance(selectedInvestor.id, performanceData)
    setPerformanceData({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      growthAmount: '',
      growthPercentage: '',
      deposit: '',
      withdrawal: ''
    })
    setShowPerformanceForm(false)
  }

  const handleEdit = (investor) => {
    setEditingInvestor(investor)
    setFormData({
      name: investor.name,
      email: investor.email,
      phone: investor.phone,
      investmentAmount: investor.investmentAmount.toString(),
      initiationDate: investor.initiationDate || new Date().toISOString().split('T')[0],
      username: investor.username || '',
      password: investor.password || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this investor?')) {
      deleteInvestor(id)
    }
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const totalInvestorAmount = investors.reduce((sum, investor) => sum + investor.investmentAmount, 0)
  const totalInvestorGrowth = investors.reduce((sum, investor) => {
    const performance = calculateInvestorPerformance(investor.id)
    return sum + (performance ? performance.totalGrowthAmount : 0)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investors</h1>
          <p className="text-gray-600">Manage your investors and track their performance</p>
        </div>
        {!isViewer() && !isInvestor() && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Investor
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Investors</p>
              <p className="text-2xl font-bold text-gray-900">{investors.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <Euro className="h-8 w-8 text-success-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalInvestorAmount)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-warning-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Growth</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalInvestorGrowth)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Investor Form */}
      {showAddForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingInvestor ? 'Edit Investor' : 'Add New Investor'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field mt-1"
                  placeholder="Enter investor name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field mt-1"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="input-field mt-1"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Investment Amount (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.investmentAmount}
                  onChange={(e) => setFormData({...formData, investmentAmount: e.target.value})}
                  className="input-field mt-1"
                  placeholder="Enter investment amount"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Initiation Date
                </label>
                <input
                  type="date"
                  value={formData.initiationDate}
                  onChange={(e) => setFormData({...formData, initiationDate: e.target.value})}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="input-field mt-1"
                  placeholder="Auto-generated if empty"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="input-field mt-1"
                  placeholder="Auto-generated if empty"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button type="submit" className="btn-success">
                {editingInvestor ? 'Update Investor' : 'Add Investor'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddForm(false)
                  setEditingInvestor(null)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Investors List */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Investors List</h2>
        </div>
        
        {investors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {investors.map((investor, index) => {
                  const performance = calculateInvestorPerformance(investor.id)
                  return (
                    <tr key={`${investor.id}-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                              {investor.profilePicture ? (
                                <img
                                  src={investor.profilePicture}
                                  alt={`${investor.name}'s profile`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-primary-600" />
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {investor.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Initiated: {investor.initiationDate ? new Date(investor.initiationDate).toLocaleDateString() : 'Not set'}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Login: {investor.username} / {investor.password}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            {investor.email}
                          </div>
                          <div className="flex items-center mt-1">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            {investor.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">
                            {formatCurrency(investor.investmentAmount)}
                          </div>
                          <div className="text-gray-500">Initial investment</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {performance ? (
                          <div className="text-sm">
                            <div className={`font-medium ${getPerformanceColor(performance.totalNetPercentage)}`}>
                              {formatCurrency(performance.currentAmount)}
                            </div>
                            <div className={`text-gray-500 ${getPerformanceColor(performance.totalNetPercentage)}`}>
                              {formatPercentage(performance.totalNetPercentage)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            No performance data
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!isViewer() && !isInvestor() && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedInvestor(investor)
                                setShowPerformanceForm(true)
                              }}
                              className="text-primary-600 hover:text-primary-900"
                              title="Add Performance"
                            >
                              <TrendingUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(investor)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Edit Investor"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(investor.id)}
                              className="text-danger-600 hover:text-danger-900"
                              title="Delete Investor"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No investors yet. Add your first investor to start tracking their performance.
          </p>
        )}
      </div>

      {/* Add Performance Form */}
      {showPerformanceForm && selectedInvestor && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Add Performance for {selectedInvestor.name}
            </h2>
          </div>
          <form onSubmit={handlePerformanceSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  value={performanceData.year}
                  onChange={(e) => setPerformanceData({...performanceData, year: e.target.value})}
                  className="input-field mt-1"
                  min="2000"
                  max="2100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Month</label>
                <select
                  value={performanceData.month}
                  onChange={(e) => setPerformanceData({...performanceData, month: e.target.value})}
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
                  value={performanceData.growthAmount}
                  onChange={(e) => setPerformanceData({...performanceData, growthAmount: e.target.value})}
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
                  value={performanceData.growthPercentage}
                  onChange={(e) => setPerformanceData({...performanceData, growthPercentage: e.target.value})}
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
                  value={performanceData.deposit}
                  onChange={(e) => setPerformanceData({...performanceData, deposit: e.target.value})}
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
                  value={performanceData.withdrawal}
                  onChange={(e) => setPerformanceData({...performanceData, withdrawal: e.target.value})}
                  className="input-field mt-1"
                  placeholder="Enter withdrawal amount (optional)"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button type="submit" className="btn-success">
                Add Performance
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowPerformanceForm(false)
                  setSelectedInvestor(null)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* All Investors Performance Overview */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">All Investors Performance Overview</h2>
        </div>
        
        {investors.length > 0 ? (
          <div className="space-y-6">
            {investors.map((investor, index) => {
              const performance = calculateInvestorPerformance(investor.id)
              return (
                <div key={`${investor.id}-overview-${index}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                        {investor.profilePicture ? (
                          <img
                            src={investor.profilePicture}
                            alt={`${investor.name}'s profile`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{investor.name}</h3>
                        <p className="text-sm text-gray-500">{investor.email}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Initial: {formatCurrency(investor.investmentAmount)}
                    </div>
                  </div>
                  
                  {performance && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Current Amount</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(performance.currentAmount)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Total Growth</p>
                        <p className="text-lg font-bold text-success-600">
                          {formatCurrency(performance.totalGrowthAmount)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Total Deposits</p>
                        <p className="text-lg font-bold text-success-600">
                          {formatCurrency(performance.totalDeposits)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Total Withdrawals</p>
                        <p className="text-lg font-bold text-danger-600">
                          {formatCurrency(performance.totalWithdrawals)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {investor.performance.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Growth
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Growth %
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Deposit
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Withdrawal
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {investor.performance.map((entry) => (
                            <tr key={entry.id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {months[entry.month - 1]} {entry.year}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(entry.growthAmount)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {formatPercentage(entry.growthPercentage)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {entry.deposit > 0 ? formatCurrency(entry.deposit) : '-'}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {entry.withdrawal > 0 ? formatCurrency(entry.withdrawal) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No performance data for this investor yet.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No investors yet. Add your first investor to start tracking their performance.
          </p>
        )}
      </div>
    </div>
  )
}

export default Investors
