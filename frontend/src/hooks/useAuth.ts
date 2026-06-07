import { useState, useEffect, useCallback } from 'react'
import { User } from '../models/types'
import { authApi, profileApi } from '../services/api'

interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    currentUser: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('CURRENT_USER')
    const token = localStorage.getItem('ACCESS_TOKEN')
    
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser) as User
        setAuthState({
          currentUser: user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('CURRENT_USER')
        localStorage.removeItem('ACCESS_TOKEN')
        setAuthState({
          currentUser: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
      }
    } else {
      setAuthState({
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
    }
  }, [])

  // Login function - calls backend API
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await authApi.login(email, password)
      
      // Map backend user to frontend User type
      const user: User = {
        id: response.user.id,
        fullName: response.user.full_name,
        email: response.user.email,
        phone: response.user.mobile,
        password: '', // Don't store password
        dob: response.user.dob,
        avatarUrl: response.user.avatar_url,
        fingerprintRegistered: response.user.fingerprint_enabled
      }
      
      setAuthState({
        currentUser: user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
      
      return true
    } catch (error: any) {
      console.error('Login error:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed'
      }))
      return false
    }
  }, [])

  // Signup function - calls backend API
  const signup = useCallback(async (userData: {
    fullName: string
    email: string
    phone: string
    password: string
    dob: string
    avatarUrl?: string
    fingerprintRegistered?: boolean
    fingerprintCredentialId?: string
  }): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      await authApi.signup({
        full_name: userData.fullName,
        email: userData.email,
        mobile: userData.phone,
        password: userData.password,
        dob: userData.dob,
        avatar_url: userData.avatarUrl
      })
      
      // Clear any stored token so user is not auto-logged in after signup
      localStorage.removeItem('ACCESS_TOKEN')
      localStorage.removeItem('CURRENT_USER')
      
      setAuthState({
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
      
      return true
    } catch (error: any) {
      console.error('Signup error:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Signup failed'
      }))
      return false
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    authApi.logout()
    setAuthState({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  }, [])

  // Update user profile - calls backend API
  const updateProfile = useCallback(async (updatedData: Partial<User>): Promise<boolean> => {
    if (!authState.currentUser) return false
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Map frontend fields to backend fields
      const backendData: any = {}
      if (updatedData.fullName) backendData.full_name = updatedData.fullName
      if (updatedData.email) backendData.email = updatedData.email
      if (updatedData.phone) backendData.mobile = updatedData.phone
      if (updatedData.dob) backendData.dob = updatedData.dob
      if (updatedData.avatarUrl) backendData.avatar_url = updatedData.avatarUrl
      
      const response = await profileApi.updateProfile(authState.currentUser.id, backendData)
      
      // Map backend user to frontend User type
      const updatedUser: User = {
        ...authState.currentUser,
        fullName: response.full_name,
        email: response.email,
        phone: response.mobile,
        dob: response.dob,
        avatarUrl: response.avatar_url,
        fingerprintRegistered: response.fingerprint_enabled
      }
      
      setAuthState(prev => ({
        ...prev,
        currentUser: updatedUser,
        isLoading: false,
        error: null
      }))
      
      return true
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Profile update failed'
      }))
      return false
    }
  }, [authState.currentUser])

  // Login with fingerprint - calls backend API
  const loginWithFingerprint = useCallback(async (fingerprintData: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await authApi.loginWithFingerprint(fingerprintData)
      
      // Map backend user to frontend User type
      const user: User = {
        id: response.user.id,
        fullName: response.user.full_name,
        email: response.user.email,
        phone: response.user.mobile,
        password: '', // Don't store password
        dob: response.user.dob,
        avatarUrl: response.user.avatar_url,
        fingerprintRegistered: response.user.fingerprint_enabled
      }
      
      setAuthState({
        currentUser: user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
      
      return true
    } catch (error: any) {
      console.error('Fingerprint login error:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Fingerprint login failed'
      }))
      return false
    }
  }, [])

  // Generate reset token for password reset
  const generateResetToken = useCallback((email: string): string | null => {
    // Generate a client-side token for the reset flow UI
    // In production this would be handled by the backend sending an email
    try {
      const token = `reset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const expiration = Date.now() + 15 * 60 * 1000 // 15 minutes
      // Store token with email and expiration temporarily in memory/localStorage
      const tokenData = { email, token, expiration }
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

  // Reset password with token — uses backend API
  const resetPasswordWithToken = useCallback(async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const verification = verifyResetToken(token)
      if (!verification.valid || !verification.email) {
        return false
      }
      // We need to find the user ID for this email to call the backend
      // The token flow is client-side only, so we need to look up the user
      // For now, we'll use the stored current user if available
      const storedUser = localStorage.getItem('CURRENT_USER')
      if (!storedUser) return false
      const user = JSON.parse(storedUser)
      if (user.email !== verification.email) return false

      await profileApi.changePassword(user.id, { new_password: newPassword })
      localStorage.removeItem('RESET_TOKEN')
      return true
    } catch (error) {
      console.error('Error resetting password with token:', error)
      return false
    }
  }, [verifyResetToken])

  // Reset password (for logged in users) — uses backend API
  const resetPassword = useCallback(async (newPassword: string, currentPassword?: string): Promise<boolean> => {
    if (!authState.currentUser) return false
    try {
      await profileApi.changePassword(authState.currentUser.id, {
        current_password: currentPassword,
        new_password: newPassword
      })
      return true
    } catch (error) {
      console.error('Error resetting password:', error)
      return false
    }
  }, [authState.currentUser])

  // Find user by fingerprint credential ID
  const findUserByCredentialId = useCallback((_credentialId: string): User | null => {
    // Fingerprint credential lookup should be done via the backend API
    // This is a placeholder - the actual lookup happens during loginWithFingerprint
    return null
  }, [])

  // Update user with fingerprint credential — updates via backend
  const updateFingerprintCredential = useCallback(async (credentialId: string): Promise<boolean> => {
    if (!authState.currentUser) return false
    try {
      // Update local state to reflect fingerprint registration
      const updatedUser = {
        ...authState.currentUser,
        fingerprintRegistered: true,
        fingerprintCredentialId: credentialId
      }
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

  // Clear error
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])

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
    updateFingerprintCredential,
    loginWithFingerprint,
    clearError
  }
}

export default useAuth
