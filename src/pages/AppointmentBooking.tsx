import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Icon from '../components/ui/Icon'
import { Doctor, Appointment } from '../models/types'
import { TIME_SLOTS } from '../utils/constants'
const AppointmentBooking: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const doctorId = location.state?.doctorId

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [patientName, setPatientName] = useState('')
  const [forSelf, setForSelf] = useState(true)
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [problem, setProblem] = useState('')
  const [step, setStep] = useState(1)
  const [bookedSlots, setBookedSlots] = useState<string[]>([])

  useEffect(() => {
    if (doctorId) {
      const storedDoctors = localStorage.getItem('MEDI_DOCTORS')
      if (storedDoctors) {
        const doctors = JSON.parse(storedDoctors)
        const foundDoctor = doctors.find((doc: Doctor) => doc.id === doctorId)
        setDoctor(foundDoctor)
      }
    }
  }, [doctorId])

  // Load booked slots when date changes
  useEffect(() => {
    if (doctorId && selectedDate) {
      const storedAppointments = localStorage.getItem('MEDI_APPOINTMENTS')
      if (storedAppointments) {
        const appointments: Appointment[] = JSON.parse(storedAppointments)
        const booked = appointments
          .filter(apt => 
            apt.doctorId === doctorId && 
            apt.date === selectedDate && 
            (apt.status === 'upcoming' || apt.status === 'completed')
          )
          .map(apt => apt.time)
        setBookedSlots(booked)
      } else {
        setBookedSlots([])
      }
    }
  }, [doctorId, selectedDate])

  const handleContinue = () => {
    if (step === 1 && selectedDate && selectedTime) {
      setStep(2)
    } else if (step === 2 && (forSelf || (patientName && age && gender))) {
      // Save appointment
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        doctorId: doctor?.id || '',
        date: selectedDate,
        time: selectedTime,
        status: 'upcoming',
        patientName: forSelf ? 'Self' : patientName,
        forSelf,
        notes: problem,
        amount: 150
      }

      const storedAppointments = localStorage.getItem('MEDI_APPOINTMENTS')
      const appointments = storedAppointments ? JSON.parse(storedAppointments) : []
      appointments.push(newAppointment)
      localStorage.setItem('MEDI_APPOINTMENTS', JSON.stringify(appointments))

      navigate('/home/appointments/payment', { state: { appointment: newAppointment, doctor } })
    }
  }

  // Generate dates for next 14 days (2 weeks)
  const getAvailableDates = () => {
    const dates = []
    for (let i = 1; i <= 14; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card>
          <p className="text-center text-gray-500 py-8">Please select a doctor first</p>
          <Button variant="primary" fullWidth onClick={() => navigate('/home/doctors')}>
            Browse Doctors
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-2xl mx-auto p-4">
        {/* Doctor Card */}
        <Card className="mb-6">
          <div className="flex items-center space-x-4">
            <Avatar src={doctor.photoUrl} name={doctor.name} size="lg" />
            <div>
              <h2 className="font-semibold text-gray-800">{doctor.name}</h2>
              <p className="text-sm text-gray-500">{doctor.specialty}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Icon name="star" size="sm" className="text-yellow-500" />
                <span className="text-sm text-gray-600">{doctor.rating}</span>
              </div>
            </div>
          </div>
        </Card>

        {step === 1 ? (
          <>
            {/* Date Selection */}
            <Card className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Date</h3>
              <div className="grid grid-cols-7 gap-2">
                {getAvailableDates().map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`p-2 text-center rounded-lg transition-colors ${
                      selectedDate === date
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-xs">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-sm font-medium">{new Date(date).getDate()}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Time Selection */}
            <Card className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Time</h3>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((time) => {
                  const isBooked = bookedSlots.includes(time)
                  return (
                    <button
                      key={time}
                      onClick={() => !isBooked && setSelectedTime(time)}
                      disabled={isBooked}
                      className={`p-3 text-center rounded-lg transition-colors relative ${
                        isBooked
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : selectedTime === time
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                      {isBooked && (
                        <span className="absolute top-1 right-1 text-xs text-red-500">Booked</span>
                      )}
                    </button>
                  )
                })}
              </div>
              {bookedSlots.length > 0 && (
                <p className="text-sm text-gray-500 mt-3 flex items-center">
                  <Icon name="info" size="xs" className="mr-1" />
                  Some slots are already booked
                </p>
              )}
            </Card>
          </>
        ) : (
          <>
            {/* Patient Details */}
            <Card className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Details</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="forSelf"
                    checked={forSelf}
                    onChange={(e) => setForSelf(e.target.checked)}
                    className="w-4 h-4 text-primary"
                  />
                  <label htmlFor="forSelf" className="text-gray-700">Booking for myself</label>
                </div>

                {!forSelf && (
                  <>
                    <Input
                      label="Patient Name"
                      placeholder="Enter patient name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Age"
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Describe your problem (optional)
                  </label>
                  <textarea
                    placeholder="Brief description of your health concern..."
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Summary */}
        {selectedDate && selectedTime && (
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Appointment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="text-gray-800">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time:</span>
                <span className="text-gray-800">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration:</span>
                <span className="text-gray-800">30 minutes</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-gray-500">Amount:</span>
                <span className="text-primary">$150</span>
              </div>
            </div>
          </Card>
        )}

        <Button 
          variant="primary" 
          fullWidth
          onClick={handleContinue}
          disabled={
            (step === 1 && (!selectedDate || !selectedTime)) ||
            (step === 2 && !forSelf && (!patientName || !age || !gender))
          }
        >
          {step === 1 ? 'Continue' : 'Proceed to Payment'}
        </Button>
      </div>
    </div>
  )
}

export default AppointmentBooking