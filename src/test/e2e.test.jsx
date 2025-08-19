import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { DataProvider } from '../contexts/DataContext'
import { ChatProvider } from '../contexts/ChatContext'
import App from '../App'
import Login from '../pages/Login'
import Register from '../pages/Register'
import LandingPage from '../pages/LandingPage'

// Mock Firebase and other external dependencies
vi.mock('../firebase/config', () => ({
  db: {},
  auth: {}
}))

vi.mock('../firebase/services', () => ({
  investmentServices: {
    getInvestmentData: vi.fn(() => Promise.resolve([])),
    saveInvestmentData: vi.fn(() => Promise.resolve()),
    addPerformanceEntry: vi.fn(() => Promise.resolve()),
    updatePerformanceEntry: vi.fn(() => Promise.resolve()),
    deletePerformanceEntry: vi.fn(() => Promise.resolve()),
    onInvestmentDataChange: vi.fn(() => () => {})
  },
  investorServices: {
    getInvestors: vi.fn(() => Promise.resolve([])),
    addInvestor: vi.fn(() => Promise.resolve()),
    updateInvestor: vi.fn(() => Promise.resolve()),
    deleteInvestor: vi.fn(() => Promise.resolve()),
    getInvestorPerformance: vi.fn(() => Promise.resolve([])),
    addInvestorPerformance: vi.fn(() => Promise.resolve()),
    updateInvestorPerformance: vi.fn(() => Promise.resolve()),
    deleteInvestorPerformance: vi.fn(() => Promise.resolve()),
    onInvestorsChange: vi.fn(() => () => {})
  },
  newsSourcesServices: {
    getNewsSources: vi.fn(() => Promise.resolve([])),
    addNewsSource: vi.fn(() => Promise.resolve()),
    updateNewsSource: vi.fn(() => Promise.resolve()),
    deleteNewsSource: vi.fn(() => Promise.resolve()),
    clearAllNewsSources: vi.fn(() => Promise.resolve()),
    onNewsSourcesChange: vi.fn(() => () => {}),
    updateAdminPassword: vi.fn(() => Promise.resolve())
  },
  chatServices: {
    getConversations: vi.fn(() => Promise.resolve([])),
    createConversation: vi.fn(() => Promise.resolve()),
    getMessages: vi.fn(() => Promise.resolve([])),
    sendMessage: vi.fn(() => Promise.resolve()),
    onConversationsChange: vi.fn(() => () => {}),
    onMessagesChange: vi.fn(() => () => {}),
    onAllMessagesChange: vi.fn(() => () => {})
  }
}))

