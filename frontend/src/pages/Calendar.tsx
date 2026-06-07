import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import Navbar from '../components/ui/Navbar'
import { Appointment, Doctor, Review } from '../models/types'
import { CANCEL_REASONS } from '../utils/constants'
import useNotifications from '../hooks/useNotifications'
import useAuth from '../hooks/useAuth'
import { appointmentsApi, reviewsApi, doctorsApi } from '../services/api'

type TabType = 'upcoming' | 'completed' | 'cancelled'

const Calendar: React.FC = () => {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelNotes, setCancelNotes] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const { addNotification } = useNotifications()
  const { currentUser, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading || !currentUser?.id) return

    let cancelled = false

    const loadData = async () => {
      // Load appointments from backend API
      try {
        const backendAppointments = await appointmentsApi.getAppointments(currentUser.id)
        if (cancelled) return
        const frontendAppointments = backendAppointments.map((apt) => ({
          id: apt.id,
          doctorId: apt.doctor_id,
          doctorName: apt.doctor_name,
          doctorSpecialty: apt.doctor_specialty,
          doctorPhoto: apt.doctor_photo,
          date: apt.date,
          time: apt.time,
          status: apt.status,
          patientName: apt.patient_name,
          forSelf: apt.for_self,
          notes: apt.notes || '',
          amount: apt.amount,
          cancelReason: apt.cancel_reason || '',
          cancelNotes: apt.cancel_notes || ''
        }))
        if (!cancelled) setAppointments(frontendAppointments)
      } catch (error) {
        console.error('Failed to load appointments from backend:', error)
      }

      // Load doctors from backend API
      try {
        const backendDoctors = await doctorsApi.getDoctors({ userId: currentUser.id })
        if (cancelled) return
        const frontendDoctors = backendDoctors.map((doc) => ({
          id: doc.id,
          name: doc.name,
          specialty: doc.specialty,
          gender: doc.gender,
          rating: doc.rating,
          messages: doc.messages,
          photoUrl: doc.photo_url || '',
          isFavorite: doc.is_favorite,
          experience: doc.experience,
          focus: doc.focus || '',
          about: doc.about || '',
          availability: doc.availability,
          schedule: doc.schedule || []
        }))
        if (!cancelled) setDoctors(frontendDoctors)
      } catch (error) {
        console.error('Failed to load doctors from backend:', error)
      }

      // Load reviews from backend API
      try {
        const backendReviews = await reviewsApi.getReviews()
        if (cancelled) return
        const frontendReviews = backendReviews.map((rev) => ({
          id: rev.id,
          appointmentId: rev.appointment_id,
          doctorId: rev.doctor_id,
          rating: rev.rating,
          comment: rev.comment || '',
          date: rev.date
        }))
        if (!cancelled) setReviews(frontendReviews)
      } catch (error) {
        console.error('Failed to load reviews from backend:', error)
      }
    }

    loadData()

    return () => { cancelled = true }
  }, [currentUser?.id, authLoading])

  const getDoctor = (doctorId: string) => {
    return doctors.find(doc => doc.id === doctorId)
  }

  const getReviewForAppointment = (appointmentId: string) => {
    return reviews.find(review => review.appointmentId === appointmentId)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const filteredAppointments = appointments.filter(apt => {
    if (activeTab === 'upcoming') {
      return apt.status === 'upcoming' && new Date(apt.date) >= today
    } else if (activeTab === 'completed') {
      return new Date(apt.date) < today || apt.status === 'completed'
    } else if (activeTab === 'cancelled') {
      return apt.status === 'cancelled'
    }
    return apt.status === activeTab
  })

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowCancelModal(true)
    setCancelReason('')
    setCancelNotes('')
  }

  const handleCancelConfirm = async () => {
    if (!selectedAppointment || !cancelReason) return

    if (!currentUser?.id) {
      console.error('User not logged in')
      return
    }

    const doctor = getDoctor(selectedAppointment.doctorId)

    // Update appointment status in backend database
    try {
      await appointmentsApi.updateAppointment(selectedAppointment.id, {
        status: 'cancelled',
        cancel_reason: cancelReason,
        cancel_notes: cancelNotes
      })
    } catch (error) {
      console.error('Failed to update appointment in backend:', error)
    }

    // Update local state
    const updatedAppointments = appointments.map(apt =>
      apt.id === selectedAppointment.id
        ? { ...apt, status: 'cancelled' as const, cancelReason, cancelNotes }
        : apt
    )
    setAppointments(updatedAppointments)
    
    // Create notification for appointment cancellation
    const formattedDate = new Date(selectedAppointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    addNotification(
      'Appointment Cancelled',
      `Your appointment with ${doctor?.name} on ${formattedDate} at ${selectedAppointment.time} has been cancelled.`,
      'scheduled_changes'
    )
    
    setShowCancelModal(false)
    setSelectedAppointment(null)
  }

  const handleReviewClick = (appointment: Appointment) => {
    const existingReview = getReviewForAppointment(appointment.id)
    setSelectedAppointment(appointment)
    setShowReviewModal(true)
    setReviewRating(existingReview?.rating || 5)
    setReviewComment(existingReview?.comment || '')
  }

  const handleReviewSubmit = async () => {
    if (!selectedAppointment) return

    if (!currentUser?.id) {
      console.error('User not logged in')
      return
    }

    const existingReviewIndex = reviews.findIndex(r => r.appointmentId === selectedAppointment.id)

    // Save review to backend database
    let backendReview: any = null
    try {
      backendReview = await reviewsApi.createReview(currentUser.id, {
        appointment_id: selectedAppointment.id,
        doctor_id: selectedAppointment.doctorId,
        rating: reviewRating,
        comment: reviewComment || undefined
      })
    } catch (error) {
      console.error('Failed to save review to backend:', error)
    }

    if (existingReviewIndex >= 0) {
      // Update existing review locally
      const updatedReviews = [...reviews]
      updatedReviews[existingReviewIndex] = {
        ...updatedReviews[existingReviewIndex],
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toISOString().split('T')[0]
      }
      setReviews(updatedReviews)
    } else {
      // Create new review locally using backend ID if available
      const newReview: Review = {
        id: backendReview?.id || `review-${Date.now()}`,
        appointmentId: selectedAppointment.id,
        doctorId: selectedAppointment.doctorId,
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toISOString().split('T')[0]
      }
      const updatedReviews = [...reviews, newReview]
      setReviews(updatedReviews)
    }

    // Reload doctors from backend to get updated ratings
    try {
      const backendDoctors = await doctorsApi.getDoctors({ userId: currentUser.id })
      const frontendDoctors = backendDoctors.map((doc) => ({
        id: doc.id,
        name: doc.name,
        specialty: doc.specialty,
        gender: doc.gender,
        rating: doc.rating,
        messages: doc.messages,
        photoUrl: doc.photo_url || '',
        isFavorite: doc.is_favorite,
        experience: doc.experience,
        focus: doc.focus || '',
        about: doc.about || '',
        availability: doc.availability,
        schedule: doc.schedule || []
      }))
      setDoctors(frontendDoctors)
    } catch (error) {
      console.error('Failed to reload doctors from backend:', error)
    }

    setShowReviewModal(false)
    setSelectedAppointment(null)
  }

  const handleRebook = (doctorId: string) => {
    navigate('/home/appointments', { state: { doctorId } })
  }

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setReviewRating(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform bg-transparent border-none p-0 outline-none focus:outline-none`}
            disabled={!interactive}
          >
            <Icon
              name="star"
              size="md"
              className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}
            />
          </button>
        ))}
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Appointments</h1>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {(['upcoming', 'completed', 'cancelled'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Icon name="calendar" size="lg" className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No {activeTab} appointments</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const doctor = getDoctor(appointment.doctorId)
              const existingReview = getReviewForAppointment(appointment.id)

              return (
                <Card key={appointment.id} className="bg-[#AED88B]">
                  <div className="flex items-start space-x-4">
                    <Avatar src={doctor?.photoUrl} name={doctor?.name} size="lg" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">{doctor?.name}</h3>
                          <p className="text-sm text-gray-500">{doctor?.specialty}</p>
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Icon name="star" size="sm" />
                          <span className="text-sm font-medium">{doctor?.rating}</span>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Icon name="calendar" size="sm" className="mr-2" />
                          {formatDate(appointment.date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Icon name="clock" size="sm" className="mr-2" />
                          {appointment.time}
                        </div>
                        {appointment.notes && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Icon name="edit" size="sm" className="mr-2" />
                            {appointment.notes}
                          </div>
                        )}
                        {appointment.status === 'cancelled' && appointment.cancelReason && (
                          <div className="flex items-center text-sm text-red-500">
                            <Icon name="close" size="sm" className="mr-2" />
                            Cancelled: {appointment.cancelReason}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {activeTab === 'upcoming' && (
                          <>
                            <button
                              onClick={() => navigate('/home/appointments/summary', { state: { appointment, doctor } })}
                              className="text-sm py-2 px-4 rounded-xl font-semibold text-white transition-colors duration-200"
                              style={{ backgroundColor: '#254907' }}
                            >
                              Details
                            </button>
                            <Button
                              variant="secondary"
                              onClick={() => handleCancelClick(appointment)}
                              className="text-sm py-2 px-4"
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {activeTab === 'completed' && (
                          <>
                            <Button
                              variant="secondary"
                              onClick={() => handleRebook(appointment.doctorId)}
                              className="text-sm py-2 px-4"
                            >
                              Rebook
                            </Button>
                            <button
                              onClick={() => handleReviewClick(appointment)}
                              className="text-sm py-2 px-4 rounded-xl font-semibold text-white transition-colors duration-200"
                              style={{ backgroundColor: '#254907' }}
                            >
                              {existingReview ? 'Edit Review' : 'Add Review'}
                            </button>
                          </>
                        )}
                      </div>

                      {/* Existing Review Display */}
                      {existingReview && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Your Review</span>
                            {renderStars(existingReview.rating)}
                          </div>
                          {existingReview.comment && (
                            <p className="text-sm text-gray-600">{existingReview.comment}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Cancel Appointment</h2>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                style={{ color: '#1f2937' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Select a reason for cancellation:</p>
                <div className="space-y-2">
                  {CANCEL_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        cancelReason === reason
                          ? 'border-primary bg-primary-light'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason}
                        checked={cancelReason === reason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="sr-only"
                      />
                      <span className={cancelReason === reason ? 'text-primary font-medium' : 'text-gray-700'}>
                        {reason}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional notes (optional)
                </label>
                <textarea
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Brief reason for cancellation..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              </div>

              <Button
                variant="primary"
                fullWidth
                onClick={handleCancelConfirm}
                disabled={!cancelReason}
              >
                Cancel Appointment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Add Review</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                style={{ color: '#1f2937' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {/* Doctor Info */}
              <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <Avatar
                  src={getDoctor(selectedAppointment.doctorId)?.photoUrl}
                  name={getDoctor(selectedAppointment.doctorId)?.name}
                  size="md"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {getDoctor(selectedAppointment.doctorId)?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getDoctor(selectedAppointment.doctorId)?.specialty}
                  </p>
                  <div className="flex items-center mt-1">
                    <Icon name="star" size="sm" className="text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {getDoctor(selectedAppointment.doctorId)?.rating} rating
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                {renderStars(reviewRating, true)}
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review (optional)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={4}
                />
              </div>

              <Button
                variant="primary"
                fullWidth
                onClick={handleReviewSubmit}
              >
                Add Review
              </Button>
            </div>
          </div>
        </div>
      )}

      <Navbar />
    </div>
  )
}

export default Calendar