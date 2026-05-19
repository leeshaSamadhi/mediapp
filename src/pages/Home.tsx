import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Icon from '../components/ui/Icon'
import Navbar from '../components/ui/Navbar'
import NotificationDropdown from '../components/ui/NotificationDropdown'
import useAuth from '../hooks/useAuth'
import useNotifications from '../hooks/useNotifications'
import { Doctor, Appointment } from '../models/types'
import { sampleDoctors, sampleAppointments } from '../data/seed'

const Home: React.FC = () => {
  const { currentUser } = useAuth()
  const { notifications, markAsRead, unreadCount } = useNotifications()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'favorites'>('all')
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    specialty: '',
    gender: '',
    minRating: 0
  })
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    // Load doctors from localStorage or use sample data
    const storedDoctors = localStorage.getItem('MEDI_DOCTORS')
    if (storedDoctors) {
      setDoctors(JSON.parse(storedDoctors))
    } else {
      setDoctors(sampleDoctors)
      localStorage.setItem('MEDI_DOCTORS', JSON.stringify(sampleDoctors))
    }

    // Load appointments from localStorage or use sample data
    const storedAppointments = localStorage.getItem('MEDI_APPOINTMENTS')
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments))
    } else {
      setAppointments(sampleAppointments)
      localStorage.setItem('MEDI_APPOINTMENTS', JSON.stringify(sampleAppointments))
    }
  }, [])

  const toggleFavorite = (doctorId: string) => {
    const updatedDoctors = doctors.map(doc =>
      doc.id === doctorId ? { ...doc, isFavorite: !doc.isFavorite } : doc
    )
    setDoctors(updatedDoctors)
    localStorage.setItem('MEDI_DOCTORS', JSON.stringify(updatedDoctors))
  }

  // Get upcoming appointments (exclude past appointments)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'upcoming' && new Date(apt.date) >= today
  )

  // Get unique doctor IDs from upcoming appointments
  const appointmentDoctorIds = [...new Set(upcomingAppointments.map(apt => apt.doctorId))]

  // Filter doctors to show only those with appointments
  const doctorsWithAppointments = doctors.filter(doc => appointmentDoctorIds.includes(doc.id))

  // Get unique dates from upcoming appointments for calendar
  const appointmentDates = upcomingAppointments.map(apt => new Date(apt.date))

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Check if we can go to previous month (not before current month)
  const canGoToPreviousMonth = () => {
    const today = new Date()
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const viewMonthStart = new Date(currentYear, currentMonth, 1)
    return viewMonthStart > currentMonthStart
  }

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const days = []

    // Add empty cells for days before the first day of the month
    const startingDayOfWeek = firstDay.getDay()
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, hasAppointment: false, isEmpty: true })
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(currentYear, currentMonth, i)
      const hasAppointment = appointmentDates.some(aptDate =>
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      )
      days.push({ date: i, hasAppointment, isEmpty: false })
    }
    return days
  }

  const calendarDays = generateCalendarDays()

  // Apply filters to doctors with appointments
  const filteredDoctors = doctorsWithAppointments
    .filter(doc => filter === 'all' || doc.isFavorite)
    .filter(doc => {
      if (advancedFilters.specialty && doc.specialty !== advancedFilters.specialty) return false
      if (advancedFilters.gender && doc.gender !== advancedFilters.gender) return false
      if (advancedFilters.minRating && doc.rating < advancedFilters.minRating) return false
      return true
    })
    .filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )

  // Get unique specialties for filter dropdown
  const specialties = [...new Set(doctors.map(doc => doc.specialty))]

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Avatar 
              src={currentUser?.avatarUrl} 
              name={currentUser?.fullName} 
              size="md" 
            />
            <div>
              <p className="text-sm text-gray-500">Hi, Welcome Back</p>
              <h1 className="text-lg font-semibold text-gray-800">{currentUser?.fullName}</h1>
            </div>
          </div>
          <div className="flex space-x-2 relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="flex items-center space-x-1 p-2 rounded-full transition-colors relative"
              style={{ backgroundColor: '#529917' }}
              aria-label="Notifications"
            >
              <Icon name="bell" size="sm" className="text-white" />
              <span className="text-sm text-white">Notifications</span>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            <Link 
              to="/home/settings" 
              className="flex items-center space-x-1 p-2 rounded-full transition-colors"
              style={{ backgroundColor: '#529917' }}
              aria-label="Settings"
            >
              <Icon name="settings" size="sm" className="text-white" />
              <span className="text-sm text-white">Settings</span>
            </Link>
            <NotificationDropdown
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              notifications={notifications}
              onMarkAsRead={markAsRead}
            />
          </div>
        </div>

        {/* Search and Filter Row */}
        <div className="flex items-center space-x-2 mb-4">
          {/* Search Bar with Advanced Filter */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-[#ECFFD7] rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Icon name="search" size="md" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <button
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                showAdvancedFilter 
                  ? 'bg-primary text-white' 
                  : 'bg-white/80 text-green-700 hover:bg-white hover:text-green-800 shadow-sm'
              }`}
              aria-label="Advanced Filter"
            >
              <Icon name="filter" size="md" />
            </button>
          </div>

          {/* Doctors Button */}
          <Link
            to="/home/doctors"
            className={`flex items-center space-x-1 px-4 py-3 rounded-xl transition-colors ${
              filter === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon name="stethoscope" size="sm" />
            <span>Doctors</span>
          </Link>

          {/* Favorites Button */}
          <button
            onClick={() => setFilter(filter === 'favorites' ? 'all' : 'favorites')}
            className={`flex items-center space-x-1 px-4 py-3 rounded-xl transition-colors ${
              filter === 'favorites' 
                ? 'bg-primary text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon name="heartFilled" size="sm" />
            <span>Fav</span>
          </button>
        </div>

        {/* Advanced Filter Panel */}
        {showAdvancedFilter && (
          <Card className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">Advanced Filters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Specialty</label>
                <select
                  value={advancedFilters.specialty}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, specialty: e.target.value })}
                  className="w-full px-3 py-2 bg-[#ECFFD7] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Specialties</option>
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Gender</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setAdvancedFilters({ ...advancedFilters, gender: advancedFilters.gender === 'male' ? '' : 'male' })}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                      advancedFilters.gender === 'male' 
                        ? 'bg-primary text-white' 
                        : 'bg-[#ECFFD7] text-gray-700'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setAdvancedFilters({ ...advancedFilters, gender: advancedFilters.gender === 'female' ? '' : 'female' })}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                      advancedFilters.gender === 'female' 
                        ? 'bg-primary text-white' 
                        : 'bg-[#ECFFD7] text-gray-700'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Minimum Rating: {advancedFilters.minRating || 'Any'}</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={advancedFilters.minRating}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, minRating: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              <button
                onClick={() => setAdvancedFilters({ specialty: '', gender: '', minRating: 0 })}
                className="w-full py-2 text-sm text-primary hover:underline"
              >
                Clear Filters
              </button>
            </div>
          </Card>
        )}

        {/* Calendar View */}
        <div className="mb-6">
          <Card>
            {/* Month Navigation Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousMonth}
                disabled={!canGoToPreviousMonth()}
                className={`p-1 rounded-full transition-colors ${
                  canGoToPreviousMonth()
                    ? 'text-gray-600 hover:text-primary hover:bg-gray-100'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Previous month"
              >
                <Icon name="chevronLeft" size="md" />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-1 rounded-full text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors"
                aria-label="Next month"
              >
                <Icon name="chevronRight" size="md" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => {
                const currentDate = day.date ? new Date(currentYear, currentMonth, day.date) : null
                const isSelected = selectedDate && currentDate && 
                  selectedDate.getDate() === currentDate.getDate() &&
                  selectedDate.getMonth() === currentDate.getMonth() &&
                  selectedDate.getFullYear() === currentDate.getFullYear()
                
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (day.hasAppointment && currentDate) {
                        setSelectedDate(isSelected ? null : currentDate)
                      }
                    }}
                    className={`text-center py-2 text-sm rounded-lg transition-all duration-200 ${
                      day.isEmpty
                        ? 'bg-transparent'
                        : day.hasAppointment 
                          ? `bg-[#AED88B] font-semibold text-gray-800 cursor-pointer hover:shadow-md ${
                              isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                            }`
                          : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    {day.date && <div>{day.date}</div>}
                  </div>
                )
              })}
            </div>

            {/* Upcoming Appointments List */}
            {upcomingAppointments.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">
                    {selectedDate 
                      ? `Appointments on ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : 'Upcoming Appointments'
                    }
                  </h3>
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="text-xs text-primary hover:underline"
                    >
                      Show All
                    </button>
                  )}
                </div>
                {(selectedDate 
                  ? upcomingAppointments.filter(apt => {
                      const aptDate = new Date(apt.date)
                      return aptDate.getDate() === selectedDate.getDate() &&
                        aptDate.getMonth() === selectedDate.getMonth() &&
                        aptDate.getFullYear() === selectedDate.getFullYear()
                    })
                  : upcomingAppointments.slice(0, 3)
                ).map(apt => {
                  const doctor = doctors.find(doc => doc.id === apt.doctorId)
                  const aptDate = new Date(apt.date)
                  return (
                    <div key={apt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Avatar src={doctor?.photoUrl} name={doctor?.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{doctor?.name}</p>
                          <p className="text-xs text-gray-500">
                            {aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {apt.time}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-[#AED88B] rounded-full text-gray-700">
                        {aptDate.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {upcomingAppointments.length === 0 && (
              <div className="text-center py-4 border-t pt-4">
                <p className="text-gray-500">No upcoming appointments</p>
                <Link 
                  to="/home/doctors" 
                  className="mt-2 inline-block text-primary hover:underline text-sm"
                >
                  Book an appointment
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Appointment History */}
        {appointments.filter(apt => {
          const aptDate = new Date(apt.date)
          aptDate.setHours(0, 0, 0, 0)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return aptDate < today
        }).length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Appointment History</h2>
            <Card>
              <div className="space-y-2">
                {appointments
                  .filter(apt => {
                    const aptDate = new Date(apt.date)
                    aptDate.setHours(0, 0, 0, 0)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return aptDate < today
                  })
                  .slice(0, 5)
                  .map(apt => {
                    const doctor = doctors.find(doc => doc.id === apt.doctorId)
                    const aptDate = new Date(apt.date)
                    return (
                      <div key={apt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg opacity-75">
                        <div className="flex items-center space-x-2">
                          <Avatar src={doctor?.photoUrl} name={doctor?.name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{doctor?.name}</p>
                            <p className="text-xs text-gray-500">
                              {aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {apt.time}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-600">
                          Completed
                        </span>
                      </div>
                    )
                  })}
              </div>
            </Card>
          </div>
        )}

        {/* Doctors List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">My Doctors</h2>
          <div className="space-y-4">
            {filteredDoctors.length === 0 ? (
              <Card>
                <p className="text-center text-gray-500 py-8">
                  {filter === 'favorites' 
                    ? 'No favorite doctors with appointments' 
                    : 'No doctors with appointments found'}
                </p>
              </Card>
            ) : (
              filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="bg-[#AED88B]">
                  <div className="flex items-start space-x-4">
                    <Avatar src={doctor.photoUrl} name={doctor.name} size="lg" />
                    <div className="flex-1">
                      <div>
                        <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
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
                      <div className="flex items-center mt-3 space-x-2">
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
                        <Link 
                          to={`/home/doctors/${doctor.id}`}
                          className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900"
                        >
                          <Icon name="info" size="sm" className="mr-1" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
      <Navbar />
    </div>
  )
}

export default Home