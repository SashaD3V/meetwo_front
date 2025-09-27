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
  images: { id: number; url: string; position?: number }[] // Ajout de la position
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
  const [isUploading, setIsUploading] = useState(false)
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null)
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
          images: [],
          interests: userData.interests || [],
          job: 'Non renseigné',
          education: 'Non renseigné',
          height: 'Non renseigné',
          gender: userData.gender,
          seekingRelationshipType: userData.seekingRelationshipType,
          lookingFor: userData.seekingRelationshipType === 'RELATION_SERIEUSE' ? 'Relation sérieuse' : 'Relation décontractée',
          smoking: false,
          drinking: 'socially'
        })
        
        // Charger les photos
        if (userData.id) {
          await loadUserPhotos(userData.id)
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [router])

  // Charger les photos de l'utilisateur
  const loadUserPhotos = async (userId: number) => {
    try {
      const response = await api.get(`/photos/user/${userId}`)
      console.log('Réponse complète API photos:', response.data)
      
      // Transformer les données pour inclure l'ID et l'URL
      // ET TRIER PAR POSITION pour avoir l'ordre correct
      const photosWithIds = response.data
        .map((photo: any) => ({
          id: photo.id,
          url: photo.url,
          position: photo.position || 0
        }))
        .sort((a: any, b: any) => a.position - b.position) // Tri par position
      
      console.log('Photos triées par position:', photosWithIds)
      
      setProfile(prev => ({
        ...prev,
        images: photosWithIds
      }))
      
    } catch (error) {
      console.error('Erreur lors du chargement des photos:', error)
    }
  }

  // Upload de photo

