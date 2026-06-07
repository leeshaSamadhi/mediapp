import React from 'react'

interface CreditCardIllustrationProps {
  cardNumber: string
  cardHolder: string
  expiryDate: string
  className?: string
}

const CreditCardIllustration: React.FC<CreditCardIllustrationProps> = ({
  cardNumber,
  cardHolder,
  expiryDate,
  className = ''
}) => {
  // Detect card brand based on first digit
  const getCardBrand = (number: string) => {
    const firstDigit = number.replace(/\s/g, '').charAt(0)
    if (firstDigit === '4') return 'visa'
    if (firstDigit === '5') return 'mastercard'
    if (firstDigit === '3') return 'amex'
    return 'visa' // default
  }

  const brand = getCardBrand(cardNumber)

  const getGradient = () => {
    switch (brand) {
      case 'visa':
        return 'from-blue-600 via-blue-700 to-blue-900'
      case 'mastercard':
        return 'from-orange-500 via-red-500 to-red-700'
      case 'amex':
        return 'from-green-500 via-emerald-600 to-teal-700'
      default:
        return 'from-blue-600 via-blue-700 to-blue-900'
    }
  }

  const getBrandLogo = () => {
    switch (brand) {
      case 'visa':
        return (
          <div className="text-white font-bold text-xl italic tracking-wider">VISA</div>
        )
      case 'mastercard':
        return (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-500 rounded-full opacity-90"></div>
            <div className="w-8 h-8 bg-yellow-500 rounded-full -ml-4 opacity-90"></div>
          </div>
        )
      case 'amex':
        return (
          <div className="text-white font-bold text-sm tracking-wider">AMEX</div>
        )
      default:
        return (
          <div className="text-white font-bold text-xl italic tracking-wider">VISA</div>
        )
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Card Background */}
      <div className={`w-full h-48 rounded-2xl bg-gradient-to-br ${getGradient()} p-6 shadow-2xl transform transition-transform duration-300 hover:scale-105`}>
        {/* Holographic Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Top Row - Chip and Contactless */}
        <div className="flex justify-between items-start mb-8">
          {/* Chip */}
          <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 rounded-md shadow-inner flex items-center justify-center">
            <div className="grid grid-cols-3 gap-0.5 w-8 h-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-yellow-600/30 rounded-sm"></div>
              ))}
            </div>
          </div>
          
          {/* Contactless Icon */}
          <div className="flex flex-col items-center">
            <svg className="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
            </svg>
          </div>
        </div>

        {/* Card Number */}
        <div className="text-white font-mono text-xl tracking-widest mb-6 drop-shadow-lg">
          {cardNumber || '**** **** **** ****'}
        </div>

        {/* Bottom Row - Name and Expiry */}
        <div className="flex justify-between items-end">
          <div>
            <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Card Holder</div>
            <div className="text-white font-semibold tracking-wide uppercase">
              {cardHolder || 'YOUR NAME'}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Expires</div>
            <div className="text-white font-semibold tracking-wide">
              {expiryDate || 'MM/YY'}
            </div>
          </div>
        </div>

        {/* Brand Logo */}
        <div className="absolute bottom-6 right-6">
          {getBrandLogo()}
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Card Shadow */}
      <div className="absolute inset-0 bg-black/20 rounded-2xl blur-xl -z-10 transform translate-y-4"></div>
    </div>
  )
}

export default CreditCardIllustration