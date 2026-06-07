import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import CenterContainer from '../components/layout/CenterContainer'
import Icon from '../components/ui/Icon'
import useAuth from '../hooks/useAuth'
import useFingerprintAuth from '../hooks/useFingerprintAuth'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, findUserByCredentialId } = useAuth()
  const { authenticateWithFingerprint, isSupported, isAuthenticating } = useFingerprintAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Pre-populate email from signup page
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
    }
  }, [location.state])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    const success = await login(email, password)
    if (success) {
      navigate('/home')
    } else {
      setError('Invalid email/mobile or password')
    }
  }

  const handleFingerprintLogin = async () => {
    setError('')
    setIsLoading(true)

    try {
      // Check if fingerprint is supported
      if (!isSupported) {
        setError('Fingerprint authentication is not supported on this device')
        setIsLoading(false)
        return
      }

      // For login, we need to find the user first
      // In a real app, you'd have a way to identify the user (email/phone)
      // For now, we'll check if there's a stored user with fingerprint
      const storedUser = localStorage.getItem('MEDI_USER')
      if (!storedUser) {
        setError('No user found. Please sign up first.')
        setIsLoading(false)
        return
      }

      const user = JSON.parse(storedUser)
      if (!user.fingerprintCredentialId) {
        setError('Fingerprint not registered for this account. Please use password to login.')
        setIsLoading(false)
        return
      }

      // Authenticate with fingerprint
      const result = await authenticateWithFingerprint(user.fingerprintCredentialId)
      
      if (result.success) {
        // Find user by credential ID and log them in
        const foundUser = findUserByCredentialId(result.credentialId!)
        if (foundUser) {
          localStorage.setItem('CURRENT_USER', JSON.stringify(foundUser))
          navigate('/home')
        } else {
          setError('User not found')
        }
      } else {
        setError(result.error || 'Fingerprint authentication failed')
      }
    } catch (error) {
      console.error('Fingerprint login error:', error)
      setError('An error occurred during fingerprint authentication')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CenterContainer>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email or Mobile"
          type="text"
          placeholder="Enter your email or mobile"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showPasswordToggle
        />

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" variant="primary" fullWidth>
          Login
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
            onClick={handleFingerprintLogin}
            disabled={isLoading || isAuthenticating}
            className="flex-1 flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="fingerprint" size="md" className="mr-2" />
            <span className="text-sm font-medium text-gray-700">
              {isLoading || isAuthenticating ? 'Authenticating...' : 'Fingerprint'}
            </span>
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </CenterContainer>
  )
}

export default Login