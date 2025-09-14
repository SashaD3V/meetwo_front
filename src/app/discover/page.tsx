'use client'

import { useState } from 'react'

interface Profile {
  id: string
  name: string
  age: number
  location: string
  bio: string
  images: string[]
  interests: string[]
}

// Données de démonstration (même que précédemment)
const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Emma',
    age: 24,
    location: 'Paris, France',
    bio: 'Passionnée de voyage et de cuisine. J\'adore découvrir de nouveaux endroits et partager de bons moments.',
    images: ['/images/profile1.jpg'],
    interests: ['Voyage', 'Cuisine', 'Musique']
  },
  {
    id: '2',
    name: 'Lucas',
    age: 28,
    location: 'Lyon, France',
    bio: 'Développeur le jour, musicien la nuit. Toujours partant pour une bonne discussion autour d\'un café.',
    images: ['/images/profile2.jpg'],
    interests: ['Tech', 'Musique', 'Café']
  },
  {
    id: '3',
    name: 'Léa',
    age: 26,
    location: 'Marseille, France',
    bio: 'Yoga, lecture et randonnées. Je cherche quelqu\'un qui partage ma passion pour la nature.',
    images: ['/images/profile3.jpg'],
    interests: ['Yoga', 'Nature', 'Lecture']
  },
  {
    id: '4',
    name: 'Tom',
    age: 30,
    location: 'Bordeaux, France',
    bio: 'Chef cuisinier et amateur de vin. Si tu aimes la gastronomie, on va bien s\'entendre !',
    images: ['/images/profile4.jpg'],
    interests: ['Cuisine', 'Vin', 'Art']
  }
]

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationType, setAnimationType] = useState<'like' | 'pass' | null>(null)

  const handleLike = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setAnimationType('like')
    
    // Animation de 600ms puis passage au profil suivant
    setTimeout(() => {
      console.log(`Liked ${profiles[currentIndex].name}`)
      nextProfile()
    }, 600)
  }

  const handlePass = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setAnimationType('pass')
    
    // Animation de 600ms puis passage au profil suivant
    setTimeout(() => {
      console.log(`Passed ${profiles[currentIndex].name}`)
      nextProfile()
    }, 600)
  }

  const nextProfile = () => {
    setCurrentIndex(prev => prev + 1)
    setIsAnimating(false)
    setAnimationType(null)
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Plus de profils !
          </h2>
          <p className="text-gray-600 mb-6">
            Revenez plus tard pour découvrir de nouveaux profils
          </p>
          <button 
            onClick={() => setCurrentIndex(0)}
            className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors"
          >
            Recommencer
          </button>
        </div>
      </div>
    )
  }

  const currentProfile = profiles[currentIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4 relative">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Découvrir</h1>
          <p className="text-gray-600">
            {profiles.length - currentIndex} profils restants
          </p>
        </div>

        {/* Profile Card avec animations */}
        <div className={`
          bg-white rounded-2xl shadow-xl overflow-hidden mb-6 relative
          transition-all duration-600 ease-out
          ${isAnimating && animationType === 'like' ? 'transform rotate-12 translate-x-full opacity-0' : ''}
          ${isAnimating && animationType === 'pass' ? 'transform -rotate-12 -translate-x-full opacity-0' : ''}
        `}>
          {/* Image */}
          <div className="relative h-96 bg-gray-200">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
            <div className="absolute bottom-4 left-4 z-20 text-white">
              <h2 className="text-2xl font-bold">
                {currentProfile.name}, {currentProfile.age}
              </h2>
              <p className="text-sm opacity-90">📍 {currentProfile.location}</p>
            </div>
            {/* Placeholder pour l'image */}
            <div className="w-full h-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center">
              <span className="text-white text-6xl">👤</span>
            </div>
          </div>

          {/* Info */}
          <div className="p-6">
            <p className="text-gray-700 mb-4 leading-relaxed">
              {currentProfile.bio}
            </p>
            
            {/* Interests */}
            <div className="flex flex-wrap gap-2">
              {currentProfile.interests.map((interest, index) => (
                <span 
                  key={index}
                  className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Overlay d'animation Like */}
          {isAnimating && animationType === 'like' && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-30">
              <div className="text-6xl animate-bounce">
                💚
              </div>
            </div>
          )}

          {/* Overlay d'animation Pass */}
          {isAnimating && animationType === 'pass' && (
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-30">
              <div className="text-6xl animate-pulse">
                💔
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons avec animations */}
        <div className="flex justify-center gap-6">
          <button
            onClick={handlePass}
            disabled={isAnimating}
            className={`
              w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl 
              shadow-lg transition-all duration-200 
              ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100 hover:scale-110 active:scale-95'}
              ${animationType === 'pass' ? 'bg-red-500 text-white animate-pulse' : ''}
            `}
            title="Passer"
          >
            <span className={animationType === 'pass' ? 'animate-spin' : ''}>
              ❌
            </span>
          </button>
          
          <button
            onClick={handleLike}
            disabled={isAnimating}
            className={`
              w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-2xl 
              shadow-lg transition-all duration-200
              ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-600 hover:scale-110 active:scale-95'}
              ${animationType === 'like' ? 'bg-green-500 animate-bounce' : ''}
            `}
            title="J'aime"
          >
            <span className={animationType === 'like' ? 'animate-ping' : ''}>
              ❤️
            </span>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mt-6 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-pink-500 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / profiles.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Feedback visuel global */}
      {isAnimating && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
          {animationType === 'like' && (
            <div className="text-8xl animate-bounce text-green-500 drop-shadow-lg">
              ✨ MATCH! ✨
            </div>
          )}
          {animationType === 'pass' && (
            <div className="text-4xl animate-pulse text-red-500 drop-shadow-lg">
              Peut-être la prochaine fois...
            </div>
          )}
        </div>
      )}
    </div>
  )
}