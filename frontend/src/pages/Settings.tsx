import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import Navbar from '../components/ui/Navbar'
import useAuth from '../hooks/useAuth'

const Settings: React.FC = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDeleteAccount = () => {
    // In a real app, this would call an API to delete the account
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/home')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3"
          >
            <Icon name="chevronLeft" size="md" className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        </div>

        {/* Settings Categories */}
        <Card className="mb-6">
          <div className="space-y-2">
            <Link 
              to="/home/settings/notifications" 
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Icon name="bell" size="md" className="text-gray-500" />
                <span className="text-gray-700">Notification Settings</span>
              </div>
              <Icon name="chevronRight" size="sm" className="text-gray-400" />
            </Link>
            <Link 
              to="/home/settings/password" 
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Icon name="settings" size="md" className="text-gray-500" />
                <span className="text-gray-700">Password Manager</span>
              </div>
              <Icon name="chevronRight" size="sm" className="text-gray-400" />
            </Link>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Icon name="close" size="md" className="text-red-500" />
                <span className="text-red-600">Delete Account</span>
              </div>
              <Icon name="chevronRight" size="sm" className="text-gray-400" />
            </button>
          </div>
        </Card>

        {/* App Info */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">App Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500">Version</span>
              <span className="text-gray-800">1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500">Build</span>
              <span className="text-gray-800">2026.04.20</span>
            </div>
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

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Account</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete your account? This action cannot be undone.</p>
              <div className="flex space-x-3">
                <Button variant="primary" onClick={handleDeleteAccount} fullWidth className="bg-red-600 hover:bg-red-700">
                  Delete Account
                </Button>
                <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} fullWidth>
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}

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

export default Settings