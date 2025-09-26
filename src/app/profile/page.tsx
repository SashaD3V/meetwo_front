'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'

interface UserProfile {
  id?: number
  username?: string
  email?: string
  name?: string
  firstName?: string
  lastName?: string
  age?: number
  birthDate?: string
  location?: string
  city?: string
  bio?: string
  biography?: string
  images: string[]
  interests: string[]
  job?: string
  education?: string
  height?: string
  gender?: 'HOMME' | 'FEMME'
  seekingRelationshipType?: 'RELATION_SERIEUSE' | 'RELATION_CASUAL'
  lookingFor?: string
  smoking?: boolean
  drinking?: 'never' | 'socially' | 'regularly'
}

const availableInterests = [
  'SPORT', 'MUSIQUE', 'CINEMA', 'VOYAGE', 'CUISINE', 'LECTURE', 'ART', 
  'JEUX_VIDEO', 'FITNESS', 'NATURE', 'TECHNOLOGIE', 'PHOTOGRAPHIE', 'DANSE', 
  'MODE', 'THEATRE', 'RANDONNEE', 'YOGA', 'MEDITATION', 'ANIMAUX', 'JARDINAGE', 
  'BRICOLAGE', 'SHOPPING', 'SORTIES_NOCTURNES', 'CONCERTS', 'FESTIVALS'
]

export default function EditProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>({
    images: [],
    interests: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'interests' | 'details' | 'photos'>('basic')

  // Charger les données utilisateur au démarrage
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        
        if (!storedUser) {
          router.push('/auth/login')
          return
        }

        const userData = JSON.parse(storedUser)
        
        // Adapter les données du backend vers le format du profil
        setProfile({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          name: userData.name || userData.firstName || userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          age: userData.age,
          birthDate: userData.birthDate,
          location: userData.city || '',
          city: userData.city,
          bio: userData.biography || '',
          biography: userData.biography,
          images: [], // Pour l'instant vide, tu pourras ajouter les photos plus tard
          interests: userData.interests || [],
          job: 'Non renseigné', // Champs pas encore dans ton backend
          education: 'Non renseigné',
          height: 'Non renseigné',
          gender: userData.gender,
          seekingRelationshipType: userData.seekingRelationshipType,
          lookingFor: userData.seekingRelationshipType === 'RELATION_SERIEUSE' ? 'Relation sérieuse' : 'Relation décontractée',
          smoking: false, // Valeurs par défaut pour les nouveaux champs
          drinking: 'socially'
        })
        
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [router])

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Préparer les données pour ton backend
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        birthDate: profile.birthDate,
        biography: profile.bio,
        city: profile.location,
        interests: profile.interests
      }

      console.log('Données à sauvegarder:', updateData)

      // Appel à ton API pour mettre à jour le profil
      const response = await api.put(`/users/${profile.id}`, updateData)
      
      // Mettre à jour le localStorage avec les nouvelles données
      const updatedUser = response.data
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      alert('Profil mis à jour avec succès !')
      router.push('/profile')
      
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde du profil')
    } finally {
      setIsSaving(false)
    }
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

  // Écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
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
              <p className="text-gray-600">Bonjour {profile.firstName || profile.name} !</p>
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
            ❤️ Centres d'intérêt
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
              
              {/* Prénom */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={profile.firstName || ''}
                  onChange={(e) => updateProfile('firstName', e.target.value)}
                  style={{ color: '#111827' }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  placeholder="Votre prénom"
                />
              </div>

              {/* Nom */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de famille
                </label>
                <input
                  type="text"
                  value={profile.lastName || ''}
                  onChange={(e) => updateProfile('lastName', e.target.value)}
                  style={{ color: '#111827' }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  placeholder="Votre nom"
                />
              </div>

              {/* Date de naissance */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={profile.birthDate || ''}
                  onChange={(e) => updateProfile('birthDate', e.target.value)}
                  style={{ color: '#111827' }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                />
                {profile.age && (
                  <p className="text-xs text-gray-500 mt-2">Âge actuel: {profile.age} ans</p>
                )}
              </div>

              {/* Ville */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📍 Ville
                </label>
                <input
                  type="text"
                  value={profile.location || ''}
                  onChange={(e) => updateProfile('location', e.target.value)}
                  style={{ color: '#111827' }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  placeholder="Votre ville"
                />
              </div>

              {/* Bio */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  À propos de moi
                </label>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => updateProfile('bio', e.target.value)}
                  style={{ color: '#111827' }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={500}
                  placeholder="Parlez-nous de vous, vos passions, ce que vous recherchez..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {(profile.bio || '').length}/500 caractères
                </p>
              </div>

              {/* Infos non modifiables */}
              <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Informations du compte</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Username:</strong> {profile.username}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Genre:</strong> {profile.gender}</p>
                  <p><strong>Recherche:</strong> {profile.seekingRelationshipType}</p>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Ces informations ne peuvent pas être modifiées depuis cette page
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
                Fonctionnalité photos en cours de développement
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
            </div>
          )}

          {/* Centres d'intérêt */}
          {activeTab === 'interests' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Centres d'intérêt ({profile.interests.length}/10)
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
                  ⚠️ Maximum 10 centres d'intérêt atteint
                </p>
              )}
            </div>
          )}

          {/* Détails */}
          {activeTab === 'details' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Détails supplémentaires
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Ces fonctionnalités seront ajoutées prochainement
              </p>
              
              <div className="space-y-4 opacity-50">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">• Profession</p>
                  <p className="text-sm text-gray-600">• Études</p>
                  <p className="text-sm text-gray-600">• Taille</p>
                  <p className="text-sm text-gray-600">• Mode de vie</p>
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