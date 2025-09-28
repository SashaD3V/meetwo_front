import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'

// 🔍 [useUserProfile] Types basés sur ton backend
interface BackendUser {
  id: number
  username: string
  email: string
  name: string
  firstName: string
  lastName: string
  age: number
  birthDate: string
  gender: 'HOMME' | 'FEMME'
  biography: string
  city: string
  interests: string[]
  seekingRelationshipType: 'RELATION_SERIEUSE' | 'RELATION_CASUAL'
}

interface Photo {
  id: number
  userId: number
  url: string
  position: number
  estPrincipale: boolean
  altText?: string
  createdAt: string
  updatedAt: string
}

interface UserProfile extends BackendUser {
  photos: Photo[]
}

interface UpdateUserData {
  firstName?: string
  lastName?: string
  birthDate?: string
  biography?: string
  city?: string
  interests?: string[]
}

interface UseUserProfileReturn {
  // État
  profile: UserProfile | null
  photos: Photo[]
  isLoading: boolean
  isSaving: boolean
  error: string | null

  // Actions de base
  updateField: (field: keyof UpdateUserData, value: any) => void
  saveProfile: () => Promise<void>
  reloadProfile: () => Promise<void>

  // Actions photos
  uploadPhoto: (file: File, position?: number) => Promise<void>
  deletePhoto: (photoId: number) => Promise<void>
  reorderPhotos: (newOrder: Photo[]) => Promise<void>
  setMainPhoto: (photoId: number) => Promise<void>

  // Utilitaires
  getMainPhoto: () => Photo | null
  canAddPhoto: () => boolean
}

const MAX_PHOTOS = 6

