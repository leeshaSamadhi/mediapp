import React from 'react'

interface CardLayoutProps {
  children: React.ReactNode
  className?: string
}

const CardLayout: React.FC<CardLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gray-50 pb-20 ${className}`}>
      <div className="max-w-2xl mx-auto p-4">
        {children}
      </div>
    </div>
  )
}

export default CardLayout