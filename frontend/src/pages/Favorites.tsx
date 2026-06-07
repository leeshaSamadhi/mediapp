import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Icon from '../components/ui/Icon'
import Navbar from '../components/ui/Navbar'
import useAuth from '../hooks/useAuth'
import { Doctor } from '../models/types'
import { doctorsApi, favoritesApi } from '../services/api'

const Favorites: React.FC = () => {
  const { currentUser } = useAuth()
  const [favoriteDoctors, setFavoriteDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  const loadFavorites = async () => {
    if (!currentUser?.id) {
      setFavoriteDoctors([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const backendFavorites = await favoritesApi.getFavorites(currentUser.id)
      const frontendDoctors: Doctor[] = backendFavorites.map((fav) => ({
        id: fav.id,
        name: fav.name,
        specialty: fav.specialty,
        gender: fav.gender,
        rating: fav.rating,
        messages: fav.messages || 0,
        photoUrl: fav.photo_url || '',
        isFavorite: true,
        experience: fav.experience,
        focus: fav.focus || '',
        about: fav.about || '',
        availability: fav.availability || { days: '', time: '' },
        schedule: []
      }))
      setFavoriteDoctors(frontendDoctors)
    } catch (error) {
      console.error('Failed to fetch favorites from backend:', error)
      setFavoriteDoctors([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavorites()
  }, [currentUser?.id])

  const toggleFavorite = async (doctorId: string) => {
    if (!currentUser?.id) {
      console.error('User not logged in')
      return
    }

    // Optimistic UI: remove from list immediately
    const removedDoctor = favoriteDoctors.find(doc => doc.id === doctorId)
    setFavoriteDoctors(prev => prev.filter(doc => doc.id !== doctorId))

    // Remove favorite via backend
    try {
      await doctorsApi.toggleFavorite(doctorId, currentUser.id)
    } catch (error) {
      console.error('Failed to toggle favorite in backend:', error)
      // Revert optimistic UI if backend call fails
      if (removedDoctor) {
        setFavoriteDoctors(prev => [...prev, removedDoctor])
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Favorite Doctors</h1>

        {loading ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500">Loading favorites...</p>
            </div>
          </Card>
        ) : favoriteDoctors.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Icon name="heart" size="lg" className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No favorite doctors yet</p>
              <Link to="/home/doctors" className="text-primary hover:underline">
                Browse doctors
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {favoriteDoctors.map((doctor) => (
              <Card key={doctor.id}>
                <div className="flex items-start space-x-4">
                  <Avatar src={doctor.photoUrl} name={doctor.name} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                        <p className="text-sm text-gray-500">{doctor.specialty}</p>
                      </div>
                      <button
                        onClick={() => toggleFavorite(doctor.id)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Remove from favorites"
                      >
                        <Icon name="heartFilled" size="md" className="text-red-500" />
                      </button>
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
                    </div>
                    <Link 
                      to={`/home/doctors/${doctor.id}`}
                      className="mt-3 inline-flex items-center text-sm text-primary hover:underline"
                    >
                      <Icon name="info" size="sm" className="mr-1" />
                      View Details
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  )
}

export default Favorites