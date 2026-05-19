import { useState, useEffect, useCallback } from 'react'
import { User } from '../models/types'

interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    currentUser: null,
    isAuthenticated: false,
    isLoading: true
  })

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('CURRENT_USER')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User
        setAuthState({
          currentUser: user,
          isAuthenticated: true,
          isLoading: false
        })
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('CURRENT_USER')
        setAuthState({
          currentUser: null,
          isAuthenticated: false,
          isLoading: false
        })
      }
    } else {
      setAuthState({
        currentUser: null,
        isAuthenticated: false,
        isLoading: false
      })
    }
  }, [])

  // Login function
  const login = useCallback((email: string, password: string): boolean => {
    const storedUser = localStorage.getItem('MEDI_USER')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User
        if ((user.email === email || user.phone === email) && user.password === password) {
          localStorage.setItem('CURRENT_USER', JSON.stringify(user))
          setAuthState({
            currentUser: user,
            isAuthenticated: true,
            isLoading: false
          })
          return true
        }
      } catch (error) {
        console.error('Error during login:', error)
      }
    }
    return false
  }, [])

  // Signup function
  const signup = useCallback((userData: Omit<User, 'id'>): boolean => {
    try {
      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`
      }
      localStorage.setItem('MEDI_USER', JSON.stringify(newUser))
      localStorage.setItem('CURRENT_USER', JSON.stringify(newUser))
      setAuthState({
        currentUser: newUser,
        isAuthenticated: true,
        isLoading: false
      })
      return true
    } catch (error) {
      console.error('Error during signup:', error)
      return false
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('CURRENT_USER')
    setAuthState({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false
    })
  }, [])

  // Update user profile
  const updateProfile = useCallback((updatedData: Partial<User>): boolean => {
    if (!authState.currentUser) return false
    
    try {
      const updatedUser = { ...authState.currentUser, ...updatedData }
      localStorage.setItem('MEDI_USER', JSON.stringify(updatedUser))
      localStorage.setItem('CURRENT_USER', JSON.stringify(updatedUser))
      setAuthState(prev => ({
        ...prev,
        currentUser: updatedUser
      }))
      return true
    } catch (error) {
      console.error('Error updating profile:', error)
      return false
    }
  }, [authState.currentUser])

  // Generate reset token for password reset
  const generateResetToken = useCallback((email: string): string | null => {
    try {
      const storedUser = localStorage.getItem('MEDI_USER')
      if (!storedUser) return null
      
      const user = JSON.parse(storedUser) as User
      if (user.email !== email) return null
      
      // Generate a unique token
      const token = `reset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const expiration = Date.now() + 15 * 60 * 1000 // 15 minutes
      
      // Store token with email and expiration
      const tokenData = {
        email,
        token,
        expiration
      }
      localStorage.setItem('RESET_TOKEN', JSON.stringify(tokenData))
      
      return token
    } catch (error) {
      console.error('Error generating reset token:', error)
      return null
    }
  }, [])

  // Verify reset token
  const verifyResetToken = useCallback((token: string): { valid: boolean; email?: string; error?: string } => {
    try {
      const storedToken = localStorage.getItem('RESET_TOKEN')
      if (!storedToken) {
        return { valid: false, error: 'No reset token found' }
      }
      
      const tokenData = JSON.parse(storedToken)
      
      if (tokenData.token !== token) {
        return { valid: false, error: 'Invalid reset token' }
      }
      
      if (Date.now() > tokenData.expiration) {
        localStorage.removeItem('RESET_TOKEN')
        return { valid: false, error: 'Reset token has expired' }
      }
      
      return { valid: true, email: tokenData.email }
    } catch (error) {
      console.error('Error verifying reset token:', error)
      return { valid: false, error: 'Error verifying token' }
    }
  }, [])

  // Reset password with token
  const resetPasswordWithToken = useCallback((token: string, newPassword: string): boolean => {
    try {
      const verification = verifyResetToken(token)
      if (!verification.valid || !verification.email) {
        return false
      }
      
      const storedUser = localStorage.getItem('MEDI_USER')
      if (!storedUser) return false
      
      const user = JSON.parse(storedUser) as User
      if (user.email !== verification.email) return false
      
      // Update password
      const updatedUser = { ...user, password: newPassword }
      localStorage.setItem('MEDI_USER', JSON.stringify(updatedUser))
      
      // Remove used token
      localStorage.removeItem('RESET_TOKEN')
      
      return true
    } catch (error) {
      console.error('Error resetting password with token:', error)
      return false
    }
  }, [verifyResetToken])

  // Reset password (legacy - for logged in users)
  const resetPassword = useCallback((newPassword: string): boolean => {
    if (!authState.currentUser) return false
    
    try {
      const updatedUser = { ...authState.currentUser, password: newPassword }
      localStorage.setItem('MEDI_USER', JSON.stringify(updatedUser))
      localStorage.setItem('CURRENT_USER', JSON.stringify(updatedUser))
      setAuthState(prev => ({
        ...prev,
        currentUser: updatedUser
      }))
      return true
    } catch (error) {
      console.error('Error resetting password:', error)
      return false
    }
  }, [authState.currentUser])

  // Find user by fingerprint credential ID
  const findUserByCredentialId = useCallback((credentialId: string): User | null => {
    const storedUser = localStorage.getItem('MEDI_USER')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User
        if (user.fingerprintCredentialId === credentialId) {
          return user
        }
      } catch (error) {
        console.error('Error finding user by credential ID:', error)
      }
    }
    return null
  }, [])

  // Update user with fingerprint credential
  const updateFingerprintCredential = useCallback((credentialId: string): boolean => {
    if (!authState.currentUser) return false
    
    try {
      const updatedUser = { 
        ...authState.currentUser, 
        fingerprintRegistered: true,
        fingerprintCredentialId: credentialId
      }
      localStorage.setItem('MEDI_USER', JSON.stringify(updatedUser))
      localStorage.setItem('CURRENT_USER', JSON.stringify(updatedUser))
      setAuthState(prev => ({
        ...prev,
        currentUser: updatedUser
      }))
      return true
    } catch (error) {
      console.error('Error updating fingerprint credential:', error)
      return false
    }
  }, [authState.currentUser])

  return {
    ...authState,
    login,
    signup,
    logout,
    updateProfile,
    resetPassword,
    generateResetToken,
    verifyResetToken,
    resetPasswordWithToken,
    findUserByCredentialId,
    updateFingerprintCredential
  }
}

export default useAuth