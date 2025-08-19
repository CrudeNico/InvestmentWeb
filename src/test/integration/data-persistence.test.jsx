import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { DataProvider, useData } from '../../contexts/DataContext'
import { investmentServices, investorServices } from '../../firebase/services'

describe('Data Persistence Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Firebase Integration', () => {
    it('should save performance entry to Firebase and update local state', async () => {
      const mockSavedEntry = {
        id: 'test-id-123',
        year: 2024,
        month: 3,
        growthAmount: 500,
        growthPercentage: 5.0,
        deposit: 1000,
        withdrawal: 0
      }
      
      vi.mocked(investmentServices.addPerformanceEntry).mockResolvedValue(mockSavedEntry)
      
      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
      const { result } = renderHook(() => useData(), { wrapper })
      
      const newEntry = {
        year: 2024,
        month: 3,
        growthAmount: 500,
        growthPercentage: 5.0,
        deposit: 1000,
        withdrawal: 0
      }
      
      await act(async () => {
        await result.current.addPerformanceEntry(newEntry)
      })
      
      expect(investmentServices.addPerformanceEntry).toHaveBeenCalledWith(newEntry)
      expect(result.current.investmentData.performance).toContainEqual(mockSavedEntry)
    })

    it('should handle Firebase save failure and fallback to localStorage', async () => {
      vi.mocked(investmentServices.addPerformanceEntry).mockRejectedValue(new Error('Network error'))
      
      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
      const { result } = renderHook(() => useData(), { wrapper })
      
      const newEntry = {
        year: 2024,
        month: 3,
        growthAmount: 500,
        growthPercentage: 5.0
      }
      
      await act(async () => {
        await result.current.addPerformanceEntry(newEntry)
      })
      
      // Should still update local state even if Firebase fails
      expect(result.current.investmentData.performance).toHaveLength(1)
      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('should sync data between Firebase and localStorage', async () => {
      const mockFirebaseData = {
        startingBalance: 15000,
        performance: [
          {
            id: '1',
            year: 2024,
            month: 1,
            growthAmount: 750,
            growthPercentage: 5.0
          }
        ]
      }
      
      vi.mocked(investmentServices.getInvestmentData).mockResolvedValue(mockFirebaseData)
      
      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
      const { result } = renderHook(() => useData(), { wrapper })
      
      // Wait for Firebase data to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      expect(result.current.investmentData.startingBalance).toBe(15000)
      expect(result.current.investmentData.performance).toHaveLength(1)
    })
  })

  describe('Data Consistency', () => {
    it('should maintain data consistency across CRUD operations', async () => {
      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
      const { result } = renderHook(() => useData(), { wrapper })
      
      // Add entry
      const entry1 = {
        year: 2024,
        month: 1,
        growthAmount: 100,
        growthPercentage: 1.0
      }
      
      await act(async () => {
        await result.current.addPerformanceEntry(entry1)
      })
      
      expect(result.current.investmentData.performance).toHaveLength(1)
      
      // Update entry
      const entryId = result.current.investmentData.performance[0].id
      await act(async () => {
        await result.current.updatePerformanceEntry(entryId, { growthAmount: 200 })
      })
      
      expect(result.current.investmentData.performance[0].growthAmount).toBe(200)
      
      // Delete entry
      await act(async () => {
        await result.current.deletePerformanceEntry(entryId)
      })
      
      expect(result.current.investmentData.performance).toHaveLength(0)
    })

    it('should handle concurrent operations correctly', async () => {
      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
      const { result } = renderHook(() => useData(), { wrapper })
      
      // Simulate concurrent operations
      const promises = [
        result.current.addPerformanceEntry({
          year: 2024,
          month: 1,
          growthAmount: 100,
          growthPercentage: 1.0
        }),
        result.current.addPerformanceEntry({
          year: 2024,
          month: 2,
          growthAmount: 200,
          growthPercentage: 2.0
        }),
        result.current.addPerformanceEntry({
          year: 2024,
          month: 3,
          growthAmount: 300,
          growthPercentage: 3.0
        })
      ]
      
      await act(async () => {
        await Promise.all(promises)
      })
      
      expect(result.current.investmentData.performance).toHaveLength(3)
      // Should be sorted by date
      expect(result.current.investmentData.performance[0].month).toBe(1)
      expect(result.current.investmentData.performance[1].month).toBe(2)
      expect(result.current.investmentData.performance[2].month).toBe(3)
    })
  })

  describe('Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      vi.mocked(investmentServices.addPerformanceEntry).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )
      
      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
      const { result } = renderHook(() => useData(), { wrapper })
      
      const newEntry = {
        year: 2024,
        month: 1,
        growthAmount: 100,
        growthPercentage: 1.0
      }
      
      await act(async () => {
        await result.current.addPerformanceEntry(newEntry)
      })
      
      // Should still work with localStorage fallback
      expect(result.current.investmentData.performance).toHaveLength(1)
    })

    it('should handle invalid data gracefully', async () => {
      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
      const { result } = renderHook(() => useData(), { wrapper })
      
      // Try to add entry with invalid data
      const invalidEntry = {
        year: 'invalid',
        month: 'invalid',
        growthAmount: 'invalid',
        growthPercentage: 'invalid'
      }
      
      await act(async () => {
        await result.current.addPerformanceEntry(invalidEntry)
      })
      
      // Should handle gracefully and not crash
      expect(result.current.investmentData.performance).toBeDefined()
    })
  })

  describe('Performance Calculations', () => {
    it('should calculate performance metrics correctly with real data', () => {
      const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>
      const { result } = renderHook(() => useData(), { wrapper })
      
      // Set up test data
      act(() => {
        result.current.investmentData = {
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
      })
      
      const performance = result.current.calculateTotalPerformance()
      
      expect(performance.totalGrowthAmount).toBe(1250) // 500 + 750
      expect(performance.totalDeposits).toBe(1000) // 1000 + 0
      expect(performance.totalWithdrawals).toBe(200) // 0 + 200
      expect(performance.currentBalance).toBe(12050) // 10000 + 1250 + 1000 - 200
      expect(performance.averageGrowthPercentage).toBe(6.25) // (5.0 + 7.5) / 2
    })
  })
})

