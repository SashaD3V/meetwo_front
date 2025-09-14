'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface QuickStat {
  icon: string
  label: string
  value: string
  color: string
}

interface RecentActivity {
  id: string
  type: 'like' | 'match' | 'message' | 'view'
  user: string
  avatar: string
  time: string
  content?: string
}

interface SuggestedProfile {
  id: string
  name: string
  age: number
  job: string
  distance: string
  avatar: string
  images: string[]
  bio: string
  interests: string[]
}

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState('')
  const [userName] = useState('Alex')
  const [selectedProfile, setSelectedProfile] = useState<SuggestedProfile | null>(null)

  // Stats rapides
  const quickStats: QuickStat[] = [
    { icon: '👀', label: 'Vues aujourd\'hui', value: '12', color: 'blue' },
    { icon: '💖', label: 'Likes reçus', value: '8', color: 'pink' },
    { icon: '⚡', label: 'Nouveaux matchs', value: '3', color: 'green' },
    { icon: '💬', label: 'Messages', value: '5', color: 'purple' }
  ]

  // Profils suggérés
  const suggestedProfiles: SuggestedProfile[] = [
    {
      id: '1',
      name: 'Marie',
      age: 26,
      job: 'Architecte',
      distance: '2 km',
      avatar: '👩‍💼',
      images: ['https://images.unsplash.com/photo-1494790108755-2616b612b002?w=400'],
      bio: 'Passionnée d\'architecture et de voyages.',
      interests: ['Architecture', 'Voyages', 'Design']
    },
    {
      id: '2',
      name: 'Pierre',
      age: 29,
      job: 'Designer',
      distance: '5 km',
      avatar: '👨‍🎨',
      images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
      bio: 'Designer UX/UI qui aime créer.',
      interests: ['Design', 'Musique', 'Tech']
    },
    {
      id: '3',
      name: 'Julie',
      age: 24,
      job: 'Chef',
      distance: '1 km',
      avatar: '👩‍🍳',
      images: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'],
      bio: 'Chef passionnée de cuisine du monde.',
      interests: ['Cuisine', 'Voyages', 'Nature']
    }
  ]

  // Activité récente
  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'match',
      user: 'Emma',
      avatar: '👩‍🦰',
      time: 'Il y a 5 min',
      content: 'Nouveau match !'
    },
    {
      id: '2',
      type: 'message',
      user: 'Lucas',
      avatar: '👨‍💻',
      time: 'Il y a 15 min',
      content: 'On se fait un café demain ?'
    },
    {
      id: '3',
      type: 'like',
      user: 'Léa',
      avatar: '👩‍🎨',
      time: 'Il y a 1h',
      content: 'Vous a liké'
    },
    {
      id: '4',
      type: 'view',
      user: 'Sarah',
      avatar: '👩‍🚀',
      time: 'Il y a 2h',
      content: 'A vu votre profil'
    }
  ]

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours()
      let greeting = 'Bonsoir'
      if (hours < 12) greeting = 'Bonjour'
      else if (hours < 18) greeting = 'Bon après-midi'
      
      setCurrentTime(greeting)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match': return '💖'
      case 'message': return '💬'
      case 'like': return '👍'
      case 'view': return '👀'
      default: return '📱'
    }
  }

  const getStatColor = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-cyan-500'
      case 'pink': return 'from-pink-500 to-rose-500'
      case 'green': return 'from-green-500 to-emerald-500'
      case 'purple': return 'from-purple-500 to-violet-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const handleProfileClick = (profile: SuggestedProfile) => {
    setSelectedProfile(profile)
  }

  const closeProfileModal = () => {
    setSelectedProfile(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-4">
        
        {/* Header de bienvenue */}
        <div className="mb-8 pt-4">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {currentTime}, {userName} ! 👋
                </h1>
                <p className="text-gray-600">
                  Prêt à faire de nouvelles rencontres aujourd&apos;hui ?
                </p>
              </div>
              <div className="text-6xl">
                🌟
              </div>
            </div>
            
            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {quickStats.map((stat, index) => (
                <div key={index} className={`bg-gradient-to-r ${getStatColor(stat.color)} rounded-2xl p-4 text-white text-center`}>
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Actions principales */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Navigation rapide */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                🚀 Actions rapides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  href="/discover"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-2xl hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl mb-2">🔍</div>
                      <h3 className="font-bold text-lg">Découvrir</h3>
                      <p className="text-sm opacity-90">Trouvez votre match parfait</p>
                    </div>
                    <div className="text-2xl group-hover:scale-110 transition-transform">→</div>
                  </div>
                </Link>

                <Link 
                  href="/messages"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl mb-2">💬</div>
                      <h3 className="font-bold text-lg">Messages</h3>
                      <p className="text-sm opacity-90">5 conversations actives</p>
                    </div>
                    <div className="text-2xl group-hover:scale-110 transition-transform">→</div>
                  </div>
                </Link>

                <Link 
                  href="/profile"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl mb-2">👤</div>
                      <h3 className="font-bold text-lg">Mon Profil</h3>
                      <p className="text-sm opacity-90">Optimisez votre profil</p>
                    </div>
                    <div className="text-2xl group-hover:scale-110 transition-transform">→</div>
                  </div>
                </Link>

                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl mb-2">💎</div>
                      <h3 className="font-bold text-lg">Premium</h3>
                      <p className="text-sm opacity-90">Débloquez tout le potentiel</p>
                    </div>
                    <div className="text-2xl group-hover:scale-110 transition-transform">→</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions du jour */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                ✨ Suggestions du jour
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestedProfiles.map((profile) => (
                  <div 
                    key={profile.id}
                    className="bg-gradient-to-br from-pink-100 to-purple-100 p-4 rounded-2xl text-center cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all"
                    onClick={() => handleProfileClick(profile)}
                  >
                    <div className="text-4xl mb-2">{profile.avatar}</div>
                    <h3 className="font-semibold text-gray-800">{profile.name}, {profile.age}</h3>
                    <p className="text-sm text-gray-600 mb-3">{profile.job} • {profile.distance}</p>
                    <button 
                      className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm hover:bg-pink-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleProfileClick(profile)
                      }}
                    >
                      Voir le profil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar droite */}
          <div className="space-y-6">
            
            {/* Activité récente */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                🔔 Activité récente
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full flex items-center justify-center">
                      {activity.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getActivityIcon(activity.type)}</span>
                        <span className="font-medium text-gray-800 text-sm">{activity.user}</span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{activity.content}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                href="/messages"
                className="block text-center mt-4 text-pink-600 text-sm hover:text-pink-700 font-medium"
              >
                Voir toute l&apos;activité →
              </Link>
            </div>

            {/* Conseils du jour */}
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-6 shadow-lg border border-yellow-200">
              <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
                💡 Conseil du jour
              </h2>
              <div className="text-4xl mb-3 text-center">🎯</div>
              <h3 className="font-semibold text-orange-800 mb-2">
                Optimisez votre première photo
              </h3>
              <p className="text-sm text-orange-700 mb-4">
                Un sourire naturel augmente vos chances de match de 40% ! Assurez-vous que votre visage soit bien visible.
              </p>
              <Link 
                href="/profile/edit"
                className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm hover:bg-orange-600 transition-colors inline-block"
              >
                Modifier mes photos
              </Link>
            </div>

            {/* Météo de l'amour */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                🌈 Météo de l&apos;amour
              </h2>
              <div className="text-center">
                <div className="text-5xl mb-2">☀️</div>
                <h3 className="font-bold text-purple-800 text-lg">Excellente</h3>
                <p className="text-sm text-purple-700 mb-4">
                  87% de chance de match aujourd&apos;hui !
                </p>
                <div className="bg-white/50 rounded-xl p-3">
                  <p className="text-xs text-purple-600">
                    Les dimanches sont parfaits pour les premières conversations. 
                    Les gens sont plus détendus ! 😊
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer motivationnel */}
        <div className="mt-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl p-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Votre âme sœur vous attend ! 💕</h2>
          <p className="mb-4 opacity-90">
            Chaque swipe vous rapproche de la personne qui vous correspond
          </p>
          <Link 
            href="/discover"
            className="bg-white text-pink-500 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors inline-block"
          >
            Commencer à swiper ! 🚀
          </Link>
        </div>
      </div>

      {/* Modal simple */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img 
                src={selectedProfile.images[0]} 
                alt={selectedProfile.name}
                className="w-full h-64 object-cover rounded-t-3xl"
              />
              <button 
                onClick={closeProfileModal}
                className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-2xl font-bold">{selectedProfile.name}, {selectedProfile.age}</h2>
                <p className="text-sm">{selectedProfile.job} • {selectedProfile.distance}</p>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 mb-2">À propos</h3>
                <p className="text-gray-600 text-sm">{selectedProfile.bio}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-2">Centres d'intérêt</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.interests.map((interest, index) => (
                    <span 
                      key={index}
                      className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full font-medium"
                  onClick={closeProfileModal}
                >
                  Passer
                </button>
                <button 
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-full font-medium"
                  onClick={closeProfileModal}
                >
                  J'aime
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}