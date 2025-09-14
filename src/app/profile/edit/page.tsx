'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

// Profil utilisateur initial (même que dans profile/page.tsx)
const initialProfile: UserProfile = {
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

const availableInterests = [
  'Tech', 'Musique', 'Cuisine', 'Voyage', 'Sport', 'Cinéma', 'Lecture', 
  'Art', 'Danse', 'Yoga', 'Photographie', 'Nature', 'Gaming', 'Mode',
  'Fitness', 'Vin', 'Café', 'Théâtre', 'Festival', 'Plage'
]

export default function EditProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>(initialProfile)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'interests' | 'details' | 'photos'>('basic')

  const handleSave = async () => {
    setIsSaving(true)
    
    // Simuler une sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSaving(false)
    router.push('/profile')
  }

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const toggleInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const addPhoto = () => {
    // Simuler l'ajout d'une photo
    const newPhoto = `/images/user-${profile.images.length + 1}.jpg`
    setProfile(prev => ({
      ...prev,
      images: [...prev.images, newPhoto]
    }))
  }

  const removePhoto = (index: number) => {
    setProfile(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-2xl mx-auto p-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Modifier mon profil</h1>
              <p className="text-gray-600">Rendez votre profil irrésistible</p>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              isSaving 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-pink-500 text-white hover:bg-pink-600 hover:scale-105'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Sauvegarde...
              </span>
            ) : (
              'Sauvegarder'
            )}
          </button>
        </div>

        {/* Onglets */}
        <div className="flex overflow-x-auto mb-6 bg-white rounded-2xl p-2 shadow-sm">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
              activeTab === 'basic'
                ? 'bg-pink-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📝 Infos de base
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
              activeTab === 'photos'
                ? 'bg-pink-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📸 Photos
          </button>
          <button
            onClick={() => setActiveTab('interests')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
              activeTab === 'interests'
                ? 'bg-pink-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ❤️ Centres d&apos;intérêt
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
              activeTab === 'details'
                ? 'bg-pink-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ℹ️ Détails
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          
          {/* Infos de base */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              
              {/* Nom */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => updateProfile('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  placeholder="Votre prénom"
                />
              </div>

              {/* Âge */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Âge
                </label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => updateProfile('age', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  min="18"
                  max="99"
                />
              </div>

              {/* Localisation */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📍 Localisation
                </label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => updateProfile('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  placeholder="Ville, Région"
                />
              </div>

              {/* Bio */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  À propos de moi
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => updateProfile('bio', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={500}
                  placeholder="Parlez-nous de vous, vos passions, ce que vous recherchez..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {profile.bio.length}/500 caractères
                </p>
              </div>
            </div>
          )}

          {/* Photos */}
          {activeTab === 'photos' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Mes photos ({profile.images.length}/6)
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Ajoutez au moins 3 photos pour augmenter vos chances de match !
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profile.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gradient-to-br from-pink-300 to-purple-400 rounded-xl flex items-center justify-center text-4xl">
                      📷
                    </div>
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {profile.images.length < 6 && (
                  <button
                    onClick={addPhoto}
                    className="aspect-square border-2 border-dashed border-pink-300 rounded-xl flex flex-col items-center justify-center text-pink-500 hover:border-pink-500 hover:text-pink-600 transition-colors"
                  >
                    <span className="text-3xl mb-1">+</span>
                    <span className="text-xs">Ajouter</span>
                  </button>
                )}
              </div>

              <div className="mt-6 p-4 bg-pink-50 rounded-xl">
                <h4 className="font-medium text-pink-800 mb-2">💡 Conseils photos</h4>
                <ul className="text-sm text-pink-700 space-y-1">
                  <li>• Souriez naturellement</li>
                  <li>• Variez les environnements</li>
                  <li>• Évitez les photos de groupe</li>
                  <li>• Montrez vos passions</li>
                </ul>
              </div>
            </div>
          )}

          {/* Centres d'intérêt */}
          {activeTab === 'interests' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Centres d&apos;intérêt ({profile.interests.length}/10)
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Sélectionnez vos passions pour trouver des personnes compatibles
              </p>
              
              <div className="flex flex-wrap gap-3">
                {availableInterests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    disabled={!profile.interests.includes(interest) && profile.interests.length >= 10}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      profile.interests.includes(interest)
                        ? 'bg-pink-500 text-white'
                        : profile.interests.length >= 10
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-pink-100 hover:text-pink-600'
                    }`}
                  >
                    {interest}
                    {profile.interests.includes(interest) && (
                      <span className="ml-1">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {profile.interests.length >= 10 && (
                <p className="text-amber-600 text-sm mt-4">
                  ⚠️ Maximum 10 centres d&apos;intérêt atteint
                </p>
              )}
            </div>
          )}

          {/* Détails */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              
              {/* Profession */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💼 Profession
                </label>
                <input
                  type="text"
                  value={profile.job}
                  onChange={(e) => updateProfile('job', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  placeholder="Votre métier"
                />
              </div>

              {/* Études */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎓 Études
                </label>
                <input
                  type="text"
                  value={profile.education}
                  onChange={(e) => updateProfile('education', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  placeholder="Niveau d'études"
                />
              </div>

              {/* Taille */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📏 Taille
                </label>
                <input
                  type="text"
                  value={profile.height}
                  onChange={(e) => updateProfile('height', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  placeholder="Ex: 1m75"
                />
              </div>

              {/* Recherche */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 Je recherche
                </label>
                <select
                  value={profile.lookingFor}
                  onChange={(e) => updateProfile('lookingFor', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                >
                  <option value="Relation sérieuse">Relation sérieuse</option>
                  <option value="Relation décontractée">Relation décontractée</option>
                  <option value="Amitié">Amitié</option>
                  <option value="À voir">À voir</option>
                </select>
              </div>

              {/* Mode de vie */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Mode de vie</h3>
                
                <div className="space-y-4">
                  {/* Tabac */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🚬 Tabac
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateProfile('smoking', false)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          !profile.smoking
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Non fumeur
                      </button>
                      <button
                        onClick={() => updateProfile('smoking', true)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          profile.smoking
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Fumeur
                      </button>
                    </div>
                  </div>

                  {/* Alcool */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🍷 Alcool
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => updateProfile('drinking', 'never')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          profile.drinking === 'never'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Jamais
                      </button>
                      <button
                        onClick={() => updateProfile('drinking', 'socially')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          profile.drinking === 'socially'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        En société
                      </button>
                      <button
                        onClick={() => updateProfile('drinking', 'regularly')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          profile.drinking === 'regularly'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Régulièrement
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions en bas */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
              isSaving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
            }`}
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </div>
      </div>
    </div>
  )
}