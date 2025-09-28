'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUserProfile } from '../hooks/useUserProfile'
import PhotoGrid from '../components/PhotoGrid'

const availableInterests = [
  'SPORT', 'MUSIQUE', 'CINEMA', 'VOYAGE', 'CUISINE', 'LECTURE', 'ART', 
  'JEUX_VIDEO', 'FITNESS', 'NATURE', 'TECHNOLOGIE', 'PHOTOGRAPHIE', 'DANSE', 
  'MODE', 'THEATRE', 'RANDONNEE', 'YOGA', 'MEDITATION', 'ANIMAUX', 'JARDINAGE', 
  'BRICOLAGE', 'SHOPPING', 'SORTIES_NOCTURNES', 'CONCERTS', 'FESTIVALS'
]

export default function EditProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 🔍 [EditProfile] Hook de gestion du profil utilisateur
  const {
    profile,
    photos,
    isLoading,
    isSaving,
    error,
    updateField,
    saveProfile,
    uploadPhoto,
    deletePhoto,
    reorderPhotos,
    canAddPhoto
  } = useUserProfile()

  const [activeTab, setActiveTab] = useState<'basic' | 'interests' | 'details' | 'photos'>('basic')
  const [uploadError, setUploadError] = useState<string | null>(null)

  console.log('🔍 [EditProfile] État actuel:', {
    profileLoaded: !!profile,
    photosCount: photos.length,
    isLoading,
    isSaving
  })

  // 💾 [EditProfile] Sauvegarde avec gestion d'erreur
  const handleSave = async () => {
    try {
      console.log('💾 [EditProfile] Début sauvegarde...')
      await saveProfile()
      console.log('✅ [EditProfile] Sauvegarde réussie, redirection...')
      router.push('/profile')
    } catch (error) {
      console.error('❌ [EditProfile] Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde du profil')
    }
  }

  // 🎯 [EditProfile] Gestion des centres d'intérêt
  const toggleInterest = (interest: string) => {
    if (!profile) return

    console.log('🎯 [EditProfile] Toggle intérêt:', interest)
    
    const newInterests = profile.interests.includes(interest)
      ? profile.interests.filter(i => i !== interest)
      : [...profile.interests, interest]
    
    updateField('interests', newInterests)
  }

  // 📸 [EditProfile] Gestion upload de photo
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('📸 [EditProfile] Upload photo sélectionnée:', file.name)
    
    try {
      setUploadError(null)
      await uploadPhoto(file)
      console.log('✅ [EditProfile] Photo uploadée avec succès')
      
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('❌ [EditProfile] Erreur upload:', error)
      setUploadError(error.message || 'Erreur lors de l\'upload')
    }
  }

  // 🗑️ [EditProfile] Suppression de photo (maintenant gérée par PhotoGrid)
  const handleDeletePhoto = async (photoId: number) => {
    try {
      console.log('🗑️ [EditProfile] Suppression photo via PhotoGrid:', photoId)
      await deletePhoto(photoId)
      console.log('✅ [EditProfile] Photo supprimée avec succès')
    } catch (error) {
      console.error('❌ [EditProfile] Erreur suppression:', error)
      // L'erreur est déjà gérée dans le PhotoGrid
      throw error
    }
  }

  // 📂 [EditProfile] Déclencher sélection de fichier
  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  // 🔄 [EditProfile] Écran de chargement
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

  // ❌ [EditProfile] Gestion erreur de chargement
  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  // 🚫 [EditProfile] Profil non chargé
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <p className="text-gray-600">Profil non disponible</p>
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

        {/* Affichage erreur globale */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700">
            {error}
          </div>
        )}

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
            📸 Photos ({photos.length}/6)
          </button>
          <button
            onClick={() => setActiveTab('interests')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
              activeTab === 'interests'
                ? 'bg-pink-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ❤️ Centres d'intérêt ({profile.interests.length})
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
                  onChange={(e) => updateField('firstName', e.target.value)}
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
                  onChange={(e) => updateField('lastName', e.target.value)}
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
                  onChange={(e) => updateField('birthDate', e.target.value)}
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
                  value={profile.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
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
                  value={profile.biography || ''}
                  onChange={(e) => updateField('biography', e.target.value)}
                  style={{ color: '#111827' }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={500}
                  placeholder="Parlez-nous de vous, vos passions, ce que vous recherchez..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {(profile.biography || '').length}/500 caractères
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
              {/* Affichage erreur upload */}
              {uploadError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                  {uploadError}
                </div>
              )}
              
              {/* Composant PhotoGrid avec drag & drop */}
              <PhotoGrid
                photos={photos}
                onReorder={reorderPhotos}
                onDelete={deletePhoto}
                onUpload={triggerFileSelect}
                canAddPhoto={canAddPhoto()}
                isLoading={isSaving}
              />

              {/* Input file caché */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
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
                Ces fonctionnalités seront ajoutées dans une prochaine version
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
            disabled={isSaving}
            className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
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