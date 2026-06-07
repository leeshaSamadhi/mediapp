import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import CenterContainer from '../components/layout/CenterContainer'

const Welcome: React.FC = () => {
  return (
    <CenterContainer>
      <div className="text-center">
        <img 
          src="/assets/logo.png" 
          alt="Medi App Logo" 
          className="w-24 h-24 mx-auto mb-6"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Medi App</h1>
        <p className="text-lg text-gray-600 mb-8">Your Medi App</p>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <p className="text-gray-600 leading-relaxed">
            Your trusted health companion. Book appointments with top doctors, 
            manage your health records, and get the care you deserve - all in one place.
          </p>
        </div>

        <div>
          <Link to="/login" className="block mb-6">
            <Button variant="primary" fullWidth>
              Login
            </Button>
          </Link>
          
          <Link to="/signup" className="block">
            <Button variant="secondary" fullWidth>
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </CenterContainer>
  )
}

export default Welcome