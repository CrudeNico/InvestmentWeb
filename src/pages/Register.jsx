import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, Euro, ArrowLeft } from 'lucide-react'
import emailService from '../firebase/emailService'
import { useData } from '../contexts/DataContext'
import { hashPassword, validatePasswordStrength } from '../utils/security'

const Register = () => {
  const navigate = useNavigate()
  const { addInvestor } = useData()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    investmentAmount: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      const passwordValidation = validatePasswordStrength(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.feedback.join(', ')
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.investmentAmount) {
      newErrors.investmentAmount = 'Investment amount is required'
    } else if (isNaN(formData.investmentAmount) || parseFloat(formData.investmentAmount) < 1000) {
      newErrors.investmentAmount = 'Minimum investment amount is €1,000'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      // Hash the password before saving
      const hashedPassword = await hashPassword(formData.password)
      
      // Create investor data
      const investorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        username: formData.email.split('@')[0], // Use email prefix as username
        password: hashedPassword, // Store hashed password
        investmentAmount: parseFloat(formData.investmentAmount),
        initiationDate: new Date().toISOString(),
        profilePicture: ''
      }

      // Add investor to the system
      await addInvestor(investorData)

      // Send welcome email to user
      await emailService.sendWelcomeEmail(formData.email, formData.name)
      
      setIsSuccess(true)
      
      // Redirect to login after 5 seconds
      setTimeout(() => {
        navigate('/login')
      }, 5000)
      
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: 'Registration failed. Please try again.' })
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
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Registration Successful!</h2>
            <p className="text-white/70 mb-4">
              Your account has been created successfully! Please check your email for confirmation.
            </p>
            <p className="text-white/60 text-sm mb-6">
              You'll be redirected to login in a few seconds...
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-white/20 rounded mb-2"></div>
              <div className="h-2 bg-white/20 rounded w-3/4"></div>
            </div>
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
            className="inline-flex items-center space-x-2 text-white/70 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-white/70">Join Opessocius and start your investment journey</p>
        </div>

        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {errors.general}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-white font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                    errors.name ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-white font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                    errors.email ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-white font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                    errors.phone ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="investmentAmount" className="block text-white font-medium mb-2">
                Initial Investment Amount (€)
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type="number"
                  id="investmentAmount"
                  name="investmentAmount"
                  value={formData.investmentAmount}
                  onChange={handleChange}
                  min="1000"
                  step="100"
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                    errors.investmentAmount ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Minimum €1,000"
                />
              </div>
              {errors.investmentAmount && <p className="text-red-400 text-sm mt-1">{errors.investmentAmount}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-white font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                    errors.password ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-white font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                    errors.confirmPassword ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/70">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
