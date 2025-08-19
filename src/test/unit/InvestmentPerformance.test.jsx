import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { mockInvestmentData } from '../utils/test-utils'
import InvestmentPerformance from '../../pages/InvestmentPerformance'
import { investmentServices } from '../../firebase/services'

// Mock the useData hook
vi.mock('../../contexts/DataContext', () => ({
  useData: () => ({
    investmentData: mockInvestmentData,
    updateStartingBalance: vi.fn(),
    addPerformanceEntry: vi.fn(),
    updatePerformanceEntry: vi.fn(),
    deletePerformanceEntry: vi.fn(),
    calculateTotalPerformance: () => ({
      totalGrowthAmount: 1250,
      totalDeposits: 1000,
      totalWithdrawals: 200,
      totalGrowthPercentage: 12.5,
      averageGrowthPercentage: 6.25,
      currentBalance: 12050,
      totalNetPercentage: 12.5
    })
  })
}))

describe('InvestmentPerformance Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders performance overview correctly', () => {
    render(<InvestmentPerformance />)
    
    expect(screen.getByText('Investment Performance')).toBeInTheDocument()
    expect(screen.getByText('€12,050.00')).toBeInTheDocument() // Current balance
    expect(screen.getByText('€1,250.00')).toBeInTheDocument() // Total growth
    expect(screen.getByText('12.50%')).toBeInTheDocument() // Total net percentage
  })

  it('shows add performance entry form when add button is clicked', () => {
    render(<InvestmentPerformance />)
    
    const addButton = screen.getByRole('button', { name: /add entry/i })
    fireEvent.click(addButton)
    
    expect(screen.getByText('Add Performance Entry')).toBeInTheDocument()
    expect(screen.getByLabelText(/year/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/month/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/growth amount/i)).toBeInTheDocument()
  })

  it('validates required fields in add form', async () => {
    render(<InvestmentPerformance />)
    
    const addButton = screen.getByRole('button', { name: /add entry/i })
    fireEvent.click(addButton)
    
    const submitButton = screen.getByRole('button', { name: /add entry/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/growth amount is required/i)).toBeInTheDocument()
    })
  })

  it('submits performance entry successfully', async () => {
    const mockAddPerformanceEntry = vi.fn()
    vi.mocked(investmentServices.addPerformanceEntry).mockResolvedValue({
      id: '3',
      year: 2024,
      month: 3,
      growthAmount: 300,
      growthPercentage: 3.0
    })

    render(<InvestmentPerformance />)
    
    const addButton = screen.getByRole('button', { name: /add entry/i })
    fireEvent.click(addButton)
    
    const yearInput = screen.getByLabelText(/year/i)
    const monthInput = screen.getByLabelText(/month/i)
    const growthAmountInput = screen.getByLabelText(/growth amount/i)
    const growthPercentageInput = screen.getByLabelText(/growth percentage/i)
    const submitButton = screen.getByRole('button', { name: /add entry/i })
    
    fireEvent.change(yearInput, { target: { value: '2024' } })
    fireEvent.change(monthInput, { target: { value: '3' } })
    fireEvent.change(growthAmountInput, { target: { value: '300' } })
    fireEvent.change(growthPercentageInput, { target: { value: '3.0' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(investmentServices.addPerformanceEntry).toHaveBeenCalledWith({
        year: 2024,
        month: 3,
        growthAmount: 300,
        growthPercentage: 3.0,
        deposit: 0,
        withdrawal: 0
      })
    })
  })

  it('edits existing performance entry', async () => {
    render(<InvestmentPerformance />)
    
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    fireEvent.click(editButtons[0])
    
    expect(screen.getByText('Edit Performance Entry')).toBeInTheDocument()
    expect(screen.getByDisplayValue('500')).toBeInTheDocument() // Growth amount
  })

  it('deletes performance entry with confirmation', async () => {
    const mockDeletePerformanceEntry = vi.fn()
    vi.mocked(investmentServices.deletePerformanceEntry).mockResolvedValue()
    
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    
    render(<InvestmentPerformance />)
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])
    
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this performance entry?')
    
    await waitFor(() => {
      expect(investmentServices.deletePerformanceEntry).toHaveBeenCalled()
    })
    
    confirmSpy.mockRestore()
  })

  it('updates starting balance', async () => {
    const mockUpdateStartingBalance = vi.fn()
    vi.mocked(investmentServices.saveInvestmentData).mockResolvedValue()
    
    render(<InvestmentPerformance />)
    
    const updateBalanceButton = screen.getByRole('button', { name: /update balance/i })
    fireEvent.click(updateBalanceButton)
    
    const balanceInput = screen.getByLabelText(/starting balance/i)
    const submitButton = screen.getByRole('button', { name: /save/i })
    
    fireEvent.change(balanceInput, { target: { value: '15000' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(investmentServices.saveInvestmentData).toHaveBeenCalledWith({
        ...mockInvestmentData,
        startingBalance: 15000
      })
    })
  })

  it('displays performance entries in table', () => {
    render(<InvestmentPerformance />)
    
    expect(screen.getByText('Performance Entries')).toBeInTheDocument()
    expect(screen.getByText('1/2024')).toBeInTheDocument()
    expect(screen.getByText('2/2024')).toBeInTheDocument()
    expect(screen.getByText('€500.00')).toBeInTheDocument() // First entry growth
    expect(screen.getByText('€750.00')).toBeInTheDocument() // Second entry growth
  })

  it('handles form submission errors gracefully', async () => {
    vi.mocked(investmentServices.addPerformanceEntry).mockRejectedValue(new Error('Network error'))
    
    render(<InvestmentPerformance />)
    
    const addButton = screen.getByRole('button', { name: /add entry/i })
    fireEvent.click(addButton)
    
    const yearInput = screen.getByLabelText(/year/i)
    const monthInput = screen.getByLabelText(/month/i)
    const growthAmountInput = screen.getByLabelText(/growth amount/i)
    const submitButton = screen.getByRole('button', { name: /add entry/i })
    
    fireEvent.change(yearInput, { target: { value: '2024' } })
    fireEvent.change(monthInput, { target: { value: '3' } })
    fireEvent.change(growthAmountInput, { target: { value: '300' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/failed to save performance entry/i)).toBeInTheDocument()
    })
  })
})

