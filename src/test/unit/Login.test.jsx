import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import Login from '../../pages/Login'

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders login form correctly', () => {
    render(<Login />)
    
    expect(screen.getByText('Opessocius')).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows password when toggle button is clicked', () => {
    render(<Login />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('button', { name: '' })
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('validates required fields', async () => {
    render(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument()
    })
  })

  it('handles successful admin login', async () => {
    render(<Login />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'CrudeNico' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('isAuthenticated', 'true')
      expect(localStorage.setItem).toHaveBeenCalledWith('userRole', 'admin')
    })
  })

  it('handles failed login', async () => {
    render(<Login />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(usernameInput, { target: { value: 'wrong' } })
    fireEvent.change(passwordInput, { target: { value: 'wrong' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during login', async () => {
    render(<Login />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'CrudeNico' } })
    fireEvent.click(submitButton)
    
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
  })
})

