import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Icon from '../components/ui/Icon'
import Navbar from '../components/ui/Navbar'
import { Doctor, Service } from '../models/types'
import { doctorsApi, servicesApi } from '../services/api'
import useAuth from '../hooks/useAuth'

const Doctors: React.FC = () => {
  const { currentUser, isLoading } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [filter, setFilter] = useState<'all' | 'male' | 'female' | 'favorites' | 'high_rating'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'rating'>('name')
  const [topRatedView, setTopRatedView] = useState<'doctors' | 'services'>('doctors')
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)

  useEffect(() => {
    // Guard: don't fetch until auth state is resolved
    if (isLoading) return

    let cancelled = false

    const loadDoctors = async () => {
      try {
        // Fetch doctors from backend API with userId for per-user favorites
        const backendDoctors = await doctorsApi.getDoctors({ userId: currentUser?.id })
        // Transform backend doctors to frontend format
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
        if (cancelled) return
        setDoctors(frontendDoctors)
      } catch (error) {
        console.error('Failed to fetch doctors from backend:', error)
      }
    }

    loadDoctors()

    // Load services from backend
    const loadServices = async () => {
      try {
        const backendServices = await servicesApi.getServices()
        if (!cancelled) {
          setServices(backendServices.map(svc => ({
            id: svc.id,
            name: svc.name,
            brief: svc.brief || '',
            isFavorite: svc.is_favorite
          })))
        }
      } catch (error) {
        console.error('Failed to load services from backend:', error)
      }
    }
    loadServices()

    return () => { cancelled = true }
  }, [currentUser?.id, isLoading])

  const toggleFavorite = async (doctorId: string) => {
    if (!currentUser?.id) {
      console.error('User not logged in')
      return
    }

    // Find current doctor
    const currentDoctor = doctors.find(doc => doc.id === doctorId)
    if (!currentDoctor) return

    const newFavoriteStatus = !currentDoctor.isFavorite
    
    // Update local state immediately for better UX
    const updatedDoctors = doctors.map(doc =>
      doc.id === doctorId ? { ...doc, isFavorite: newFavoriteStatus } : doc
    )
    setDoctors(updatedDoctors)
    
    // Save to backend database
    try {
      await doctorsApi.toggleFavorite(doctorId, currentUser.id)
    } catch (error) {
      console.error('Failed to toggle favorite in backend:', error)
      // Revert local state if backend call fails
      const revertedDoctors = doctors.map(doc =>
        doc.id === doctorId ? { ...doc, isFavorite: !newFavoriteStatus } : doc
      )
      setDoctors(revertedDoctors)
    }
  }

  const toggleServiceFavorite = async (serviceId: string) => {
    const currentService = services.find(svc => svc.id === serviceId)
    if (!currentService) return

    const newFavoriteStatus = !currentService.isFavorite
    // Optimistic update
    const updatedServices = services.map(svc =>
      svc.id === serviceId ? { ...svc, isFavorite: newFavoriteStatus } : svc
    )
    setServices(updatedServices)

    // Persist to backend
    try {
      await servicesApi.toggleFavorite(serviceId)
    } catch (error) {
      console.error('Failed to toggle service favorite in backend:', error)
      // Revert on error
      const revertedServices = services.map(svc =>
        svc.id === serviceId ? { ...svc, isFavorite: !newFavoriteStatus } : svc
      )
      setServices(revertedServices)
    }
  }

  const toggleServiceExpand = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId)
  }

  const getServiceSpecialty = (serviceName: string): string => {
    const specialtyMap: { [key: string]: string } = {
      'Cardiology Consultation': 'Cardiologist',
      'Dermatology Check-up': 'Dermatologist',
      'Pediatric Care': 'Pediatrician',
      'Orthopedic Assessment': 'Orthopedic Surgeon',
      'General Health Check-up': 'General'
    }
    return specialtyMap[serviceName] || ''
  }

  const handleLookForDoctors = (serviceName: string) => {
    setSelectedService(serviceName)
    setTopRatedView('doctors')
  }

  const clearServiceFilter = () => {
    setSelectedService(null)
  }

  const filteredDoctors = doctors
    .filter(doc => {
      if (filter === 'male') return doc.gender === 'male'
      if (filter === 'female') return doc.gender === 'female'
      if (filter === 'favorites') return doc.isFavorite
      if (filter === 'high_rating') return doc.rating >= 4.7
      return true
    })
    .filter(doc => {
      if (selectedService) {
        const specialty = getServiceSpecialty(selectedService)
        if (specialty === 'General') return true
        return doc.specialty === specialty
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return b.rating - a.rating
    })

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Doctors</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'all', label: 'All', icon: 'stethoscope' },
            { key: 'favorites', label: 'Favorites', icon: 'heartFilled' },
            { key: 'male', label: 'Male', icon: 'profile' },
            { key: 'female', label: 'Female', icon: 'profile' },
            { key: 'high_rating', label: 'Top Rated', icon: 'star' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => {
                setFilter(key as typeof filter)
                if (key !== 'high_rating') {
                  setTopRatedView('doctors')
                }
              }}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                filter === key 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon name={icon} size="sm" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Top Rated Tabs */}
        {filter === 'high_rating' && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTopRatedView('doctors')}
              className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                topRatedView === 'doctors'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon name="stethoscope" size="sm" />
              <span>Doctors</span>
            </button>
            <button
              onClick={() => setTopRatedView('services')}
              className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                topRatedView === 'services'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon name="heart" size="sm" />
              <span>Services</span>
            </button>
          </div>
        )}

        {/* Sort */}
        <div className="mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>

        {/* Service Filter Indicator */}
        {selectedService && (
          <div className="mb-4 p-3 bg-primary-light rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="heart" size="sm" className="text-primary" />
              <span className="text-sm text-gray-700">Showing doctors for: <strong>{selectedService}</strong></span>
            </div>
            <button
              onClick={clearServiceFilter}
              className="p-1 hover:bg-white/50 rounded-full transition-colors"
              aria-label="Clear filter"
            >
              <svg className="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Doctors List */}
        {(filter !== 'high_rating' || topRatedView === 'doctors') && (
          <div className="space-y-4">
            {filteredDoctors.length === 0 ? (
              <Card>
                <p className="text-center text-gray-500 py-8">No doctors found</p>
              </Card>
            ) : (
              filteredDoctors.map((doctor) => (
                <Card key={doctor.id}>
                  <div className="flex items-start space-x-4">
                    <Avatar src={doctor.photoUrl} name={doctor.name} size="lg" />
                    <div className="flex-1">
                      <div>
                        <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                        <p className="text-sm text-gray-500">{doctor.specialty}</p>
                        <p className="text-xs text-gray-400 capitalize">{doctor.gender}</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Icon name="star" size="sm" className="text-yellow-500" />
                          <span>{doctor.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon name="chat" size="sm" />
                          <span>{doctor.messages} messages</span>
                        </div>
                        <button
                          onClick={() => toggleFavorite(doctor.id)}
                          className="p-1.5 bg-white/60 hover:bg-white/80 rounded-full transition-colors shadow-sm"
                          aria-label={doctor.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {doctor.isFavorite ? (
                            <svg className="w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-green-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center space-x-3 mt-3">
                        <Link 
                          to={`/home/doctors/${doctor.id}`}
                          className="inline-flex items-center text-sm text-primary hover:underline"
                        >
                          <Icon name="info" size="sm" className="mr-1" />
                          View Details
                        </Link>
                        <Link 
                          to={`/home/doctors/${doctor.id}`}
                          className="inline-flex items-center text-sm text-primary hover:underline"
                        >
                          <Icon name="calendar" size="sm" className="mr-1" />
                          Available Dates
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Services List */}
        {filter === 'high_rating' && topRatedView === 'services' && (
          <div className="space-y-4">
            {services.length === 0 ? (
              <Card>
                <p className="text-center text-gray-500 py-8">No services found</p>
              </Card>
            ) : (
              services.map((service) => (
                <Card key={service.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleServiceFavorite(service.id)}
                        className="p-1.5 bg-white/60 hover:bg-white/80 rounded-full transition-colors shadow-sm"
                        aria-label={service.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {service.isFavorite ? (
                          <svg className="w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-green-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        )}
                      </button>
                      <h3 className="font-semibold text-gray-800">{service.name}</h3>
                    </div>
                    <button
                      onClick={() => toggleServiceExpand(service.id)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label={expandedService === service.id ? 'Collapse' : 'Expand'}
                    >
                      <svg 
                        className={`w-5 h-5 text-gray-600 transition-transform ${expandedService === service.id ? 'rotate-180' : ''}`} 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {expandedService === service.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">{service.brief}</p>
                      <button
                        onClick={() => handleLookForDoctors(service.name)}
                        className="mt-3 w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                      >
                        Look for doctors
                      </button>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  )
}

export default Doctors