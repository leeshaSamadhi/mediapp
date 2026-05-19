import React, { useState } from 'react'
import CreditCardIllustration from './CreditCardIllustration'
import Button from './Button'
import Icon from './Icon'

interface CardDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  cardNumber: string
  cardHolder: string
  expiryDate: string
  onRemove: () => void
}

const CardDetailsModal: React.FC<CardDetailsModalProps> = ({
  isOpen,
  onClose,
  cardNumber,
  cardHolder,
  expiryDate,
  onRemove
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  if (!isOpen) return null

  const handleRemove = () => {
    onRemove()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <Icon name="close" size="md" />
        </button>

        {/* Header */}
        <div className="pt-8 pb-4 px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Card Details</h2>
          <p className="text-gray-500 text-sm">Your saved payment method</p>
        </div>

        {/* Credit Card Illustration */}
        <div className="px-6 pb-6">
          <div className="transform hover:scale-102 transition-transform duration-300">
            <CreditCardIllustration
              cardNumber={cardNumber}
              cardHolder={cardHolder}
              expiryDate={expiryDate}
            />
          </div>
        </div>

        {/* Card Info */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Card Number</span>
              <span className="font-mono font-medium text-gray-800">{cardNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Card Holder</span>
              <span className="font-medium text-gray-800 uppercase">{cardHolder}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Expires</span>
              <span className="font-medium text-gray-800">{expiryDate}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-8">
          {!showConfirmDelete ? (
            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={onClose}
              >
                Done
              </Button>
              <div className="flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirmDelete(true)}
                  className="px-6 py-2 text-red-600 hover:bg-red-50 border-red-200"
                >
                  Remove Card
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-red-800 font-medium mb-1">Remove this card?</p>
                <p className="text-red-600 text-sm">This action cannot be undone</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowConfirmDelete(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleRemove}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, Remove
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CardDetailsModal