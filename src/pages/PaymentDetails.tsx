import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { Doctor, Appointment, PaymentMethod } from '../models/types'
import useNotifications from '../hooks/useNotifications'

const PaymentDetails: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { appointment, doctor } = location.state || {}
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)

  useEffect(() => {
    const storedPayments = localStorage.getItem('MEDI_PAYMENT_METHODS')
    if (storedPayments) {
      const methods = JSON.parse(storedPayments)
      setPaymentMethods(methods)
      const defaultMethod = methods.find((m: PaymentMethod) => m.isDefault)
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id)
      } else if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0].id)
      }
    }
  }, [])

  if (!appointment || !doctor) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card>
          <p className="text-center text-gray-500 py-8">Appointment not found</p>
          <Button variant="primary" fullWidth onClick={() => navigate('/home')}>
            Go Home
          </Button>
        </Card>
      </div>
    )
  }

  const handlePayNow = () => {
    // Appointment status remains 'upcoming' after payment
    // Status should only change to 'completed' after the appointment date has passed
    navigate('/home/appointments/summary', { state: { appointment, doctor } })
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

  const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod)

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Details</h1>
          <p className="text-gray-600">Review your appointment and proceed to payment</p>
        </div>

        {/* Doctor Info */}
        <Card className="mb-6">
          <div className="flex items-center space-x-4">
            <Avatar src={doctor.photoUrl} name={doctor.name} size="lg" />
            <div>
              <h2 className="font-semibold text-gray-800">{doctor.name}</h2>
              <p className="text-sm text-gray-500">{doctor.specialty}</p>
            </div>
          </div>
        </Card>

        {/* Appointment Details */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Icon name="calendar" size="md" className="text-primary" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-800">
                  {new Date(appointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Icon name="clock" size="md" className="text-primary" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-800">{appointment.time}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Icon name="clock" size="md" className="text-primary" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-800">30 minutes</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Icon name="profile" size="md" className="text-primary" />
              <div>
                <p className="text-sm text-gray-500">Patient</p>
                <p className="font-medium text-gray-800">{appointment.patientName}</p>
              </div>
            </div>

            {appointment.notes && (
              <div className="flex items-start space-x-3">
                <Icon name="info" size="md" className="text-primary mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="font-medium text-gray-800">{appointment.notes}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Payment Summary */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Consultation Fee</span>
              <span className="text-gray-800">$150.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service Fee</span>
              <span className="text-gray-800">$0.00</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-800">Total Amount</span>
                <span className="text-primary text-lg">$150.00</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Method Selection */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedPaymentMethod === method.id
                      ? 'bg-primary-light ring-2 ring-primary'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="p-2 bg-white rounded-lg">
                    <Icon name={getPaymentIcon(method.type)} size="md" className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{method.cardNumber}</p>
                    <p className="text-sm text-gray-500">{method.cardHolder}</p>
                    {method.isDefault && (
                      <span className="text-xs text-primary">Default</span>
                    )}
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPaymentMethod === method.id
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedPaymentMethod === method.id && (
                      <Icon name="check" size="xs" className="text-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">No payment methods available</p>
              <Button variant="secondary" onClick={() => navigate('/home/payments')}>
                Add Payment Method
              </Button>
            </div>
          )}
        </Card>

        {/* Pay Now Button */}
        <Button
          variant="primary"
          fullWidth
          onClick={handlePayNow}
          disabled={!selectedPaymentMethod}
        >
          Pay Now - $150.00
        </Button>
      </div>
    </div>
  )
}

export default PaymentDetails