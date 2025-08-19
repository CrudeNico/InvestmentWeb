import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import InvestmentPerformance from './pages/InvestmentPerformance'
import Investors from './pages/Investors'
import InvestorDashboard from './pages/InvestorDashboard'
import MarketNews from './pages/MarketNews'
import Chat from './pages/Chat'
import Consultations from './pages/Consultations'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import PerformancePage from './pages/PerformancePage'
import InvestmentCalculator from './pages/InvestmentCalculator'
import ContactPage from './pages/ContactPage'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import ForgotPassword from './pages/ForgotPassword'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { ChatProvider } from './contexts/ChatContext'
import ErrorBoundary from './components/ErrorBoundary'

function AppContent() {
  const { isAuthenticated, isInvestor } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <Routes>
      {/* Landing Pages - Public Access */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/performance-public" element={<PerformancePage />} />
      <Route path="/calculator" element={<InvestmentCalculator />} />
      <Route path="/contact" element={<ContactPage />} />
      
      {/* Login Page */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
      
      {/* Register Page */}
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} />
      
      {/* Forgot Password Page */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Reset Password Page */}
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={
        isAuthenticated ? (
          <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                {isInvestor() ? <InvestorDashboard /> : <Dashboard />}
              </main>
            </div>
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="/performance" element={
        isAuthenticated ? (
          <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                <InvestmentPerformance />
              </main>
            </div>
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="/investors" element={
        isAuthenticated ? (
          <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                <Investors />
              </main>
            </div>
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="/market-news" element={
        isAuthenticated ? (
          <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                <MarketNews />
              </main>
            </div>
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="/consultations" element={
        isAuthenticated ? (
          <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                <Consultations />
              </main>
            </div>
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      <Route path="/chat" element={
        isAuthenticated ? (
          <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                <Chat />
              </main>
            </div>
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      {/* Redirect any unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <DataProvider>
            <ChatProvider>
              <AppContent />
            </ChatProvider>
          </DataProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
