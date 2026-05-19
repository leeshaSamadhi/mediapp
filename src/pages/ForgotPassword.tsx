import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import CenterContainer from '../components/layout/CenterContainer'
import useAuth from '../hooks/useAuth'

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'email' | 'token'>('email')
  const [email, setEmail] = useState('')
  const [generatedToken, setGeneratedToken] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { generateResetToken } = useAuth()
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

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const token = generateResetToken(email)
    if (token) {
      setGeneratedToken(token)
      setStep('token')
    } else {
      setError('Email not found. Please check your email address.')
    }
    setIsLoading(false)
  }

  const handleTokenClick = () => {
    navigate(`/reset-password?token=${generatedToken}`)
  }

  if (step === 'token') {
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
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-600 mb-4">
            For testing purposes, here's your reset token. In a real app, this would be sent to your email.
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-500 mb-2">Reset Token:</p>
            <code className="text-sm font-mono text-blue-600 break-all">{generatedToken}</code>
          </div>
          <Button onClick={handleTokenClick} variant="primary" fullWidth>
            Use Reset Token
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Didn't receive the email? Check your spam folder or
          </p>
          <Button onClick={() => setStep('email')} variant="ghost" fullWidth>
            Try Again
          </Button>
        </div>
      </CenterContainer>
    )
  }

  return (
    <CenterContainer>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
        <p className="text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
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
          {isLoading ? 'Sending...' : 'Send Reset Link'}
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