vi.mock('../firebase/emailService', () => ({
  default: {
    sendWelcomeEmail: vi.fn(() => Promise.resolve({ success: true })),
    sendSignInConfirmation: vi.fn(() => Promise.resolve({ success: true })),
    sendPasswordResetEmail: vi.fn(() => Promise.resolve({ success: true })),
    sendPasswordResetCode: vi.fn(() => Promise.resolve({ success: true })),
    sendPasswordChangeConfirmation: vi.fn(() => Promise.resolve({ success: true })),
    sendConsultationConfirmation: vi.fn(() => Promise.resolve({ success: true })),
    sendGoogleMeetLink: vi.fn(() => Promise.resolve({ success: true })),
    generateResetCode: vi.fn(() => '123456')
  }
}))

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ChatProvider>
            {component}
          </ChatProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('End-to-End User Flows', () => {
  describe('Landing Page Flow', () => {
    it('should render landing page with all sections', () => {
      renderWithProviders(<LandingPage />)
      
      // Check for main sections
      expect(screen.getByText(/Opessocius/i)).toBeInTheDocument()
      expect(screen.getByText(/investment/i)).toBeInTheDocument()
      expect(screen.getByText(/performance/i)).toBeInTheDocument()
    })

    it('should have working navigation links', () => {
      renderWithProviders(<LandingPage />)
      
      // Check for navigation links
      const aboutLink = screen.getByText(/About/i)
      const performanceLink = screen.getByText(/Performance/i)
      const contactLink = screen.getByText(/Contact/i)
      
      expect(aboutLink).toBeInTheDocument()
      expect(performanceLink).toBeInTheDocument()
      expect(contactLink).toBeInTheDocument()
    })

    it('should have working CTA buttons', () => {
      renderWithProviders(<LandingPage />)
      
      // Check for call-to-action buttons
      const getStartedButton = screen.getByText(/Get Started/i)
      const loginButton = screen.getByText(/Login/i)
      
      expect(getStartedButton).toBeInTheDocument()
      expect(loginButton).toBeInTheDocument()
    })

    it('should display consultation booking form', () => {
      renderWithProviders(<LandingPage />)
      
      // Check for consultation booking section
      expect(screen.getByText(/Book a Free Consultation/i)).toBeInTheDocument()
      expect(screen.getByText(/Investment Type/i)).toBeInTheDocument()
      expect(screen.getByText(/Date/i)).toBeInTheDocument()
      expect(screen.getByText(/Time/i)).toBeInTheDocument()
    })

    it('should have working floating chat button', () => {
      renderWithProviders(<LandingPage />)
      
      // Check for floating chat button
      const chatButton = screen.getByRole('button', { name: /chat/i })
      expect(chatButton).toBeInTheDocument()
    })
  })

  describe('Registration Flow', () => {
    it('should render registration form with all fields', () => {
      renderWithProviders(<Register />)
      
      // Check for form fields
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Investment Amount/i)).toBeInTheDocument()
    })

    it('should validate form inputs', async () => {
      renderWithProviders(<Register />)
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i })
      fireEvent.click(submitButton)
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/Full name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument()
      })
    })

    it('should handle successful registration', async () => {
      renderWithProviders(<Register />)
      
      // Fill form with valid data
      fireEvent.change(screen.getByLabelText(/Full Name/i), {
        target: { value: 'Test User' }
      })
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/Phone/i), {
        target: { value: '+1234567890' }
      })
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: 'StrongPass123!' }
      })
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
        target: { value: 'StrongPass123!' }
      })
      fireEvent.change(screen.getByLabelText(/Investment Amount/i), {
        target: { value: '10000' }
      })
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i })
      fireEvent.click(submitButton)
      
      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/Registration Successful/i)).toBeInTheDocument()
      })
    })

    it('should validate password strength', async () => {
      renderWithProviders(<Register />)
      
      const passwordInput = screen.getByLabelText(/Password/i)
      fireEvent.change(passwordInput, {
        target: { value: 'weak' }
      })
      
      // Should show password strength feedback
      await waitFor(() => {
        expect(screen.getByText(/Password should be at least 8 characters long/i)).toBeInTheDocument()
      })
    })
  })

  describe('Login Flow', () => {
    it('should render login form with all fields', () => {
      renderWithProviders(<Login />)
      
      // Check for form fields
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
    })

    it('should handle admin login', async () => {
      renderWithProviders(<Login />)
      
      // Fill form with admin credentials
      fireEvent.change(screen.getByLabelText(/Username/i), {
        target: { value: 'admin' }
      })
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: 'CrudeNico' }
      })
      
      const submitButton = screen.getByRole('button', { name: /Sign In/i })
      fireEvent.click(submitButton)
      
      // Should redirect to admin dashboard
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard')
      })
    })

    it('should handle investor login', async () => {
      renderWithProviders(<Login />)
      
      // Fill form with investor credentials
      fireEvent.change(screen.getByLabelText(/Username/i), {
        target: { value: 'testuser' }
      })
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: 'testpass123' }
      })
      
      const submitButton = screen.getByRole('button', { name: /Sign In/i })
      fireEvent.click(submitButton)
      
      // Should redirect to investor dashboard
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard')
      })
    })

    it('should show error for invalid credentials', async () => {
      renderWithProviders(<Login />)
      
      // Fill form with invalid credentials
      fireEvent.change(screen.getByLabelText(/Username/i), {
        target: { value: 'invalid' }
      })
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: 'invalid' }
      })
      
      const submitButton = screen.getByRole('button', { name: /Sign In/i })
      fireEvent.click(submitButton)
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
      })
    })

    it('should have forgot password link', () => {
      renderWithProviders(<Login />)
      
      const forgotPasswordLink = screen.getByText(/Forgot Password/i)
      expect(forgotPasswordLink).toBeInTheDocument()
    })
  })

  describe('Password Reset Flow', () => {
    it('should render forgot password form', () => {
      renderWithProviders(<App />)
      
      // Navigate to forgot password page
      window.history.pushState({}, '', '/forgot-password')
      
      expect(screen.getByText(/Forgot Your Password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    })

    it('should handle password reset request', async () => {
      renderWithProviders(<App />)
      
      // Navigate to forgot password page
      window.history.pushState({}, '', '/forgot-password')
      
      // Fill email
      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'test@example.com' }
      })
      
      const submitButton = screen.getByRole('button', { name: /Send Reset Link/i })
      fireEvent.click(submitButton)
      
      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/Check Your Email/i)).toBeInTheDocument()
      })
    })

    it('should render reset password form', () => {
      renderWithProviders(<App />)
      
      // Navigate to reset password page with token
      window.history.pushState({}, '', '/reset-password?token=test-token')
      
      expect(screen.getByText(/Reset Password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument()
    })
  })

  describe('Dashboard Flow', () => {
    it('should render admin dashboard after login', async () => {
      renderWithProviders(<App />)
      
      // Mock admin login
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userRole', 'admin')
      
      // Navigate to dashboard
      window.history.pushState({}, '', '/dashboard')
      
      await waitFor(() => {
        expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument()
      })
    })

    it('should render investor dashboard after login', async () => {
      renderWithProviders(<App />)
      
      // Mock investor login
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userRole', 'investor')
      localStorage.setItem('currentInvestorId', 'test-investor-id')
      
      // Navigate to dashboard
      window.history.pushState({}, '', '/dashboard')
      
      await waitFor(() => {
        expect(screen.getByText(/Investor Dashboard/i)).toBeInTheDocument()
      })
    })

    it('should have working sidebar navigation', async () => {
      renderWithProviders(<App />)
      
      // Mock admin login
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userRole', 'admin')
      
      // Navigate to dashboard
      window.history.pushState({}, '', '/dashboard')
      
      await waitFor(() => {
        // Check for sidebar navigation items
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
        expect(screen.getByText(/Investors/i)).toBeInTheDocument()
        expect(screen.getByText(/Performance/i)).toBeInTheDocument()
        expect(screen.getByText(/Chat/i)).toBeInTheDocument()
        expect(screen.getByText(/News/i)).toBeInTheDocument()
        expect(screen.getByText(/Consultations/i)).toBeInTheDocument()
      })
    })
  })

  describe('Chat Flow', () => {
    it('should render chat interface', async () => {
      renderWithProviders(<App />)
      
      // Mock admin login
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userRole', 'admin')
      
      // Navigate to chat page
      window.history.pushState({}, '', '/chat')
      
      await waitFor(() => {
        expect(screen.getByText(/Chat/i)).toBeInTheDocument()
      })
    })

    it('should allow sending messages', async () => {
      renderWithProviders(<App />)
      
      // Mock admin login
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userRole', 'admin')
      
      // Navigate to chat page
      window.history.pushState({}, '', '/chat')
      
      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText(/Type your message/i)
        const sendButton = screen.getByRole('button', { name: /Send/i })
        
        fireEvent.change(messageInput, {
          target: { value: 'Test message' }
        })
        fireEvent.click(sendButton)
        
        expect(messageInput.value).toBe('')
      })
    })
  })

  describe('Performance Tracking Flow', () => {
    it('should render performance page', async () => {
      renderWithProviders(<App />)
      
      // Mock admin login
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userRole', 'admin')
      
      // Navigate to performance page
      window.history.pushState({}, '', '/performance')
      
      await waitFor(() => {
        expect(screen.getByText(/Investment Performance/i)).toBeInTheDocument()
      })
    })

    it('should allow adding performance entries', async () => {
      renderWithProviders(<App />)
      
      // Mock admin login
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userRole', 'admin')
      
      // Navigate to performance page
      window.history.pushState({}, '', '/performance')
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /Add Entry/i })
        fireEvent.click(addButton)
        
        // Should show add entry form
        expect(screen.getByText(/Add Performance Entry/i)).toBeInTheDocument()
      })
    })
  })

  describe('Investor Management Flow', () => {
    it('should render investors page', async () => {
      renderWithProviders(<App />)
      
      // Mock admin login
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userRole', 'admin')
      
      // Navigate to investors page
      window.history.pushState({}, '', '/investors')
      
      await waitFor(() => {
        expect(screen.getByText(/Investors/i)).toBeInTheDocument()
      })
    })

    it('should allow adding new investors', async () => {
      renderWithProviders(<App />)
      
      // Mock admin login
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userRole', 'admin')
      
      // Navigate to investors page
      window.history.pushState({}, '', '/investors')
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /Add Investor/i })
        fireEvent.click(addButton)
        
        // Should show add investor form
        expect(screen.getByText(/Add New Investor/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 errors gracefully', () => {
      renderWithProviders(<App />)
      
      // Navigate to non-existent page
      window.history.pushState({}, '', '/non-existent-page')
      
      expect(screen.getByText(/404/i)).toBeInTheDocument()
      expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument()
    })

    it('should handle network errors gracefully', async () => {
      renderWithProviders(<App />)
      
      // Mock network error
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))
      
      // Navigate to dashboard
      window.history.pushState({}, '', '/dashboard')
      
      await waitFor(() => {
        expect(screen.getByText(/Error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(<LandingPage />)
      
      // Check for ARIA labels
      const elements = screen.getAllByRole('button')
      elements.forEach(element => {
        expect(element).toHaveAttribute('aria-label')
      })
    })

    it('should support keyboard navigation', () => {
      renderWithProviders(<Login />)
      
      const usernameInput = screen.getByLabelText(/Username/i)
      const passwordInput = screen.getByLabelText(/Password/i)
      
      // Tab navigation should work
      usernameInput.focus()
      expect(usernameInput).toHaveFocus()
      
      fireEvent.keyDown(usernameInput, { key: 'Tab' })
      expect(passwordInput).toHaveFocus()
    })

    it('should have proper focus management', () => {
      renderWithProviders(<Register />)
      
      const nameInput = screen.getByLabelText(/Full Name/i)
      nameInput.focus()
      
      expect(nameInput).toHaveFocus()
      expect(nameInput).toHaveAttribute('tabindex', '0')
    })
  })
})
