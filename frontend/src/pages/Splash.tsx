import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Splash: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/welcome')
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="text-center">
        <img 
          src="/assets/logo.png"
          alt="Medi App Logo" 
          className="w-32 h-32 mx-auto mb-4"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
        <h1 className="text-white text-2xl font-bold">Medi App</h1>
      </div>
    </div>
  )
}

export default Splash