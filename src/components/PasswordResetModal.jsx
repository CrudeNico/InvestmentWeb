import React, { useState } from 'react'
import { X, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { auth } from '../firebase/config'
import { updatePassword } from 'firebase/auth'
import emailService from '../firebase/emailService'
import { generateSecureToken, hashPassword } from '../utils/security'

const PasswordResetModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1) // 1: email, 2: code, 3: new password, 4: success
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSendCode = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setErrors({ email: 'Email is required' })
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email' })
      return
    }

    setIsLoading(true)
    try {
      console.log('🔄 Generating reset code for email:', email);
      
      // Generate reset code
      const resetCode = emailService.generateResetCode()
      console.log('🔢 Generated reset code:', resetCode);
      
      // Find user by email in both collections
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
          setErrors({ email: 'No account found with this email address.' })
          return
        }
      }
      
      // Save reset code to database with expiry (10 minutes)
      const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      await updateDoc(doc(db, collectionName, userId), {
        resetCode: resetCode,
        resetCodeExpiry: resetCodeExpiry,
        updatedAt: new Date()
      })
      
      // Send password reset code
      const result = await emailService.sendPasswordResetCode(email, resetCode)
      console.log('📧 Email service result:', result);
      
      if (result.success) {
        setStep(2)
        setErrors({})
      } else {
        setErrors({ general: result.message })
      }
    } catch (error) {
      console.error('❌ Error in handleSendCode:', error);
      setErrors({ general: 'Failed to send code. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (!code.trim()) {
      setErrors({ code: 'Verification code is required' })
      return
    }
    if (code.length !== 6) {
      setErrors({ code: 'Code must be 6 digits' })
      return
    }

    setIsLoading(true)
    try {
      // Find user by email and verify the reset code in both collections
      let userDoc = null
      let userData = null
      let collectionName = null
      
      // First try investors collection
      const investorsRef = collection(db, 'investors')
      const investorsQuery = query(investorsRef, where('email', '==', email))
      const investorsSnapshot = await getDocs(investorsQuery)
      
      if (!investorsSnapshot.empty) {
        userDoc = investorsSnapshot.docs[0]
        userData = userDoc.data()
        collectionName = 'investors'
      } else {
        // Try users collection
        const usersRef = collection(db, 'users')
        const usersQuery = query(usersRef, where('email', '==', email))
        const usersSnapshot = await getDocs(usersQuery)
        
        if (!usersSnapshot.empty) {
          userDoc = usersSnapshot.docs[0]
          userData = userDoc.data()
          collectionName = 'users'
        } else {
          setErrors({ code: 'Invalid code. Please try again.' })
          return
        }
      }
      
      // Check if the reset code matches
      if (userData.resetCode !== code) {
        setErrors({ code: 'Invalid code. Please try again.' })
        return
      }

      // Check if code has expired (10 minutes)
      if (userData.resetCodeExpiry && new Date() > userData.resetCodeExpiry.toDate()) {
        setErrors({ code: 'Code has expired. Please request a new code.' })
        return
      }

      setStep(3)
      setErrors({})
    } catch (error) {
      console.error('Error verifying code:', error)
      setErrors({ code: 'Invalid code. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!newPassword) {
      setErrors({ newPassword: 'New password is required' })
      return
    }
    if (newPassword.length < 6) {
      setErrors({ newPassword: 'Password must be at least 6 characters' })
      return
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    setIsLoading(true)
    try {
      // Find user by email in both collections
      let userDoc = null
      let userData = null
      let collectionName = null
      
      // First try investors collection
      const investorsRef = collection(db, 'investors')
      const investorsQuery = query(investorsRef, where('email', '==', email))
      const investorsSnapshot = await getDocs(investorsQuery)
      
      if (!investorsSnapshot.empty) {
        userDoc = investorsSnapshot.docs[0]
        userData = userDoc.data()
        collectionName = 'investors'
      } else {
        // Try users collection
        const usersRef = collection(db, 'users')
        const usersQuery = query(usersRef, where('email', '==', email))
        const usersSnapshot = await getDocs(usersQuery)
        
        if (!usersSnapshot.empty) {
          userDoc = usersSnapshot.docs[0]
          userData = userDoc.data()
          collectionName = 'users'
        } else {
          setErrors({ general: 'User not found. Please try again.' })
          return
        }
      }

      // Hash the new password before saving
      const hashedPassword = await hashPassword(newPassword)
      
      // Update password in Firestore and clear reset code
      await updateDoc(doc(db, collectionName, userDoc.id), {
        password: hashedPassword,
        resetCode: null, // Clear the reset code
        resetCodeExpiry: null, // Clear the expiry
        updatedAt: new Date()
      })

      // Update password in Firebase Auth if user is currently authenticated
      if (auth.currentUser && auth.currentUser.email === email) {
        await updatePassword(auth.currentUser, newPassword)
      }

      // Send confirmation email
      await emailService.sendPasswordChangeConfirmation(email, userData.name || userData.username)

      setStep(4)
      setErrors({})
    } catch (error) {
      console.error('Error resetting password:', error)
      setErrors({ general: 'Failed to reset password. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setEmail('')
    setCode('')
    setNewPassword('')
    setConfirmPassword('')
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <p className="text-gray-600">Enter your email address to receive a verification code.</p>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <p className="text-gray-600">We've sent a 6-digit code to <strong>{email}</strong></p>
              
              <div>
                <label htmlFor="code" className="block text-gray-700 font-medium mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono ${
                    errors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="000000"
                  maxLength={6}
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-gray-600">Create a new password for your account.</p>
              
              <div>
                <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Password Reset Successful!</h3>
              <p className="text-gray-600">Your password has been updated successfully.</p>
              <button
                onClick={handleClose}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {errors.general && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errors.general}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PasswordResetModal
