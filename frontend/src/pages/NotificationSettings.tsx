import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Icon from '../components/ui/Icon'
import Navbar from '../components/ui/Navbar'
import Toggle from '../components/ui/Toggle'

const NotificationSettings: React.FC = () => {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    generalNotification: true,
    sound: true,
    soundCall: true,
    vibrate: true,
    specialOffers: true,
    payments: true,
    promoAndDiscount: true,
    cashback: true
  })

  const handleToggle = (key: keyof typeof settings) => (value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/home/settings')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3"
          >
            <Icon name="chevronLeft" size="md" className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Notification Settings</h1>
        </div>

        {/* Notification Settings Card */}
        <Card>
          <div className="space-y-6">
            <Toggle
              label="General Notification"
              checked={settings.generalNotification}
              onChange={handleToggle('generalNotification')}
            />
            <Toggle
              label="Sound"
              checked={settings.sound}
              onChange={handleToggle('sound')}
            />
            <Toggle
              label="Sound Call"
              checked={settings.soundCall}
              onChange={handleToggle('soundCall')}
            />
            <Toggle
              label="Vibrate"
              checked={settings.vibrate}
              onChange={handleToggle('vibrate')}
            />
            <Toggle
              label="Special Offers"
              checked={settings.specialOffers}
              onChange={handleToggle('specialOffers')}
            />
            <Toggle
              label="Payments"
              checked={settings.payments}
              onChange={handleToggle('payments')}
            />
            <Toggle
              label="Promo and Discount"
              checked={settings.promoAndDiscount}
              onChange={handleToggle('promoAndDiscount')}
            />
            <Toggle
              label="Cashback"
              checked={settings.cashback}
              onChange={handleToggle('cashback')}
            />
          </div>
        </Card>
      </div>
      <Navbar />
    </div>
  )
}

export default NotificationSettings