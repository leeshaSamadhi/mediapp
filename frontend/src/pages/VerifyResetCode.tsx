import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'
import CenterContainer from '../components/layout/CenterContainer'
import { resetPasswordApi } from '../services/api'

const VerifyResetCode: React.FC = () => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()
  const location = useLocation()

  const email = (location.state as { email?: string })?.email

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password')
      return
    }
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [email, navigate])

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError('')

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits are entered
    if (value && index === 5 && newCode.every(d => d !== '')) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 0) return

    const newCode = [...code]
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i]
    }
    setCode(newCode)
    setError('')

    // Focus the next empty input or the last one
    const nextEmpty = newCode.findIndex(d => d === '')
    const focusIndex = nextEmpty === -1 ? 5 : nextEmpty
    inputRefs.current[focusIndex]?.focus()

    // Auto-submit if all 6 digits filled
    if (newCode.every(d => d !== '')) {
      handleVerify(newCode.join(''))
    }
  }

  const handleVerify = async (codeStr: string) => {
    if (!email) return

    setIsLoading(true)
    setError('')

    try {
      const response = await resetPasswordApi.verifyCode(email, codeStr)
      // Navigate to reset password page with the reset token
      navigate('/reset-password', {
        state: { resetToken: response.reset_token, email }
      })
    } catch (err: any) {
      setError(err.message || 'Invalid verification code')
      // Clear code on error
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const codeStr = code.join('')
    if (codeStr.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }
    handleVerify(codeStr)
  }

  if (!email) return null

  return (
    <CenterContainer>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Enter Verification Code</h1>
        <p className="text-gray-600">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-3">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              disabled={isLoading}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </Button>
      </form>

      <div className="text-center mt-6 space-y-2">
        <p className="text-sm text-gray-500">
          Code expires in 10 minutes
        </p>
        <button
          onClick={() => navigate('/forgot-password')}
          className="text-sm text-primary font-medium hover:underline"
        >
          Didn't receive the code? Try again
        </button>
      </div>
    </CenterContainer>
  )
}

export default VerifyResetCode