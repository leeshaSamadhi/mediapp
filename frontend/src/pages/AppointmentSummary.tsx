import React, { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import useNotifications from '../hooks/useNotifications'

const AppointmentSummary: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { appointment, doctor } = location.state || {}
  const { addNotification } = useNotifications()
  const notificationCreated = useRef(false)

  useEffect(() => {
    if (appointment && doctor && !notificationCreated.current) {
      notificationCreated.current = true
      const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      addNotification(
        'Appointment Confirmed',
        `Your appointment with ${doctor.name} on ${formattedDate} at ${appointment.time} has been confirmed.`,
        'scheduled_appointment'
      )
    }
  }, [appointment, doctor, addNotification])

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

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-2xl mx-auto p-4">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="check" size="lg" className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Appointment Confirmed!</h1>
          <p className="text-gray-600">Your appointment has been successfully booked</p>
        </div>

        {/* Appointment Details */}
        <Card className="mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar src={doctor.photoUrl} name={doctor.name} size="lg" />
            <div>
              <h2 className="font-semibold text-gray-800">{doctor.name}</h2>
              <p className="text-sm text-gray-500">{doctor.specialty}</p>
            </div>
          </div>

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
              <Icon name="calendar" size="md" className="text-primary" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-800">{appointment.time}</p>
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
                <span className="text-gray-800">Total</span>
                <span className="text-primary">$150.00</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="primary" fullWidth onClick={() => navigate('/home')}>
            Back to Home
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/home/calendar')}>
            View in Calendar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AppointmentSummary