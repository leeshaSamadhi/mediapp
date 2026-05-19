import { useState, useCallback } from 'react'

interface FingerprintAuthResult {
  success: boolean
  credentialId?: string
  error?: string
}

const useFingerprintAuth = () => {
  const [isSupported, setIsSupported] = useState<boolean>(() => {
    return window.PublicKeyCredential !== undefined
  })

  const [isAuthenticating, setIsAuthenticating] = useState(false)

  // Check if WebAuthn is available
  const checkFingerprintSupport = useCallback(async (): Promise<boolean> => {
    if (!window.PublicKeyCredential) {
      return false
    }

    try {
      // Check if platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      setIsSupported(available)
      return available
    } catch (error) {
      console.error('Error checking fingerprint support:', error)
      setIsSupported(false)
      return false
    }
  }, [])

  // Register fingerprint for a new user
  const registerFingerprint = useCallback(async (
    email: string,
    fullName: string,
    userId: string
  ): Promise<FingerprintAuthResult> => {
    if (!isSupported) {
      return { success: false, error: 'Fingerprint authentication is not supported on this device' }
    }

    setIsAuthenticating(true)

    try {
      // Generate a random challenge
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      // Create user ID as Uint8Array
      const userIdBytes = new TextEncoder().encode(userId)

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'Medi App',
          id: window.location.hostname
        },
        user: {
          id: userIdBytes,
          name: email,
          displayName: fullName
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'none'
      }

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential

      if (!credential) {
        return { success: false, error: 'Failed to create fingerprint credential' }
      }

      // Convert credential ID to base64 string for storage
      const credentialId = btoa(
        String.fromCharCode(...new Uint8Array(credential.rawId))
      )

      return { success: true, credentialId }
    } catch (error: any) {
      console.error('Fingerprint registration error:', error)
      
      let errorMessage = 'Failed to register fingerprint'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Fingerprint registration was cancelled or not allowed'
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Security error during fingerprint registration'
      } else if (error.name === 'AbortError') {
        errorMessage = 'Fingerprint registration was aborted'
      }

      return { success: false, error: errorMessage }
    } finally {
      setIsAuthenticating(false)
    }
  }, [isSupported])

  // Authenticate using fingerprint
  const authenticateWithFingerprint = useCallback(async (
    credentialId: string
  ): Promise<FingerprintAuthResult> => {
    if (!isSupported) {
      return { success: false, error: 'Fingerprint authentication is not supported on this device' }
    }

    setIsAuthenticating(true)

    try {
      // Generate a random challenge
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      // Decode credential ID from base64
      const credentialIdBytes = Uint8Array.from(
        atob(credentialId),
        c => c.charCodeAt(0)
      )

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [
          {
            id: credentialIdBytes,
            type: 'public-key',
            transports: ['internal']
          }
        ],
        userVerification: 'required',
        timeout: 60000
      }

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential

      if (!assertion) {
        return { success: false, error: 'Fingerprint authentication failed' }
      }

      return { success: true, credentialId }
    } catch (error: any) {
      console.error('Fingerprint authentication error:', error)
      
      let errorMessage = 'Fingerprint authentication failed'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Fingerprint authentication was cancelled or not allowed'
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Security error during fingerprint authentication'
      } else if (error.name === 'AbortError') {
        errorMessage = 'Fingerprint authentication was aborted'
      }

      return { success: false, error: errorMessage }
    } finally {
      setIsAuthenticating(false)
    }
  }, [isSupported])

  return {
    isSupported,
    isAuthenticating,
    checkFingerprintSupport,
    registerFingerprint,
    authenticateWithFingerprint
  }
}

export default useFingerprintAuth