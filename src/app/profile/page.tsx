'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface UserProfile {
  id: string
  name: string
  age: number
  location: string
  bio: string
  images: string[]
  interests: string[]
  job: string
  education: string
  height: string
  lookingFor: string
  smoking: boolean
  drinking: 'never' | 'socially' | 'regularly'
}

// Profil utilisateur de démonstration
const mockUserProfile: UserProfile = {
  id: 'user-1',
  name: 'Alex',
  age: 27,
  location: 'Rennes, Bretagne',
  bio: 'Passionné de développement web et de nouvelles technologies. J\'aime les sorties entre amis, la musique live et découvrir de nouveaux restaurants. Toujours partant pour une bonne discussion !',
  images: [
    '/images/user-1.jpg',
    '/images/user-2.jpg',
    '/images/user-3.jpg'
  ],
  interests: ['Tech', 'Musique', 'Cuisine', 'Voyage', 'Sport', 'Cinéma'],
  job: 'Développeur Full-Stack',
  education: 'Master en Informatique',
  height: '1m80',
  lookingFor: 'Relation sérieuse',
  smoking: false,
  drinking: 'socially'
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const getDrinkingLabel = (drinking: string) => {
    switch (drinking) {
      case 'never': return 'Jamais'
      case 'socially': return 'En société'
      case 'regularly': return 'Régulièrement'
      default: return 'Non renseigné'
    }
  }

  const handleEditProfile = () => {
    router.push('/profile/edit')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-2xl mx-auto p-4">
        
        {/* Header avec boutons */}
        <div className="flex justify-between items-center mb-6 pt-4">
          <h1 className="text-2xl font-bold text-gray-800">Mon Profil</h1>
          <div className="flex gap-3">
            <button 
              onClick={handleEditProfile}
              className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors text-sm font-medium"
            >
              Modifier
            </button>
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition-colors text-sm font-medium">
              Paramètres
            </button>
          </div>
        </div>

        {/* Photos du profil */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="relative h-96 bg-gray-200">
            {/* Image principale */}
            <div className="w-full h-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center">
              <span className="text-white text-8xl">📷</span>
            </div>
            
            {/* Indicateurs de photos */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {profile.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Overlay avec infos principales */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h2 className="text-3xl font-bold mb-1">
                {profile.name}, {profile.age}
              </h2>
              <p className="text-lg opacity-90 mb-2">📍 {profile.location}</p>
              <p className="text-sm opacity-80">{profile.job}</p>
            </div>

            {/* Badge "En ligne" */}
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              🟢 En ligne
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-pink-600">142</div>
            <div className="text-sm text-gray-600">Likes reçus</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-600">23</div>
            <div className="text-sm text-gray-600">Matchs</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">87%</div>
            <div className="text-sm text-gray-600">Compatibilité</div>
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="space-y-4">
          
          {/* À propos */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              📝 À propos de moi
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {profile.bio}
            </p>
          </div>

          {/* Centres d'intérêt */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              ❤️ Mes centres d&apos;intérêt
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <span 
                  key={index}
                  className="bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              ℹ️ Informations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Profession</span>
                <span className="font-medium text-gray-800">{profile.job}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Études</span>
                <span className="font-medium text-gray-800">{profile.education}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Taille</span>
                <span className="font-medium text-gray-800">{profile.height}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Recherche</span>
                <span className="font-medium text-gray-800">{profile.lookingFor}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Tabac</span>
                <span className="font-medium text-gray-800">
                  {profile.smoking ? '🚬 Oui' : '🚭 Non'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Alcool</span>
                <span className="font-medium text-gray-800">
                  🍷 {getDrinkingLabel(profile.drinking)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              ⚡ Actions rapides
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all">
                🚀 Booster mon profil
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all">
                🎯 Voir qui m&apos;a liké
              </button>
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all">
                📸 Ajouter des photos
              </button>
              <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all">
                🎪 Mode invisible
              </button>
            </div>
          </div>

          {/* Badge de vérification */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 text-center">
            <div className="text-blue-600 text-xl mb-2">✅</div>
            <h4 className="font-semibold text-blue-800 mb-1">Profil vérifié</h4>
            <p className="text-blue-600 text-sm">
              Votre profil est vérifié et visible par les autres utilisateurs
            </p>
          </div>

        </div>

        {/* Bouton flottant pour éditer */}
        <button 
          onClick={handleEditProfile}
          className="fixed bottom-6 right-6 bg-pink-500 text-white w-14 h-14 rounded-full shadow-lg hover:bg-pink-600 hover:scale-110 transition-all flex items-center justify-center text-xl"
        >
          ✏️
        </button>
      </div>
    </div>
  )
}