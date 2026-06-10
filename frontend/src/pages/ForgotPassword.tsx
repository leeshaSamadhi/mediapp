import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import CenterContainer from '../components/layout/CenterContainer'
import { resetPasswordApi } from '../services/api'

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const navigate = useNavigate()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email) {
      setError('Please enter your email address')
      setIsLoading(false)
      return
    }

    try {
      await resetPasswordApi.requestCode(email)
      setCodeSent(true)
    } catch (err: any) {
      // Always show success message to prevent email enumeration
      setCodeSent(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinueToCode = () => {
    navigate('/verify-reset-code', { state: { email } })
  }

  if (codeSent) {
    return (
      <CenterContainer>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h1>
          <p className="text-gray-600 mb-6">
            We've sent a 6-digit verification code to <strong>{email}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <Button onClick={handleContinueToCode} variant="primary" fullWidth>
            Enter Verification Code
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              Didn't receive the code? Check your spam folder or
            </p>
            <button
              onClick={() => { setCodeSent(false); setError('') }}
              className="text-sm text-primary font-medium hover:underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </CenterContainer>
    )
  }

  return (
    <CenterContainer>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
        <p className="text-gray-600">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Verification Code'}
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-primary font-medium hover:underline"
          >
            Back to Login
          </button>
        </p>
      </div>
    </CenterContainer>
  )
}

export default ForgotPassword