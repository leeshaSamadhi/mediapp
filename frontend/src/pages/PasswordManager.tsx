import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Icon from '../components/ui/Icon'
import Navbar from '../components/ui/Navbar'
import useAuth from '../hooks/useAuth'

const PasswordManager: React.FC = () => {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handlePasswordChange = async () => {
    setError('')
    setSuccess('')

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

    const success = await resetPassword(newPassword)
    if (success) {
      setSuccess('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setError('Failed to update password')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/home/settings')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3"
          >
            <Icon name="chevronLeft" size="md" className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Password Manager</h1>
        </div>

        {/* Password Change Card */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h2>
          <div className="space-y-4">
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <Button variant="primary" onClick={handlePasswordChange} className="bg-primary-dark hover:bg-[#1d3a06]">
              Update Password
            </Button>
          </div>
        </Card>
      </div>
      <Navbar />
    </div>
  )
}

export default PasswordManager