import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import { DataProvider } from '../../contexts/DataContext'
import { ChatProvider } from '../../contexts/ChatContext'

const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Mock data for tests
export const mockInvestmentData = {
  startingBalance: 10000,
  performance: [
    {
      id: '1',
      year: 2024,
      month: 1,
      growthAmount: 500,
      growthPercentage: 5.0,
      deposit: 1000,
      withdrawal: 0
    },
    {
      id: '2',
      year: 2024,
      month: 2,
      growthAmount: 750,
      growthPercentage: 7.5,
      deposit: 0,
      withdrawal: 200
    }
  ]
}

export const mockInvestors = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    investmentAmount: 5000,
    initiationDate: '2024-01-01',
    username: 'johndoe',
    password: 'password123',
    performance: [
      {
        id: '1',
        year: 2024,
        month: 1,
        growthAmount: 250,
        growthPercentage: 5.0,
        deposit: 500,
        withdrawal: 0
      }
    ]
  }
]

export const mockNewsSources = [
  {
    id: '1',
    name: 'Financial Times',
    url: 'https://www.ft.com',
    icon: 'Newspaper'
  }
]

