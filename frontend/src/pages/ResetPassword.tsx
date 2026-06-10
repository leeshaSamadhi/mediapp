import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import CenterContainer from '../components/layout/CenterContainer'
import { resetPasswordApi } from '../services/api'

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const resetToken = (location.state as { resetToken?: string })?.resetToken
  const email = (location.state as { email?: string })?.email

  useEffect(() => {
    if (!resetToken) {
      navigate('/forgot-password')
    }
  }, [resetToken, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!resetToken) {
      setError('Reset session expired. Please start over.')
      return
    }

    setIsLoading(true)

    try {
      await resetPasswordApi.resetPassword(resetToken, newPassword)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Token may have expired.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!resetToken) return null

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
        <p className="text-gray-600">
          {email ? `Resetting password for ${email}` : 'Enter your new password below'}
        </p>
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

        <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </CenterContainer>
  )
}

export default ResetPassword