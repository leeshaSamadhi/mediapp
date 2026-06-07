import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Icon from '../components/ui/Icon'
import Navbar from '../components/ui/Navbar'
import useAuth from '../hooks/useAuth'

const Profile: React.FC = () => {
  const { currentUser, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    dob: currentUser?.dob || ''
  })
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Update formData when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        dob: currentUser.dob || ''
      })
    }
  }, [currentUser])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    const success = await updateProfile(formData)
    if (success) {
      setIsEditing(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

        {/* Profile Card */}
        <Card className="mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar 
              src={currentUser?.avatarUrl} 
              name={currentUser?.fullName} 
              size="lg" 
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{currentUser?.fullName}</h2>
              <p className="text-gray-500">{currentUser?.email}</p>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
              />
              <div className="flex space-x-3">
                <Button variant="primary" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Full Name</span>
                <span className="text-gray-800">{currentUser?.fullName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-800">{currentUser?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Phone</span>
                <span className="text-gray-800">{currentUser?.phone}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Date of Birth</span>
                <span className="text-gray-800">{currentUser?.dob}</span>
              </div>
              <div className="flex justify-center">
                <Button onClick={() => setIsEditing(true)} className="bg-[#254907] text-white hover:bg-[#1d3a06]">
                  Update Profile
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Quick Links */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
          <div className="space-y-2">
            <Link 
              to="/home/favorites" 
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Icon name="heartFilled" size="md" className="text-red-500" />
                <span className="text-gray-700">Favorite Doctors</span>
              </div>
              <Icon name="chevronRight" size="sm" className="text-gray-400" />
            </Link>
            <Link 
              to="/home/payments" 
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Icon name="creditCard" size="md" className="text-gray-500" />
                <span className="text-gray-700">Payment Methods</span>
              </div>
              <Icon name="chevronRight" size="sm" className="text-gray-400" />
            </Link>
            <Link 
              to="/home/settings" 
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Icon name="settings" size="md" className="text-gray-500" />
                <span className="text-gray-700">Settings</span>
              </div>
              <Icon name="chevronRight" size="sm" className="text-gray-400" />
            </Link>
            <Link 
              to="/home/help" 
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Icon name="help" size="md" className="text-gray-500" />
                <span className="text-gray-700">Help Centre</span>
              </div>
              <Icon name="chevronRight" size="sm" className="text-gray-400" />
            </Link>
            <Link 
              to="/home/privacy-policy" 
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Icon name="info" size="md" className="text-gray-500" />
                <span className="text-gray-700">Privacy Policy</span>
              </div>
              <Icon name="chevronRight" size="sm" className="text-gray-400" />
            </Link>
          </div>
        </Card>

        {/* Logout */}
        <Card>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Icon name="logout" size="md" />
            <span className="font-medium">Logout</span>
          </button>
        </Card>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
              <div className="flex space-x-3">
                <Button variant="primary" onClick={handleLogout} fullWidth>
                  Yes, Logout
                </Button>
                <Button variant="secondary" onClick={() => setShowLogoutConfirm(false)} fullWidth>
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
      <Navbar />
    </div>
  )
}

export default Profile