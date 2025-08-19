import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { DataProvider, useData } from '../../contexts/DataContext'
import { investmentServices, investorServices } from '../../firebase/services'
import { mockInvestmentData, mockInvestors } from '../utils/test-utils'

describe('DataContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('initializes with default state', () => {
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
    const { result } = renderHook(() => useData(), { wrapper })
    
    expect(result.current.investmentData).toEqual({
      startingBalance: 0,
      performance: []
    })
    expect(result.current.investors).toEqual([])
  })

  it('loads data from localStorage on initialization', () => {
    localStorage.setItem('investmentData', JSON.stringify(mockInvestmentData))
    localStorage.setItem('investors', JSON.stringify(mockInvestors))
    
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
    const { result } = renderHook(() => useData(), { wrapper })
    
    expect(result.current.investmentData).toEqual(mockInvestmentData)
    expect(result.current.investors).toEqual(mockInvestors)
  })

  it('adds performance entry correctly', async () => {
    const mockAddPerformanceEntry = vi.fn().mockResolvedValue({
      id: '3',
      year: 2024,
      month: 3,
      growthAmount: 300,
      growthPercentage: 3.0
    })
    vi.mocked(investmentServices.addPerformanceEntry).mockImplementation(mockAddPerformanceEntry)
    
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
    const { result } = renderHook(() => useData(), { wrapper })
    
    const newEntry = {
      year: 2024,
      month: 3,
      growthAmount: 300,
      growthPercentage: 3.0,
      deposit: 0,
      withdrawal: 0
    }
    
    await act(async () => {
      await result.current.addPerformanceEntry(newEntry)
    })
    
    expect(investmentServices.addPerformanceEntry).toHaveBeenCalledWith(newEntry)
    expect(result.current.investmentData.performance).toHaveLength(3)
  })

  it('updates performance entry correctly', async () => {
    const mockUpdatePerformanceEntry = vi.fn().mockResolvedValue()
    vi.mocked(investmentServices.updatePerformanceEntry).mockImplementation(mockUpdatePerformanceEntry)
    
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
    const { result } = renderHook(() => useData(), { wrapper })
    
    // Set initial data
    act(() => {
      result.current.investmentData = mockInvestmentData
    })
    
    const updates = {
      growthAmount: 600,
      growthPercentage: 6.0
    }
    
    await act(async () => {
      await result.current.updatePerformanceEntry('1', updates)
    })
    
    expect(investmentServices.updatePerformanceEntry).toHaveBeenCalledWith('1', updates)
  })

  it('deletes performance entry correctly', async () => {
    const mockDeletePerformanceEntry = vi.fn().mockResolvedValue()
    vi.mocked(investmentServices.deletePerformanceEntry).mockImplementation(mockDeletePerformanceEntry)
    
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
    const { result } = renderHook(() => useData(), { wrapper })
    
    // Set initial data
    act(() => {
      result.current.investmentData = mockInvestmentData
    })
    
    await act(async () => {
      await result.current.deletePerformanceEntry('1')
    })
    
    expect(investmentServices.deletePerformanceEntry).toHaveBeenCalledWith('1')
    expect(result.current.investmentData.performance).toHaveLength(1)
  })

  it('adds investor correctly', async () => {
    const mockAddInvestor = vi.fn().mockResolvedValue({
      id: '2',
      name: 'Jane Doe',
      email: 'jane@example.com'
    })
    vi.mocked(investorServices.addInvestor).mockImplementation(mockAddInvestor)
    
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
    const { result } = renderHook(() => useData(), { wrapper })
    
    const newInvestor = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1234567890',
      investmentAmount: 3000,
      initiationDate: '2024-01-01'
    }
    
    await act(async () => {
      await result.current.addInvestor(newInvestor)
    })
    
    expect(investorServices.addInvestor).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Jane Doe',
      email: 'jane@example.com'
    }))
  })

  it('calculates total performance correctly', () => {
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
    const { result } = renderHook(() => useData(), { wrapper })
    
    // Set initial data
    act(() => {
      result.current.investmentData = mockInvestmentData
    })
    
    const performance = result.current.calculateTotalPerformance()
    
    expect(performance.totalGrowthAmount).toBe(1250) // 500 + 750
    expect(performance.totalDeposits).toBe(1000) // 1000 + 0
    expect(performance.totalWithdrawals).toBe(200) // 0 + 200
    expect(performance.currentBalance).toBe(12050) // 10000 + 1250 + 1000 - 200
  })

  it('handles Firebase errors gracefully', async () => {
    vi.mocked(investmentServices.addPerformanceEntry).mockRejectedValue(new Error('Network error'))
    
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
    const { result } = renderHook(() => useData(), { wrapper })
    
    const newEntry = {
      year: 2024,
      month: 3,
      growthAmount: 300,
      growthPercentage: 3.0
    }
    
    await act(async () => {
      await result.current.addPerformanceEntry(newEntry)
    })
    
    // Should still update local state even if Firebase fails
    expect(result.current.investmentData.performance).toHaveLength(1)
  })

  it('sorts performance entries by date', async () => {
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
    const { result } = renderHook(() => useData(), { wrapper })
    
    // Add entries out of order
    const entry1 = { year: 2024, month: 3, growthAmount: 300, growthPercentage: 3.0 }
    const entry2 = { year: 2024, month: 1, growthAmount: 100, growthPercentage: 1.0 }
    const entry3 = { year: 2024, month: 2, growthAmount: 200, growthPercentage: 2.0 }
    
    await act(async () => {
      await result.current.addPerformanceEntry(entry1)
      await result.current.addPerformanceEntry(entry2)
      await result.current.addPerformanceEntry(entry3)
    })
    
    const performance = result.current.investmentData.performance
    expect(performance[0].month).toBe(1)
    expect(performance[1].month).toBe(2)
    expect(performance[2].month).toBe(3)
  })

  it('updates starting balance correctly', async () => {
    const mockSaveInvestmentData = vi.fn().mockResolvedValue()
    vi.mocked(investmentServices.saveInvestmentData).mockImplementation(mockSaveInvestmentData)
    
    const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
    const { result } = renderHook(() => useData(), { wrapper })
    
    await act(async () => {
      await result.current.updateStartingBalance(15000)
    })
    
    expect(investmentServices.saveInvestmentData).toHaveBeenCalledWith({
      startingBalance: 15000,
      performance: []
    })
    expect(result.current.investmentData.startingBalance).toBe(15000)
  })
})