// Remplacez votre fonction handleFileUpload par celle-ci
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return

  console.log('=== DÉBUT UPLOAD CORRIGÉ ===')
  
  // Validations côté client
  if (!file.type.startsWith('image/')) {
    alert('Veuillez sélectionner un fichier image')
    return
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB
    alert('Le fichier est trop volumineux (maximum 10MB)')
    return
  }

  if (profile.images.length >= 6) {
    alert('Vous ne pouvez pas avoir plus de 6 photos')
    return
  }

  if (!profile.id) {
    alert('Erreur: ID utilisateur manquant')
    return
  }

  try {
    setIsUploading(true)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', profile.id.toString())
    const nextPosition = Math.max(...profile.images.map(img => img.position || 0), 0) + 1
formData.append('position', nextPosition.toString())

console.log('=== CALCUL POSITION CORRIGÉ ===')
console.log('Photos actuelles:', profile.images.map(img => ({ id: img.id, position: img.position })))
console.log('Prochaine position calculée:', nextPosition)
    formData.append('estPrincipale', (profile.images.length === 0).toString())
    formData.append('altText', `Photo de ${profile.firstName || 'utilisateur'}`)

    console.log('=== DONNÉES ENVOYÉES ===')
    console.log('userId:', profile.id)
    console.log('position:', profile.images.length + 1)
    console.log('estPrincipale:', profile.images.length === 0)
    console.log('file name:', file.name)
    console.log('file size:', file.size)

    // CORRECTION CRITIQUE: Supprimer le Content-Type pour FormData
    const response = await api.post('/photos', formData, {
      headers: {
        'Content-Type': undefined, // Laisser le navigateur gérer
      },
      timeout: 60000, // 1 minute pour les gros fichiers
    })

    console.log('=== SUCCÈS ===')
    console.log('Status:', response.status)
    console.log('Response:', response.data)

    // Recharger les photos après upload
    if (profile.id) {
      await loadUserPhotos(profile.id)
    }
    
    alert('Photo ajoutée avec succès !')

  } catch (error: any) {
    console.error('=== ERREUR COMPLÈTE ===')
    
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
      console.error('URL complète:', error.config?.baseURL + error.config?.url)
      
      let errorMessage = 'Erreur lors de l\'upload de la photo'
      
      if (error.response.status === 404) {
        errorMessage = 'Endpoint non trouvé. Vérifiez que le serveur est démarré.'
      } else if (error.response.status === 400) {
        errorMessage = `Erreur de validation: ${error.response.data.message || 'Données invalides'}`
      } else if (error.response.status === 413) {
        errorMessage = 'Fichier trop volumineux'
      } else if (error.response.status === 500) {
        errorMessage = 'Erreur serveur interne'
      }
      
      alert(errorMessage)
      
    } else if (error.request) {
      console.error('Pas de réponse du serveur')
      alert('Impossible de contacter le serveur. Vérifiez que votre backend est démarré.')
    } else {
      console.error('Message:', error.message)
      alert(`Erreur: ${error.message}`)
    }
    
  } finally {
    setIsUploading(false)
    event.target.value = ''
    console.log('=== FIN UPLOAD ===')
  }
}

  // Supprimer une photo
  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      return
    }

    try {
      setDeletingPhotoId(photoId)
      
      await api.delete(`/photos/${photoId}`)
      
      // Recharger les photos après suppression
      await loadUserPhotos(profile.id!)
      
      alert('Photo supprimée avec succès !')
      
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de la photo')
    } finally {
      setDeletingPhotoId(null)
    }
  }

  // Définir comme photo principale
  const handleSetMainPhoto = async (photoId: number) => {
    try {
      await api.put(`/photos/${photoId}/set-main`)
      
      // Recharger les photos pour refléter le changement
      await loadUserPhotos(profile.id!)
      
      alert('Photo définie comme principale !')
      
    } catch (error: any) {
      console.error('Erreur lors de la définition de la photo principale:', error)
      alert('Erreur lors de la définition de la photo principale')
    }
  }

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
            📸 Photos ({profile.images.length}/6)
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
                Ajoutez vos plus belles photos ! La première sera votre photo principale.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {profile.images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img 
                      src={image.url} 
                      alt={`Photo ${index + 1}`}
                      className="aspect-square object-cover rounded-xl w-full"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/150/150'
                      }}
                    />
                    
                    {/* Badge photo principale */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                        Principale
                      </div>
                    )}
                    
                    {/* Actions sur hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                      
                      {/* Bouton définir comme principale (si ce n'est pas déjà la principale) */}
                      {index !== 0 && (
                        <button
                          onClick={() => handleSetMainPhoto(image.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                          title="Définir comme photo principale"
                        >
                          <span className="text-sm">★</span>
                        </button>
                      )}
                      
                      {/* Bouton supprimer */}
                      <button
                        onClick={() => handleDeletePhoto(image.id)}
                        disabled={deletingPhotoId === image.id}
                        className={`text-white p-2 rounded-full transition-colors ${
                          deletingPhotoId === image.id
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                        title="Supprimer cette photo"
                      >
                        {deletingPhotoId === image.id ? (
                          <span className="text-sm animate-spin">⏳</span>
                        ) : (
                          <span className="text-sm">🗑️</span>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Bouton d'ajout de photo */}
                {profile.images.length < 6 && (
                  <div className="aspect-square border-2 border-dashed border-pink-300 rounded-xl flex flex-col items-center justify-center text-pink-500 hover:border-pink-500 hover:text-pink-600 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-pink-300 border-t-pink-500 rounded-full animate-spin mb-1"></div>
                        <span className="text-xs">Upload...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl mb-1">+</span>
                        <span className="text-xs">Ajouter</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 bg-pink-50 rounded-xl">
                <h4 className="font-medium text-pink-800 mb-2">💡 Conseils photos</h4>
                <ul className="text-sm text-pink-700 space-y-1">
                  <li>• Souriez naturellement</li>
                  <li>• Variez les environnements</li>
                  <li>• Évitez les photos de groupe</li>
                  <li>• Montrez vos passions</li>
                  <li>• Survolez une photo pour la modifier ou la supprimer</li>
                  <li>• Maximum 10MB par photo</li>
                </ul>
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