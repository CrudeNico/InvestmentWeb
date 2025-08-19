import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { 
  TrendingUp, 
  Users, 
  Euro, 
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Home
} from 'lucide-react'
import ModernPerformanceChart from '../components/ModernPerformanceChart'
import LoadingSpinner from '../components/LoadingSpinner'


const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true)
  
  const { 
    investmentData, 
    investors, 
    calculateTotalPerformance,
    calculateInvestorPerformance 
  } = useData()

  useEffect(() => {
    // Set loading to false after data is loaded
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [investmentData, investors])

  const totalPerformance = calculateTotalPerformance()
  const totalInvestorAmount = investors.reduce((sum, investor) => sum + investor.investmentAmount, 0)
  const totalInvestorGrowth = investors.reduce((sum, investor) => {
    const performance = calculateInvestorPerformance(investor.id)
    return sum + (performance ? performance.totalGrowthAmount : 0)
  }, 0)

  // Get current monthly performance
  const getCurrentMonthlyPerformance = () => {
    if (investmentData.performance.length === 0) return null
    
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    
    const currentEntry = investmentData.performance.find(entry => 
      entry.year === currentYear && entry.month === currentMonth
    )
    
    return currentEntry || investmentData.performance[investmentData.performance.length - 1]
  }

  // Prepare chart data with memoization
  const prepareChartData = useMemo(() => {
    if (investmentData.performance.length === 0) return []
    
    let runningBalance = investmentData.startingBalance
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    
    return investmentData.performance.map(entry => {
      runningBalance += (entry.growthAmount || 0) + (entry.deposit || 0) - (entry.withdrawal || 0)
      return {
        date: `${months[entry.month - 1]} ${entry.year}`,
        balance: runningBalance,
        growth: entry.growthAmount || 0,
        growthPercentage: entry.growthPercentage || 0,
        deposit: entry.deposit || 0,
        withdrawal: entry.withdrawal || 0
      }
    })
  }, [investmentData.performance, investmentData.startingBalance])

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





  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your investment portfolio and investor performance</p>
        </div>
        <Link
          to="/"
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Return to Main Page</span>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Euro className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Starting Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(investmentData.startingBalance)}
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
                {totalPerformance ? formatCurrency(totalPerformance.totalGrowthAmount) : formatCurrency(0)}
              </p>
              {totalPerformance && (
                <div className="flex items-center mt-1">
                  {getPerformanceIcon(totalPerformance.totalNetPercentage)}
                  <span className={`text-sm font-medium ml-1 ${getPerformanceColor(totalPerformance.totalNetPercentage)}`}>
                    {formatPercentage(totalPerformance.totalNetPercentage)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-warning-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Investors</p>
              <p className="text-2xl font-bold text-gray-900">{investors.length}</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatCurrency(totalInvestorAmount)} invested
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
              <p className="text-sm font-medium text-gray-500">Total Deposits</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalPerformance ? formatCurrency(totalPerformance.totalDeposits) : formatCurrency(0)}
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
                {totalPerformance ? formatCurrency(totalPerformance.totalWithdrawals) : formatCurrency(0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Percent className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Current Monthly Growth</p>
              <p className="text-2xl font-bold text-gray-900">
                {(() => {
                  const currentPerformance = getCurrentMonthlyPerformance()
                  return currentPerformance ? formatPercentage(currentPerformance.growthPercentage) : '0.00%'
                })()}
              </p>
              <p className="text-sm text-gray-500">
                {(() => {
                  const currentPerformance = getCurrentMonthlyPerformance()
                  return currentPerformance ? formatCurrency(currentPerformance.growthAmount) : formatCurrency(0)
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      {totalPerformance && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Performance Summary</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Balance</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalPerformance.currentBalance)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Net Profit</p>
              <p className={`text-xl font-bold ${getPerformanceColor(totalPerformance.totalNetPercentage)}`}>
                {formatCurrency(totalPerformance.totalGrowthAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Net Percentage</p>
              <p className={`text-xl font-bold ${getPerformanceColor(totalPerformance.totalNetPercentage)}`}>
                {formatPercentage(totalPerformance.totalNetPercentage)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Performance Entries</p>
              <p className="text-xl font-bold text-gray-900">
                {investmentData.performance.length}
              </p>
            </div>
          </div>
        </div>
      )}



      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Recent Performance Entries</h2>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {investmentData.performance.slice(-5).reverse().map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.month}/{entry.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(entry.growthAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(entry.growthPercentage)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No performance entries yet. Add your first entry in the Investment Performance section.</p>
        )}
      </div>

      {/* Performance Chart */}
      <ModernPerformanceChart 
        data={prepareChartData}
        title="Performance Over Time"
        height={400}
      />



    </div>
  )
}

export default Dashboard