export function useUserProfile(): UseUserProfileReturn {
  const router = useRouter()
  
  // 📦 [useUserProfile] État local
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🔍 [useUserProfile] Chargement initial des données
  const loadUserProfile = useCallback(async () => {
    console.log('🔍 [useUserProfile] Chargement du profil utilisateur...')
    
    try {
      setIsLoading(true)
      setError(null)

      // Récupérer les données utilisateur du localStorage
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        console.log('❌ [useUserProfile] Aucun utilisateur en localStorage')
        router.push('/auth/login')
        return
      }

      const userData: BackendUser = JSON.parse(storedUser)
      console.log('📦 [useUserProfile] Données utilisateur récupérées:', userData)

      // Charger les photos depuis l'API
      console.log('🔍 [useUserProfile] Chargement des photos...')
      const photosResponse = await api.get(`/photos/user/${userData.id}`)
      const userPhotos: Photo[] = photosResponse.data || []
      
      console.log('📦 [useUserProfile] Photos chargées:', {
        count: userPhotos.length,
        photos: userPhotos.map(p => ({
          id: p.id,
          position: p.position,
          estPrincipale: p.estPrincipale
        }))
      })

      // Trier les photos par position
      const sortedPhotos = userPhotos.sort((a, b) => a.position - b.position)

      setProfile({ ...userData, photos: sortedPhotos })
      setPhotos(sortedPhotos)

      console.log('✅ [useUserProfile] Profil chargé avec succès')

    } catch (error: any) {
      console.error('❌ [useUserProfile] Erreur lors du chargement:', error)
      
      if (error.response?.status === 401) {
        // Token expiré, rediriger vers login
        localStorage.removeItem('user')
        router.push('/auth/login')
        return
      }
      
      setError('Impossible de charger le profil')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // 📝 [useUserProfile] Mise à jour d'un champ
  const updateField = useCallback((field: keyof UpdateUserData, value: any) => {
    console.log('📝 [useUserProfile] Mise à jour du champ:', field, '→', value)
    
    setProfile(prev => {
      if (!prev) return null
      return { ...prev, [field]: value }
    })
  }, [])

  // 💾 [useUserProfile] Sauvegarde du profil
  const saveProfile = useCallback(async () => {
    if (!profile) return

    console.log('💾 [useUserProfile] Sauvegarde du profil utilisateur...')
    
    try {
      setIsSaving(true)
      setError(null)

      const updateData: UpdateUserData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        birthDate: profile.birthDate,
        biography: profile.biography,
        city: profile.city,
        interests: profile.interests
      }

      console.log('📦 [useUserProfile] Données à sauvegarder:', updateData)

      const response = await api.put(`/users/${profile.id}`, updateData)
      const updatedUser: BackendUser = response.data

      console.log('✅ [useUserProfile] Profil sauvegardé, données reçues:', updatedUser)

      // Mettre à jour le state et le localStorage
      const newProfile = { ...updatedUser, photos }
      setProfile(newProfile)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      console.log('✅ [useUserProfile] Profil synchronisé avec succès')

    } catch (error: any) {
      console.error('❌ [useUserProfile] Erreur sauvegarde:', error)
      setError('Erreur lors de la sauvegarde du profil')
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [profile, photos])

  // 📸 [useUserProfile] Upload d'une nouvelle photo
  const uploadPhoto = useCallback(async (file: File, position?: number) => {
    if (!profile) return

    console.log('📸 [useUserProfile] Upload d\'une nouvelle photo:', {
      fileName: file.name,
      size: file.size,
      position: position || 'auto'
    })

    try {
      setIsSaving(true)
      setError(null)

      // Déterminer la position automatiquement si non fournie
      const nextPosition = position || Math.max(0, ...photos.map(p => p.position)) + 1
      
      // Créer le FormData pour l'upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', profile.id.toString())
      formData.append('position', nextPosition.toString())
      
      // Si c'est la première photo, la marquer comme principale
      const isFirstPhoto = photos.length === 0
      if (isFirstPhoto) {
        formData.append('estPrincipale', 'true')
        console.log('🔍 [useUserProfile] Première photo, définie comme principale')
      }

      console.log('📦 [useUserProfile] Upload en cours...')
      const response = await api.post('/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const newPhoto: Photo = response.data
      console.log('✅ [useUserProfile] Photo uploadée:', newPhoto)

      // Mettre à jour l'état avec la nouvelle photo
      const updatedPhotos = [...photos, newPhoto].sort((a, b) => a.position - b.position)
      setPhotos(updatedPhotos)
      setProfile(prev => prev ? { ...prev, photos: updatedPhotos } : null)

    } catch (error: any) {
      console.error('❌ [useUserProfile] Erreur upload photo:', error)
      setError('Erreur lors de l\'upload de la photo')
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [profile, photos])

  // 🗑️ [useUserProfile] Suppression d'une photo
  const deletePhoto = useCallback(async (photoId: number) => {
    console.log('🗑️ [useUserProfile] Suppression de la photo:', photoId)

    try {
      setIsSaving(true)
      setError(null)

      await api.delete(`/photos/${photoId}`)
      console.log('✅ [useUserProfile] Photo supprimée du serveur')

      // Mettre à jour l'état local
      const updatedPhotos = photos.filter(p => p.id !== photoId)
      setPhotos(updatedPhotos)
      setProfile(prev => prev ? { ...prev, photos: updatedPhotos } : null)

      console.log('✅ [useUserProfile] État local mis à jour après suppression')

    } catch (error: any) {
      console.error('❌ [useUserProfile] Erreur suppression photo:', error)
      setError('Erreur lors de la suppression de la photo')
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [photos])

  // 🔄 [useUserProfile] Réorganisation des photos avec gestion photo principale
  const reorderPhotos = useCallback(async (newOrder: Photo[]) => {
    if (!profile) return

    console.log('🔄 [useUserProfile] Réorganisation des photos:', {
      oldOrder: photos.map(p => ({ id: p.id, pos: p.position, main: p.estPrincipale })),
      newOrder: newOrder.map((p, i) => ({ id: p.id, newPos: i + 1 }))
    })

    try {
      setIsSaving(true)
      setError(null)

      // Créer la nouvelle liste avec positions mises à jour
      const reorderedPhotos = newOrder.map((photo, index) => ({
        ...photo,
        position: index + 1,
        // La première photo devient automatiquement principale
        estPrincipale: index === 0
      }))

      console.log('📦 [useUserProfile] Nouvelle organisation:', {
        photos: reorderedPhotos.map(p => ({ 
          id: p.id, 
          position: p.position, 
          estPrincipale: p.estPrincipale 
        }))
      })

      // Appeler l'API de réorganisation
      const photoIds = reorderedPhotos.map(p => p.id)
      await api.put(`/photos/user/${profile.id}/reorder`, photoIds)

      // Si la photo principale a changé, mettre à jour explicitement
      const newMainPhoto = reorderedPhotos[0]
      if (newMainPhoto && !photos.find(p => p.id === newMainPhoto.id)?.estPrincipale) {
        console.log('🔍 [useUserProfile] Nouvelle photo principale détectée:', newMainPhoto.id)
        await api.put(`/photos/${newMainPhoto.id}/set-main`)
      }

      // Mettre à jour l'état local
      setPhotos(reorderedPhotos)
      setProfile(prev => prev ? { ...prev, photos: reorderedPhotos } : null)

      console.log('✅ [useUserProfile] Photos réorganisées avec succès')

    } catch (error: any) {
      console.error('❌ [useUserProfile] Erreur réorganisation:', error)
      setError('Erreur lors de la réorganisation des photos')
      
      // Rollback vers l'état précédent
      console.log('🔄 [useUserProfile] Rollback vers l\'état précédent')
      // L'état reste inchangé car on n'a pas mis à jour avant l'API call
      
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [profile, photos])

  // ⭐ [useUserProfile] Définir une photo comme principale
  const setMainPhoto = useCallback(async (photoId: number) => {
    console.log('⭐ [useUserProfile] Définition photo principale:', photoId)

    try {
      setIsSaving(true)
      setError(null)

      await api.put(`/photos/${photoId}/set-main`)
      console.log('✅ [useUserProfile] Photo principale mise à jour sur le serveur')

      // Mettre à jour l'état local
      const updatedPhotos = photos.map(p => ({
        ...p,
        estPrincipale: p.id === photoId
      }))

      setPhotos(updatedPhotos)
      setProfile(prev => prev ? { ...prev, photos: updatedPhotos } : null)

      console.log('✅ [useUserProfile] État local synchronisé')

    } catch (error: any) {
      console.error('❌ [useUserProfile] Erreur définition photo principale:', error)
      setError('Erreur lors de la définition de la photo principale')
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [photos])

  // 🔍 [useUserProfile] Utilitaires
  const getMainPhoto = useCallback(() => {
    return photos.find(p => p.estPrincipale) || null
  }, [photos])

  const canAddPhoto = useCallback(() => {
    return photos.length < MAX_PHOTOS
  }, [photos])

  const reloadProfile = useCallback(async () => {
    await loadUserProfile()
  }, [loadUserProfile])

  // 🚀 [useUserProfile] Chargement initial
  useEffect(() => {
    loadUserProfile()
  }, [loadUserProfile])

  return {
    // État
    profile,
    photos,
    isLoading,
    isSaving,
    error,

    // Actions de base
    updateField,
    saveProfile,
    reloadProfile,

    // Actions photos
    uploadPhoto,
    deletePhoto,
    reorderPhotos,
    setMainPhoto,

    // Utilitaires
    getMainPhoto,
    canAddPhoto
  }
}