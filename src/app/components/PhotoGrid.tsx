import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Photo {
  id: number
  url: string
  position: number
  estPrincipale: boolean
  altText?: string
}

interface PhotoGridProps {
  photos: Photo[]
  onReorder: (newOrder: Photo[]) => Promise<void>
  onDelete: (photoId: number) => Promise<void>
  onUpload: () => void
  canAddPhoto: boolean
  isLoading: boolean
}

// Composant pour une photo draggable
interface SortablePhotoProps {
  photo: Photo
  index: number
  onDelete: (photoId: number) => void
  isLoading: boolean
  isDragging?: boolean
}

function SortablePhoto({ photo, index, onDelete, isLoading, isDragging = false }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  console.log('🎯 [SortablePhoto] Rendu photo:', {
    id: photo.id,
    position: photo.position,
    estPrincipale: photo.estPrincipale,
    isDragging: isSortableDragging
  })

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group cursor-grab active:cursor-grabbing ${
        isDragging ? 'z-10' : ''
      }`}
    >
      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <img
          src={photo.url}
          alt={photo.altText || `Photo ${index + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log('❌ [SortablePhoto] Erreur chargement image:', photo.url)
            e.currentTarget.src = '/images/placeholder.jpg'
          }}
        />
      </div>
      
      {/* Badge photo principale */}
      {photo.estPrincipale && (
        <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          ⭐ Principale
        </div>
      )}
      
      {/* Indicateur de position */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-medium">
        {index + 1}
      </div>
      
      {/* Bouton suppression */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(photo.id)
        }}
        disabled={isLoading}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 z-10"
        style={{ transform: 'none' }} // Éviter les conflits avec le drag
      >
        ✕
      </button>

      {/* Indicateur de drag */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        ⋮⋮
      </div>
    </div>
  )
}

// Composant principal PhotoGrid
export default function PhotoGrid({ 
  photos, 
  onReorder, 
  onDelete, 
  onUpload, 
  canAddPhoto, 
  isLoading 
}: PhotoGridProps) {
  const [activeId, setActiveId] = useState<number | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  console.log('🔍 [PhotoGrid] Rendu avec photos:', {
    count: photos.length,
    photos: photos.map(p => ({ id: p.id, pos: p.position, main: p.estPrincipale }))
  })

  // Configuration des capteurs de drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Éviter les clics accidentels
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Gestion début du drag
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as number)
    
    console.log('🚀 [PhotoGrid] Début drag, photo ID:', active.id)
  }

  // Gestion fin du drag
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    console.log('🎯 [PhotoGrid] Fin drag:', {
      activeId: active.id,
      overId: over?.id,
      samePosition: active.id === over?.id
    })

    setActiveId(null)

    if (!over || active.id === over.id) {
      console.log('🔄 [PhotoGrid] Pas de changement de position')
      return
    }

    try {
      setIsReordering(true)
      
      // Trouver les indices
      const oldIndex = photos.findIndex(photo => photo.id === active.id)
      const newIndex = photos.findIndex(photo => photo.id === over.id)

      console.log('🔄 [PhotoGrid] Réorganisation:', {
        photoId: active.id,
        oldIndex,
        newIndex,
        oldPosition: photos[oldIndex]?.position,
        newPosition: newIndex + 1
      })

      // Créer le nouvel ordre
      const newOrder = arrayMove(photos, oldIndex, newIndex)
      
      // Mettre à jour les positions et la photo principale
      const reorderedPhotos = newOrder.map((photo, index) => ({
        ...photo,
        position: index + 1,
        // La première photo devient automatiquement principale
        estPrincipale: index === 0
      }))

      console.log('📦 [PhotoGrid] Nouvel ordre calculé:', {
        photos: reorderedPhotos.map(p => ({ 
          id: p.id, 
          position: p.position, 
          estPrincipale: p.estPrincipale 
        }))
      })

      // Appeler la fonction de réorganisation
      await onReorder(reorderedPhotos)
      
      console.log('✅ [PhotoGrid] Réorganisation terminée avec succès')

    } catch (error) {
      console.error('❌ [PhotoGrid] Erreur lors de la réorganisation:', error)
      // L'état sera automatiquement restauré par le parent via le hook
    } finally {
      setIsReordering(false)
    }
  }

  // Confirmation suppression
  const handleDelete = async (photoId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return

    try {
      console.log('🗑️ [PhotoGrid] Suppression photo:', photoId)
      await onDelete(photoId)
      console.log('✅ [PhotoGrid] Photo supprimée avec succès')
    } catch (error) {
      console.error('❌ [PhotoGrid] Erreur suppression:', error)
      alert('Erreur lors de la suppression de la photo')
    }
  }

  // Photo actuellement draggée (pour l'overlay)
  const activePhoto = activeId ? photos.find(photo => photo.id === activeId) : null

  return (
    <div className="space-y-4">
      {/* Informations */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Mes photos ({photos.length}/6)
          </h3>
          <p className="text-gray-600 text-sm">
            Glissez-déposez pour réorganiser. La première photo sera votre photo principale.
          </p>
        </div>
        
        {(isLoading || isReordering) && (
          <div className="flex items-center gap-2 text-pink-500">
            <div className="w-4 h-4 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
            <span className="text-sm">
              {isReordering ? 'Réorganisation...' : 'Chargement...'}
            </span>
          </div>
        )}
      </div>

      {/* Grid avec drag & drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Photos existantes */}
            {photos.map((photo, index) => (
              <SortablePhoto
                key={photo.id}
                photo={photo}
                index={index}
                onDelete={handleDelete}
                isLoading={isLoading || isReordering}
                isDragging={activeId === photo.id}
              />
            ))}
            
            {/* Bouton ajouter photo */}
            {canAddPhoto && (
              <button
                onClick={onUpload}
                disabled={isLoading || isReordering}
                className="aspect-square border-2 border-dashed border-pink-300 rounded-xl flex flex-col items-center justify-center text-pink-500 hover:border-pink-500 hover:text-pink-600 transition-colors disabled:opacity-50"
              >
                <span className="text-3xl mb-1">+</span>
                <span className="text-xs">Ajouter</span>
              </button>
            )}
          </div>
        </SortableContext>

        {/* Overlay pour la photo draggée */}
        <DragOverlay>
          {activePhoto ? (
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-lg">
              <img
                src={activePhoto.url}
                alt={activePhoto.altText || 'Photo'}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Messages d'information */}
      {!canAddPhoto && (
        <p className="text-amber-600 text-sm text-center">
          ⚠️ Limite de 6 photos atteinte
        </p>
      )}

      {photos.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Aucune photo ajoutée</p>
          <button
            onClick={onUpload}
            disabled={isLoading}
            className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors disabled:opacity-50"
          >
            Ajouter votre première photo
          </button>
        </div>
      )}
    </div>
  )
}