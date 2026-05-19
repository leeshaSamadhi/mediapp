import React, { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Icon from '../components/ui/Icon'
import Navbar from '../components/ui/Navbar'
import CardDetailsModal from '../components/ui/CardDetailsModal'
import { PaymentMethod } from '../models/types'
import { samplePaymentMethods } from '../data/seed'

const Payments: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [selectedOtherPayment, setSelectedOtherPayment] = useState<string | null>(null)
  const [showCardModal, setShowCardModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<PaymentMethod | null>(null)
  const [formData, setFormData] = useState({
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  })

  useEffect(() => {
    const storedPayments = localStorage.getItem('MEDI_PAYMENT_METHODS')
    if (storedPayments) {
      const methods = JSON.parse(storedPayments)
      setPaymentMethods(methods)
      // Set default payment method as selected
      const defaultMethod = methods.find((m: PaymentMethod) => m.isDefault)
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id)
      } else if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0].id)
      }
    } else {
      setPaymentMethods(samplePaymentMethods)
      localStorage.setItem('MEDI_PAYMENT_METHODS', JSON.stringify(samplePaymentMethods))
      // Set default payment method as selected
      const defaultMethod = samplePaymentMethods.find(m => m.isDefault)
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id)
      } else if (samplePaymentMethods.length > 0) {
        setSelectedPaymentMethod(samplePaymentMethods[0].id)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddCard = () => {
    const { cardHolder, cardNumber, expiryDate, cvv } = formData
    if (!cardHolder || !cardNumber || !expiryDate || !cvv) {
      return
    }

    const newPayment: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type: 'credit',
      cardNumber: `**** **** **** ${cardNumber.slice(-4)}`,
      cardHolder,
      expiryDate,
      cvv: '***',
      isDefault: paymentMethods.length === 0
    }

    const updatedMethods = [...paymentMethods, newPayment]
    setPaymentMethods(updatedMethods)
    localStorage.setItem('MEDI_PAYMENT_METHODS', JSON.stringify(updatedMethods))
    setShowAddForm(false)
    setFormData({ cardHolder: '', cardNumber: '', expiryDate: '', cvv: '' })
  }

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'credit': return 'creditCard'
      case 'applepay': return 'google'
      case 'paypal': return 'google'
      case 'googlepay': return 'google'
      default: return 'creditCard'
    }
  }

  const handleDeleteCard = (cardId: string) => {
    const updatedMethods = paymentMethods.filter(method => method.id !== cardId)
    setPaymentMethods(updatedMethods)
    localStorage.setItem('MEDI_PAYMENT_METHODS', JSON.stringify(updatedMethods))
    
    // If deleted card was selected, select another one
    if (selectedPaymentMethod === cardId) {
      if (updatedMethods.length > 0) {
        const defaultMethod = updatedMethods.find(m => m.isDefault)
        setSelectedPaymentMethod(defaultMethod ? defaultMethod.id : updatedMethods[0].id)
      } else {
        setSelectedPaymentMethod(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment Methods</h1>

        {/* Payment Methods List */}
        <div className="space-y-3 mb-6">
          {paymentMethods.map((method) => (
            <Card 
              key={method.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedPaymentMethod === method.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => {
                setSelectedCard(method)
                setShowCardModal(true)
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary-light rounded-lg">
                  <Icon name={getPaymentIcon(method.type)} size="md" className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{method.cardNumber}</p>
                  <p className="text-sm text-gray-500">{method.cardHolder}</p>
                  {method.isDefault && (
                    <span className="text-xs text-primary">Default</span>
                  )}
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={selectedPaymentMethod === method.id}
                  onChange={() => {
                    setSelectedPaymentMethod(method.id)
                    setSelectedOtherPayment(null)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 text-primary"
                />
                <button
                  onClick={(e) => {
                     e.stopPropagation()
                    handleDeleteCard(method.id)
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Delete card"
                >
                  <Icon name="close" size="sm" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Add New Card Form */}
        {showAddForm ? (
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Card</h2>
            <div className="space-y-4">
              <Input
                label="Cardholder Name"
                name="cardHolder"
                placeholder="John Doe"
                value={formData.cardHolder}
                onChange={handleChange}
              />
              <Input
                label="Card Number"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={handleChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry Date"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
                <Input
                  label="CVV"
                  name="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={handleChange}
                />
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="primary" 
                  onClick={handleAddCard}
                  disabled={!formData.cardHolder || !formData.cardNumber || !formData.expiryDate || !formData.cvv}
                >
                  Save Card
                </Button>
                <Button variant="secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Button variant="secondary" onClick={() => setShowAddForm(true)} className="w-auto mx-auto flex items-center justify-center">
            <Icon name="creditCard" size="sm" className="mr-2" />
            <span>Add New Card</span>
          </Button>
        )}

        {/* Other Payment Options */}
        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Other Payment Options</h2>
          <div className="space-y-3">
            {['Apple Pay', 'PayPal', 'Google Pay'].map((option) => (
              <div key={option} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Icon name="google" size="md" className="text-gray-500" />
                  <span className="text-gray-700">{option}</span>
                </div>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={selectedOtherPayment === option}
                  onChange={() => {
                    setSelectedOtherPayment(option)
                    setSelectedPaymentMethod(null)
                  }}
                  className="w-4 h-4 text-primary"
                  aria-label={option}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Navbar />
      
      {/* Card Details Modal */}
      <CardDetailsModal
        isOpen={showCardModal}
        onClose={() => {
          setShowCardModal(false)
          setSelectedCard(null)
        }}
        cardNumber={selectedCard?.cardNumber || ''}
        cardHolder={selectedCard?.cardHolder || ''}
        expiryDate={selectedCard?.expiryDate || ''}
        onRemove={() => {
          if (selectedCard) {
            handleDeleteCard(selectedCard.id)
          }
        }}
      />
    </div>
  )
}

export default Payments
