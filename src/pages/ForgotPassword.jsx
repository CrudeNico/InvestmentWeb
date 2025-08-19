import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import emailService from '../firebase/emailService'
import { generateSecureToken, encryptForURL } from '../utils/security'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Check if user exists in database (try both users and investors collections)
      let userDoc = null
      let userId = null
      let collectionName = null
      
      // First try investors collection
      const investorsRef = collection(db, 'investors')
      const investorsQuery = query(investorsRef, where('email', '==', email))
      const investorsSnapshot = await getDocs(investorsQuery)
      
      if (!investorsSnapshot.empty) {
        userDoc = investorsSnapshot.docs[0]
        userId = userDoc.id
        collectionName = 'investors'
      } else {
        // Try users collection
        const usersRef = collection(db, 'users')
        const usersQuery = query(usersRef, where('email', '==', email))
        const usersSnapshot = await getDocs(usersQuery)
        
        if (!usersSnapshot.empty) {
          userDoc = usersSnapshot.docs[0]
          userId = userDoc.id
          collectionName = 'users'
        } else {
          setError('No account found with this email address.')
          return
        }
      }

      // Generate a secure reset token and encrypt it
      const resetToken = generateSecureToken(32)
      const encryptedToken = encryptForURL(resetToken)
      
      // Save reset token to database
      await updateDoc(doc(db, collectionName, userId), {
        resetToken: resetToken,
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry
      })
      
      // Send password reset email with encrypted token
      await emailService.sendPasswordResetEmail(email, encryptedToken)
      
      setIsSuccess(true)
    } catch (error) {
      console.error('Error sending password reset email:', error)
      setError('Failed to send password reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Check Your Email!</h2>
            <p className="text-white/70 mb-6">
              We've sent a password reset link to <strong>{email}</strong>. Please check your email and click the link to reset your password.
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <Link 
            to="/" 
            className="text-2xl font-bold text-white hover:text-blue-400 transition-colors"
          >
            Opessocius
          </Link>
        </div>
        
        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Forgot Your Password?</h2>
            <p className="text-white/70">Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <Mail className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
