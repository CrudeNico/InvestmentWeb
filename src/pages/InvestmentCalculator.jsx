import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, BarChart3, DollarSign, Calendar, Target, Calculator, PieChart, Users, Clock } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import FloatingChat from '../components/FloatingChat'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const InvestmentCalculator = () => {
  const [investmentType, setInvestmentType] = useState('passive')
  const [targetGoal, setTargetGoal] = useState(100000)
  const [initialInvestment, setInitialInvestment] = useState(10000)
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000)
  const [duration, setDuration] = useState(3)
  const [isCalculating, setIsCalculating] = useState(false)

  const investmentTypes = [
    {
      id: 'passive',
      name: 'Passive',
      growth: 2,
      description: 'Fixed growth: 2% monthly',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      id: 'active',
      name: 'Active',
      growth: 4,
      description: 'Fixed growth: 4% monthly',
      icon: BarChart3,
      color: 'bg-blue-500'
    }
  ]

  const durationOptions = [
    { value: 1, label: '1 Year' },
    { value: 3, label: '3 Years' },
    { value: 5, label: '5 Years' }
  ]

  // Calculate investment growth with compound interest
  const calculateGrowth = useMemo(() => {
    const selectedType = investmentTypes.find(type => type.id === investmentType)
    const monthlyGrowthRate = selectedType.growth / 100
    const totalMonths = duration * 12
    
    const data = []
    let currentBalance = initialInvestment
    
    for (let month = 0; month <= totalMonths; month++) {
      if (month > 0) {
        // Apply monthly growth to current balance
        currentBalance = currentBalance * (1 + monthlyGrowthRate)
        // Add monthly investment
        currentBalance += monthlyInvestment
      }
      
      data.push({
        month,
        balance: currentBalance,
        year: Math.floor(month / 12),
        monthOfYear: month % 12
      })
    }
    
    return data
  }, [investmentType, initialInvestment, monthlyInvestment, duration])

  // Calculate investment growth without compound interest (simple interest)
  const calculateSimpleGrowth = useMemo(() => {
    const totalMonths = duration * 12
    const data = []
    
    for (let month = 0; month <= totalMonths; month++) {
      // Simple calculation: initial + (monthly * months) + (initial * simple interest rate)
      const totalContributions = initialInvestment + (monthlyInvestment * month)
      const simpleInterest = initialInvestment * 0.02 * month // 2% annual simple interest
      const balance = totalContributions + simpleInterest
      
      data.push({
        month,
        balance,
        year: Math.floor(month / 12),
        monthOfYear: month % 12
      })
    }
    
    return data
  }, [initialInvestment, monthlyInvestment, duration])

  // Prepare chart data
  const chartData = useMemo(() => {
    const labels = calculateGrowth.map((point, index) => {
      if (index === 0) return 'Start'
      const year = Math.floor(point.month / 12)
      const month = point.month % 12
      return `${month + 1}/${year + 1}`
    })

    const compoundData = calculateGrowth.map(point => point.balance)
    const simpleData = calculateSimpleGrowth.map(point => point.balance)

    return {
      labels,
      datasets: [
        {
          label: 'With Compound Interest',
          data: compoundData,
          borderColor: investmentType === 'passive' ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)',
          backgroundColor: investmentType === 'passive' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6
        },
        {
          label: 'Without Compound Interest',
          data: simpleData,
          borderColor: 'rgb(156, 163, 175)',
          backgroundColor: 'rgba(156, 163, 175, 0.1)',
          fill: false,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 4,
          borderDash: [5, 5]
        }
      ]
    }
  }, [calculateGrowth, calculateSimpleGrowth, investmentType])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'white',
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: €${context.parsed.y.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time Period',
          color: 'white'
        },
        grid: {
          display: false
        },
        ticks: {
          color: 'white'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Investment Value (€)',
          color: 'white'
        },
        ticks: {
          callback: function(value) {
            return '€' + value.toLocaleString('de-DE')
          },
          color: 'white'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }

  const totalInvestment = initialInvestment + (monthlyInvestment * duration * 12)
  const finalValue = calculateGrowth[calculateGrowth.length - 1]?.balance || 0
  const totalGrowth = finalValue - totalInvestment
  const growthPercentage = ((finalValue - totalInvestment) / totalInvestment) * 100

  // Goal tracking calculations
  const goalDifference = finalValue - targetGoal
  const isGoalAchieved = finalValue >= targetGoal
  const goalStatus = isGoalAchieved ? 'surplus' : 'deficit'

  const statsData = [
    {
      icon: Users,
      value: '78%',
      label: 'of investors choose Passive',
      color: 'text-green-500'
    },
    {
      icon: TrendingUp,
      value: '62%',
      label: 'have recurring investments',
      color: 'text-blue-500'
    },
    {
      icon: Clock,
      value: '12%',
      label: 'max monthly withdrawals',
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-white">Opessocius</Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-white/80 hover:text-white transition-colors" onClick={() => window.scrollTo(0, 0)}>
                Home
              </Link>
              <Link to="/about" className="text-white/80 hover:text-white transition-colors" onClick={() => window.scrollTo(0, 0)}>
                About
              </Link>
              <Link to="/calculator" className="text-white/80 hover:text-white transition-colors" onClick={() => window.scrollTo(0, 0)}>
                Calculator
              </Link>
              <Link to="/contact" className="text-white/80 hover:text-white transition-colors" onClick={() => window.scrollTo(0, 0)}>
                Contact
              </Link>
              <Link 
                to="/login" 
                className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-white/90 transition-colors flex items-center space-x-2"
                onClick={() => window.scrollTo(0, 0)}
              >
                <span>Login to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Investment
            <span className="block bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Calculator
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-6 max-w-4xl mx-auto leading-relaxed">
            Calculate your potential returns with our advanced investment simulator. 
            See how your money can grow with different strategies.
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Inputs */}
            <div className="space-y-8">
              {/* Investment Type Selection */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Investment Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {investmentTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => setInvestmentType(type.id)}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          investmentType === type.id
                            ? 'border-blue-400 bg-blue-400/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-10 h-10 ${type.color} rounded-full flex items-center justify-center`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-white">{type.name}</h3>
                            <p className="text-white/70 text-sm">{type.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                {/* Target Goal Input */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    What's Your Target Goal? (€)
                  </label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                    <input
                      type="number"
                      value={targetGoal}
                      onChange={(e) => setTargetGoal(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="100000"
                    />
                  </div>
                </div>
              </div>

              {/* Input Fields */}
              <div>
                {/* Investment Details */}
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Investment Details</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Initial Investment (€)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 font-bold">€</span>
                        <input
                          type="number"
                          value={initialInvestment}
                          onChange={(e) => setInitialInvestment(Number(e.target.value))}
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          placeholder="10000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Monthly Recurring Investment (€)
                      </label>
                      <div className="relative">
                        <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                        <input
                          type="number"
                          value={monthlyInvestment}
                          onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          placeholder="1000"
                        />
                      </div>
                    </div>

                    {/* Duration Selection */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Duration
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {durationOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setDuration(option.value)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              duration === option.value
                                ? 'border-blue-400 bg-blue-400/10 text-white'
                                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Advisor Section - Added for symmetry */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mt-25">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                            <img 
                              src="/images/advisorMarcos.jpg" 
                              alt="Advisor Marcos" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center" style={{ display: 'none' }}>
                              <span className="text-white font-bold text-lg">M</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Advisor Marcos</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-400 text-sm font-medium">● Live</span>
                            <span className="text-white/70 text-sm">Investment Specialist</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-white/80 text-sm mb-4">
                        Ready to help you start your investment journey today. Create your account and let's build your financial future together.
                      </p>
                      <div className="space-y-2">
                        <Link 
                          to="/register"
                          className="w-full bg-gradient-to-r from-slate-800 to-slate-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-slate-700 hover:to-slate-600 transition-all duration-200 text-sm border border-slate-600 flex items-center justify-center space-x-2"
                        >
                          <span>Start Your Investment Today</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => window.location.href = '/contact'}
                          className="w-full bg-white/10 text-white py-2 px-4 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 text-sm border border-white/20"
                        >
                          Any Questions? Contact Us
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Chart and Results */}
            <div className="space-y-8">
              {/* Growth Projection Chart */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Growth Projection</h2>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="h-96">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Goal Progress - Moved to right column */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Goal Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Target Goal:</span>
                    <span className="text-white font-semibold">€{targetGoal.toLocaleString('de-DE')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">
                      {isGoalAchieved ? 'Surplus to Goal:' : 'Deficit to Goal:'}
                    </span>
                    <span className={`font-semibold ${isGoalAchieved ? 'text-green-400' : 'text-red-400'}`}>
                      {isGoalAchieved ? '+' : '-'}€{Math.abs(goalDifference).toLocaleString('de-DE', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="mt-3 p-3 rounded-lg bg-white/5">
                    <div className="text-center">
                      <span className={`text-sm font-medium ${isGoalAchieved ? 'text-green-400' : 'text-red-400'}`}>
                        {isGoalAchieved 
                          ? `🎉 You'll exceed your goal by €${goalDifference.toLocaleString('de-DE', { maximumFractionDigits: 0 })}!`
                          : `📈 You need €${Math.abs(goalDifference).toLocaleString('de-DE', { maximumFractionDigits: 0 })} more to reach your goal`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment Summary */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Investment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Total Investment:</span>
                    <span className="text-white font-semibold">€{totalInvestment.toLocaleString('de-DE')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Final Value:</span>
                    <span className="text-white font-semibold">€{finalValue.toLocaleString('de-DE', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Total Growth:</span>
                    <span className="text-green-400 font-semibold">€{totalGrowth.toLocaleString('de-DE', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Growth %:</span>
                    <span className="text-green-400 font-semibold">+{growthPercentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Investment Information</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-400 font-bold text-lg">€</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Deposits</h3>
                <p className="text-white/70 text-sm">
                  Supported via any payment method — crypto, all major currencies, and other common methods.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Setup Time</h3>
                <p className="text-white/70 text-sm">
                  It takes up to 7 days from receiving capital for full setup.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Withdrawals</h3>
                <p className="text-white/70 text-sm">
                  After the minimum 6-month contract period, investors can withdraw funds monthly with prior notice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Investment Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {statsData.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow">
                  <div className="flex items-center justify-center mx-auto mb-6">
                    <Icon className={`h-12 w-12 ${stat.color}`} />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/70">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of successful investors who trust Opessocius with their portfolios.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transition-all text-lg border border-blue-400"
            >
              <span>Get Started Today</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center space-x-2 bg-white text-slate-800 px-8 py-4 rounded-full font-semibold hover:bg-slate-100 transition-all text-lg border border-slate-200"
            >
              <span>Login to Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/50">
            © 2024 Opessocius. All rights reserved. Professional investment management services.
          </p>
        </div>
      </footer>

      {/* Floating Chat */}
      <FloatingChat />
    </div>
  )
}

export default InvestmentCalculator
