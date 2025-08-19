import React, { useMemo } from 'react'
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

const PerformanceGraph = () => {
  const data = useMemo(() => {
    const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
    const investments = [25000, 45000, 75000, 120000, 180000, 240000, 280000, 310000]
    
    return {
      labels: years,
      datasets: [
        {
          label: 'Total Investments (€)',
          data: investments,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: 'rgb(99, 102, 241)',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
        }
      ]
    }
  }, [])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `€${context.parsed.y.toLocaleString()}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          },
          callback: function(value) {
            return '€' + (value / 1000) + 'K'
          }
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

  return (
    <div className="w-full h-96 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Investment Growth</h3>
        <p className="text-white/70">Total investments from 2018 to 2025</p>
      </div>
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="text-2xl font-bold text-green-400">€25K</div>
          <div className="text-white/70 text-sm">Starting 2018</div>
        </div>
        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="text-2xl font-bold text-blue-400">€310K</div>
          <div className="text-white/70 text-sm">Projected 2025</div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceGraph
