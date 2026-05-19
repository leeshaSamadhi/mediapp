import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import CenterContainer from '../components/layout/CenterContainer'
import useAuth from '../hooks/useAuth'

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [searchParams] = useSearchParams()
  const { verifyResetToken, resetPasswordWithToken } = useAuth()
  const navigate = useNavigate()

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setIsValidToken(false)
      setError('No reset token provided')
      return
    }

    const verification = verifyResetToken(token)
    if (verification.valid) {
      setIsValidToken(true)
    } else {
      setIsValidToken(false)
      setError(verification.error || 'Invalid reset token')
    }
  }, [token, verifyResetToken])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!token) {
      setError('No reset token found')
      return
    }

    const success = resetPasswordWithToken(token, newPassword)
    if (success) {
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } else {
      setError('Failed to reset password. Token may have expired.')
    }
  }

  if (isValidToken === null) {
    return (
      <CenterContainer>
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying Token...</h1>
          <p className="text-gray-600">Please wait while we verify your reset token.</p>
        </div>
      </CenterContainer>
    )
  }

  if (!isValidToken) {
    return (
      <CenterContainer>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Reset Link</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/forgot-password')} variant="primary">
            Request New Reset Link
          </Button>
        </div>
      </CenterContainer>
    )
  }

  if (success) {
    return (
      <CenterContainer>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Password Reset Successful!</h1>
          <p className="text-gray-600 mb-4">Your password has been updated successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </CenterContainer>
    )
  }

  return (
    <CenterContainer>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Create New Password</h1>
        <p className="text-gray-600">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="New Password"
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          showPasswordToggle
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          showPasswordToggle
        />

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <Button type="submit" variant="primary" fullWidth>
          Reset Password
        </Button>
      </form>
    </CenterContainer>
  )
}

export default ResetPassword