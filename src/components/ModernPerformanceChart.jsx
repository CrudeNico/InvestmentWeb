import React, { useEffect, useState, useMemo, useCallback } from 'react'
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
import { Line } from 'react-chartjs-2'

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

const ModernPerformanceChart = ({ data, title = "Performance Over Time", height = 400 }) => {
  const [customDeposit, setCustomDeposit] = useState('')
  const [showCustomProjection, setShowCustomProjection] = useState(false)
  // Memoize chart data calculation
  const { chartData, projectionData } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: null, projectionData: null }
    }

    // Calculate average growth percentage from actual performance data
    const growthPercentages = data.map(entry => entry.growthPercentage || 0).filter(p => !isNaN(p))
    const avgGrowthRate = growthPercentages.length > 0 
      ? growthPercentages.reduce((sum, percentage) => sum + percentage, 0) / growthPercentages.length 
      : 0

    // Calculate average monthly deposit from historical data
    const deposits = data.map(entry => entry.deposit || 0).filter(d => !isNaN(d))
    const avgMonthlyDeposit = deposits.length > 0 
      ? deposits.reduce((sum, deposit) => sum + deposit, 0) / deposits.length 
      : 0

    // Generate projection data (12 months from last data point)
    const lastEntry = data[data.length - 1]
    if (!lastEntry || typeof lastEntry.balance !== 'number') {
      return { chartData: null, projectionData: null }
    }
    
    const projection = []
    let projectedBalance = lastEntry.balance

    for (let i = 1; i <= 12; i++) {
      // Apply growth rate to current balance
      projectedBalance = projectedBalance * (1 + avgGrowthRate / 100)
      // Add monthly deposit
      projectedBalance += avgMonthlyDeposit
      
      projection.push({
        date: `Projected ${i}`,
        balance: projectedBalance,
        isProjection: true
      })
    }

    // Generate custom projection if enabled
    const customProjection = []
    if (showCustomProjection && customDeposit && !isNaN(parseFloat(customDeposit))) {
      let customProjectedBalance = lastEntry.balance
      const customDepositAmount = parseFloat(customDeposit)

      for (let i = 1; i <= 12; i++) {
        // Apply growth rate to current balance
        customProjectedBalance = customProjectedBalance * (1 + avgGrowthRate / 100)
        // Add custom monthly deposit
        customProjectedBalance += customDepositAmount
        
        customProjection.push({
          date: `Projected ${i}`,
          balance: customProjectedBalance,
          isCustomProjection: true
        })
      }
    }

    // Prepare actual data
    const actualData = data.map(entry => ({
      ...entry,
      isProjection: false
    }))

    // Combine actual and projection data (don't include custom projection in labels)
    const combinedData = [...actualData, ...projection]
    


    const chartData = {
      labels: combinedData.map(entry => entry.date),
      datasets: [
        {
          label: 'Actual Performance',
          data: actualData.map(entry => entry.balance),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#3b82f6',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3
        },
        {
          label: '1-Year Projection',
          data: combinedData.map(entry => entry.isProjection ? entry.balance : null),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#22c55e',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3
        },
        ...(showCustomProjection && customProjection.length > 0 ? [{
          label: `Custom Projection (€${customDeposit}/month)`,
          data: [
            // Actual data points (null for custom projection)
            ...actualData.map(() => null),
            // Projection points (custom values for projection months)
            ...projection.map((_, index) => customProjection[index]?.balance || null)
          ],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          borderDash: [3, 3],
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#f59e0b',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3
        }] : [])
      ]
    }



    const projectionData = {
      avgGrowthRate,
      projectedBalance: projection[projection.length - 1]?.balance,
      customProjectedBalance: customProjection.length > 0 ? customProjection[customProjection.length - 1]?.balance : null
    }

    return { chartData, projectionData }
  }, [data, customDeposit, showCustomProjection])

  // Memoize chart options
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600'
          }
        },
        onClick: (event, legendItem, legend) => {
          const index = legendItem.index
          const chart = legend.chart
          const meta = chart.getDatasetMeta(index)
          
          meta.hidden = !meta.hidden
          chart.update()
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label
          },
          label: (context) => {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            return `${label}: ${new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR'
            }).format(value)}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
            weight: '500'
          },
          maxRotation: 45,
          minRotation: 45
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: '#f3f4f6',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
            weight: '500'
          },
          callback: (value) => {
            return new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value)
          }
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      point: {
        hoverRadius: 8
      }
    }
  }), [])

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading chart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {projectionData && (
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span>Avg Growth Rate: {projectionData.avgGrowthRate.toFixed(2)}%</span>
                <span>•</span>
                <span>Projected: {new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(projectionData.projectedBalance)}</span>
                {showCustomProjection && projectionData.customProjectedBalance && (
                  <>
                    <span>•</span>
                    <span className="text-orange-600 font-medium">
                      Custom: {new Intl.NumberFormat('de-DE', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(projectionData.customProjectedBalance)}
                    </span>
                    <span>•</span>
                    <span className={`font-medium ${
                      projectionData.customProjectedBalance > projectionData.projectedBalance 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      Diff: {new Intl.NumberFormat('de-DE', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(projectionData.customProjectedBalance - projectionData.projectedBalance)}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Custom Deposit Input */}
          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Custom Monthly Deposit:</label>
              <input
                type="number"
                value={customDeposit}
                onChange={(e) => setCustomDeposit(e.target.value)}
                placeholder="500"
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
              <span className="text-sm text-gray-600">€</span>
            </div>
            <button
              onClick={() => setShowCustomProjection(!showCustomProjection)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                showCustomProjection 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={!customDeposit || isNaN(parseFloat(customDeposit))}
            >
              {showCustomProjection ? 'Hide' : 'Show'} Projection
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div style={{ height: `${height}px` }}>
          <Line data={chartData} options={options} />
        </div>
      </div>
    </div>
  )
}

export default ModernPerformanceChart
