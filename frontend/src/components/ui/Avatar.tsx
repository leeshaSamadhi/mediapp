import React from 'react'

interface AvatarProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  name?: string
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = '', size = 'md', name }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    )
  }

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-primary flex items-center justify-center text-white font-semibold`}
      aria-label={name || alt}
    >
      {name ? getInitials(name) : '?'}
    </div>
  )
}

export default Avatar