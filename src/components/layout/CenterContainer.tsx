import React from 'react'

interface CenterContainerProps {
  children: React.ReactNode
  className?: string
}

const CenterContainer: React.FC<CenterContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 p-4 ${className}`}>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}

export default CenterContainer