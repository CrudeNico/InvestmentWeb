import React, { useState } from 'react'
import { Mail, CheckCircle, XCircle } from 'lucide-react'
import emailService from '../firebase/emailService'

const TestEmailButton = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleTestEmail = async () => {
    if (!email) {
      setResult({ success: false, error: 'Please enter an email address' })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await emailService.sendTestEmail(email)
      setResult(response)
    } catch (error) {
      setResult({ success: false, error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Test Email Service</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email to test"
          />
        </div>

        <button
          onClick={handleTestEmail}
          disabled={isLoading || !email}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Sending Test Email...</span>
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              <span>Send Test Email</span>
            </>
          )}
        </button>

        {result && (
          <div className={`p-3 rounded-lg flex items-center space-x-2 ${
            result.success 
              ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
            {result.success ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span className="text-sm">
              {result.success 
                ? 'Test email sent successfully! Check your inbox.' 
                : result.error
              }
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestEmailButton
