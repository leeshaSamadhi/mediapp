import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import CenterContainer from '../components/layout/CenterContainer'
import Icon from '../components/ui/Icon'
import useAuth from '../hooks/useAuth'
import useFingerprintAuth from '../hooks/useFingerprintAuth'

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    dob: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signup, updateFingerprintCredential } = useAuth()
  const { registerFingerprint, isSupported, isAuthenticating } = useFingerprintAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { fullName, email, phone, password, dob } = formData
    if (!fullName || !email || !phone || !password || !dob) {
      setError('Please fill in all fields')
      return
    }

    const success = signup({
      fullName,
      email,
      phone,
      password,
      dob,
      avatarUrl: ''
    })

    if (success) {
      navigate('/home')
    } else {
      setError('Failed to create account')
    }
  }

  const handleFingerprintSignup = async () => {
    setError('')
    setIsLoading(true)

    try {
      // Check if fingerprint is supported
      if (!isSupported) {
        setError('Fingerprint authentication is not supported on this device')
        setIsLoading(false)
        return
      }

      // Validate required fields
      const { fullName, email, phone, password, dob } = formData
      if (!fullName || !email || !phone || !password || !dob) {
        setError('Please fill in all fields before registering fingerprint')
        setIsLoading(false)
        return
      }

      // Generate user ID for registration
      const userId = `user-${Date.now()}`

      // Register fingerprint
      const result = await registerFingerprint(email, fullName, userId)
      
      if (result.success && result.credentialId) {
        // Create user account with fingerprint credential
        const success = signup({
          fullName,
          email,
          phone,
          password,
          dob,
          avatarUrl: '',
          fingerprintRegistered: true,
          fingerprintCredentialId: result.credentialId
        })

        if (success) {
          navigate('/home')
        } else {
          setError('Failed to create account')
        }
      } else {
        setError(result.error || 'Fingerprint registration failed')
      }
    } catch (error) {
      console.error('Fingerprint signup error:', error)
      setError('An error occurred during fingerprint registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CenterContainer>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h1>
        <p className="text-gray-600">Sign up to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange}
        />

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />

        <Input
          label="Mobile"
          type="tel"
          name="phone"
          placeholder="Enter your mobile number"
          value={formData.phone}
          onChange={handleChange}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          showPasswordToggle
        />

        <Input
          label="Date of Birth"
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
        />

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <p className="text-xs text-gray-500 text-center">
          By continuing, you agree to our{' '}
          <a href="#" className="text-primary hover:underline">Terms of Use</a>
          {' '}and{' '}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </p>

        <Button type="submit" variant="primary" fullWidth>
          Sign up
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            className="flex-1 flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Icon name="google" size="md" className="mr-2" />
            <span className="text-sm font-medium text-gray-700">Google</span>
          </button>
          
          <button
            type="button"
            onClick={handleFingerprintSignup}
            disabled={isLoading || isAuthenticating}
            className="flex-1 flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="fingerprint" size="md" className="mr-2" />
            <span className="text-sm font-medium text-gray-700">
              {isLoading || isAuthenticating ? 'Registering...' : 'Fingerprint'}
            </span>
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </CenterContainer>
  )
}

export default SignUp