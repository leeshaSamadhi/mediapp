import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { Doctor } from '../models/types'
import { doctorsApi } from '../services/api'
import useAuth from '../hooks/useAuth'

const DoctorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentUser, isLoading } = useAuth()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [showSchedulePopup, setShowSchedulePopup] = useState(false)

  useEffect(() => {
    // Guard: don't fetch until auth state is resolved
    if (isLoading) return

    let cancelled = false

    const loadDoctor = async () => {
      if (id) {
        try {
          // Fetch doctor from backend API with userId for per-user favorite status
          const backendDoctor = await doctorsApi.getDoctor(id, currentUser?.id)
          // Transform backend doctor to frontend format
          const frontendDoctor: Doctor = {
            id: backendDoctor.id,
            name: backendDoctor.name,
            specialty: backendDoctor.specialty,
            gender: backendDoctor.gender,
            rating: backendDoctor.rating,
            messages: backendDoctor.messages,
            photoUrl: backendDoctor.photo_url || '',
            isFavorite: backendDoctor.is_favorite,
            experience: backendDoctor.experience,
            focus: backendDoctor.focus || '',
            about: backendDoctor.about || '',
            availability: backendDoctor.availability,
            schedule: backendDoctor.schedule || []
          }
          if (!cancelled) setDoctor(frontendDoctor)
        } catch (error) {
          console.error('Failed to fetch doctor from backend:', error)
          // Show error instead of falling back to localStorage
          setDoctor(null)
        }
      }
    }

    loadDoctor()

    return () => { cancelled = true }
  }, [id, currentUser?.id, isLoading])

  const toggleFavorite = async () => {
    if (!doctor || !currentUser?.id) {
      console.error('User not logged in')
      return
    }

    const newFavoriteStatus = !doctor.isFavorite
    
    // Update local state immediately for better UX
    setDoctor({ ...doctor, isFavorite: newFavoriteStatus })
    
    // Save to backend database
    try {
      await doctorsApi.toggleFavorite(doctor.id, currentUser.id)
    } catch (error) {
      console.error('Failed to toggle favorite in backend:', error)
      // Revert local state if backend call fails
      setDoctor({ ...doctor, isFavorite: !newFavoriteStatus })
    }
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <p className="text-center text-gray-500 py-8">Doctor not found</p>
            <Link to="/home/doctors" className="text-primary hover:underline block text-center">
              Back to Doctors
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-2xl mx-auto p-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <Icon name="chevronLeft" size="md" />
          <span className="ml-1">Back</span>
        </button>

        {/* Doctor Card */}
        <Card className="mb-6 bg-[#AED88B]">
          <div className="flex items-start space-x-4">
            <Avatar src={doctor.photoUrl} name={doctor.name} size="lg" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{doctor.name}</h1>
                  <p className="text-gray-600">{doctor.specialty}</p>
                  <p className="text-sm text-gray-400 capitalize">{doctor.gender}</p>
                </div>
                <button
                  onClick={toggleFavorite}
                  className="p-2 bg-white/60 hover:bg-white/80 rounded-full transition-colors shadow-sm"
                  aria-label={doctor.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {doctor.isFavorite ? (
                    <svg className="w-6 h-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-green-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </button>
              </div>
                <div className="flex items-center space-x-4 mt-3 text-sm">
                <div className="flex items-center space-x-1 text-yellow-600">
                  <Icon name="star" size="sm" />
                  <span className="font-medium">{doctor.rating}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <Icon name="chat" size="sm" />
                  <span>{doctor.messages} messages</span>
                </div>
                {doctor.availability && (
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Icon name="calendar" size="sm" />
                    <span>{doctor.availability.days} / {doctor.availability.time}</span>
                  </div>
                )}
                {doctor.schedule && doctor.schedule.length > 0 && (
                  <button
                    onClick={() => setShowSchedulePopup(true)}
                    className="flex items-center space-x-1 text-primary hover:text-primary-dark transition-colors"
                  >
                    <Icon name="clock" size="sm" />
                    <span className="font-medium">Schedule</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* About Section */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">About</h2>
          <p className="text-gray-600 leading-relaxed">{doctor.about}</p>
        </Card>

        {/* Stats */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary-light rounded-lg">
              <p className="text-2xl font-bold text-primary">{doctor.experience}</p>
              <p className="text-sm text-gray-600">Years Experience</p>
            </div>
            <div className="text-center p-4 bg-primary-light rounded-lg">
              <p className="text-2xl font-bold text-primary">{doctor.messages}</p>
              <p className="text-sm text-gray-600">Messages</p>
            </div>
            <div className="text-center p-4 bg-primary-light rounded-lg">
              <p className="text-2xl font-bold text-primary">{doctor.rating}</p>
              <p className="text-sm text-gray-600">Rating</p>
            </div>
            <div className="text-center p-4 bg-primary-light rounded-lg">
              <p className="text-2xl font-bold text-primary">{doctor.focus.split(' ').length}</p>
              <p className="text-sm text-gray-600">Specializations</p>
            </div>
          </div>
        </Card>

        {/* Focus Areas */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Focus Areas</h2>
          <p className="text-gray-600">{doctor.focus}</p>
        </Card>

        {/* Book Appointment Button */}
        <Button 
          variant="primary" 
          fullWidth
          onClick={() => navigate('/home/appointments', { state: { doctorId: doctor.id } })}
        >
          Book Appointment
        </Button>

        {/* Schedule Popup */}
        {showSchedulePopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Schedule</h2>
                <button
                  onClick={() => setShowSchedulePopup(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Icon name="close" size="md" />
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {doctor.schedule.map((daySchedule, index) => (
                    <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <h3 className="font-medium text-gray-800 mb-2">{daySchedule.day}</h3>
                      <div className="flex flex-wrap gap-2">
                        {daySchedule.slots.map((slot, slotIndex) => (
                          <span
                            key={slotIndex}
                            className="px-3 py-1 bg-primary-light text-primary rounded-full text-sm"
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorDetail
