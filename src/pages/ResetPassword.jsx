import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { auth } from '../firebase/config'
import { updatePassword } from 'firebase/auth'
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import emailService from '../firebase/emailService'
import { decryptFromURL, hashPassword } from '../utils/security'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  })

  const encryptedToken = searchParams.get('token')
  const token = encryptedToken ? decryptFromURL(encryptedToken) : null

  useEffect(() => {
    if (!encryptedToken) {
      setError('Invalid or missing reset token. Please request a new password reset.')
    } else if (!token) {
      setError('Invalid or corrupted reset token. Please request a new password reset.')
    }
  }, [encryptedToken, token])

  const checkPasswordStrength = (password) => {
    const feedback = []
    let score = 0

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('At least 8 characters')
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('At least one lowercase letter')
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('At least one uppercase letter')
    }

    if (/[0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push('At least one number')
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push('At least one special character')
    }

    return { score, feedback }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!encryptedToken || !token) {
      setError('Invalid or corrupted reset token')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordStrength.score < 3) {
      setError('Password is too weak. Please choose a stronger password.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Decrypt the token from URL
      const decryptedToken = decryptFromURL(token)
      if (!decryptedToken) {
        setError('Invalid reset token. Please request a new password reset.')
        return
      }
      
      // Find user by decrypted token in both collections
      let userDoc = null
      let userData = null
      let collectionName = null
      
      // First try investors collection
      const investorsRef = collection(db, 'investors')
      const investorsQuery = query(investorsRef, where('resetToken', '==', decryptedToken))
      const investorsSnapshot = await getDocs(investorsQuery)
      
      if (!investorsSnapshot.empty) {
        userDoc = investorsSnapshot.docs[0]
        userData = userDoc.data()
        collectionName = 'investors'
      } else {
        // Try users collection
        const usersRef = collection(db, 'users')
        const usersQuery = query(usersRef, where('resetToken', '==', decryptedToken))
        const usersSnapshot = await getDocs(usersQuery)
        
        if (!usersSnapshot.empty) {
          userDoc = usersSnapshot.docs[0]
          userData = userDoc.data()
          collectionName = 'users'
        } else {
          setError('Invalid or expired reset token. Please request a new password reset.')
          return
        }
      }

      // Check if token has expired
      if (userData.resetTokenExpiry && new Date() > userData.resetTokenExpiry.toDate()) {
        setError('Reset token has expired. Please request a new password reset.')
        return
      }

      // Hash the new password before saving
      const hashedPassword = await hashPassword(formData.password)
      
      // Update password in Firestore
      await updateDoc(doc(db, collectionName, userDoc.id), {
        password: hashedPassword,
        resetToken: null, // Clear the reset token
        updatedAt: new Date()
      })

      // Update password in Firebase Auth if user is currently authenticated
      if (auth.currentUser && auth.currentUser.email === userData.email) {
        await updatePassword(auth.currentUser, formData.password)
      }

      // Send confirmation email
      await emailService.sendPasswordChangeConfirmation(userData.email, userData.name || userData.username)

      setIsSuccess(true)
    } catch (error) {
      console.error('Error resetting password:', error)
      setError('Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'text-red-500'
    if (passwordStrength.score <= 3) return 'text-yellow-500'
    if (passwordStrength.score <= 4) return 'text-blue-500'
    return 'text-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return 'Weak'
    if (passwordStrength.score <= 3) return 'Fair'
    if (passwordStrength.score <= 4) return 'Good'
    return 'Strong'
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Password Reset Successful!</h2>
            <p className="text-white/70 mb-6">
              Your password has been successfully updated. You can now log in with your new password.
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <span>Go to Login</span>
              <ArrowRight className="h-4 w-4" />
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
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Reset Your Password</h2>
            <p className="text-white/70">Enter your new password below</p>
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
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Password strength:</span>
                    <span className={`font-medium ${getPasswordStrengthColor()}`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-white/20 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        passwordStrength.score <= 2 ? 'bg-red-500' :
                        passwordStrength.score <= 3 ? 'bg-yellow-500' :
                        passwordStrength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="mt-2 text-xs text-white/60 space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {formData.confirmPassword && (
                <div className="mt-2">
                  {formData.password === formData.confirmPassword ? (
                    <div className="flex items-center space-x-2 text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>Passwords match</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-red-400 text-sm">
                      <XCircle className="h-4 w-4" />
                      <span>Passwords do not match</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword || passwordStrength.score < 3}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Resetting Password...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="h-4 w-4" />
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

export default ResetPassword
