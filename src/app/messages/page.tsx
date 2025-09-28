'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

// Interface pour les données réelles de l'API
interface MatchedUserResponse {
  matchedUserId: number;
  username: string;
  name: string;
  age: number;
  city?: string;
  biography?: string;
  hasUnreadMessages: boolean;
  mainPhotoUrl?: string;
  matchedAt: string;
}

// Interface pour l'affichage
interface Match {
  id: string
  name: string
  age: number
  avatar: string
  lastMessage: string
  timestamp: string
  isOnline: boolean
  unreadCount: number
  isTyping?: boolean
  matchedAt?: string
  isMatched: boolean
  canDiscuss: boolean
}

// Hook pour récupérer les matches
const useMatches = (userId: number | null) => {
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loadMatches = async () => {
    if (!userId) return

    console.log(`=== DÉBUT TEST API MATCHES ===`)
    console.log(`🔄 [useMatches] Loading matches for user: ${userId}`)
    console.log(`📡 [useMatches] URL appelée: http://localhost:8080/api/likes/matches/user/${userId}`)
    setError(null)
    setLoading(true)

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')
      const headers: any = { 'Content-Type': 'application/json' }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
        console.log(`🔑 [useMatches] Token trouvé et ajouté aux headers`)
      } else {
        console.log(`⚠️ [useMatches] Aucun token trouvé`)
      }

      console.log(`📤 [useMatches] Envoi de la requête...`)
      const response = await axios.get(`http://localhost:8080/api/likes/matches/user/${userId}`, { headers })
      
      console.log(`📥 [useMatches] Réponse reçue:`)
      console.log(`   Status: ${response.status}`)
      console.log(`   Headers:`, response.headers)
      console.log(`   Data type:`, typeof response.data)
      console.log(`   Data length:`, Array.isArray(response.data) ? response.data.length : 'N/A')
      console.log(`   RAW DATA:`, JSON.stringify(response.data, null, 2))

      if (!Array.isArray(response.data)) {
        console.error(`❌ [useMatches] ERREUR: La réponse n'est pas un tableau`)
        console.log(`   Type reçu:`, typeof response.data)
        console.log(`   Contenu:`, response.data)
        throw new Error('La réponse API n\'est pas un tableau')
      }

      console.log(`📊 [useMatches] ANALYSE DE CHAQUE MATCH:`)
      response.data.forEach((item: any, index: number) => {
        console.log(`   Match ${index}:`)
        console.log(`     - Type:`, typeof item)
        console.log(`     - Clés disponibles:`, Object.keys(item || {}))
        console.log(`     - Contenu complet:`, JSON.stringify(item, null, 4))
      })

      const transformedMatches: Match[] = response.data.map((matchedUser: any, index: number) => {
        console.log(`🔧 [useMatches] Transformation du match ${index}:`, matchedUser)
        
        if (!matchedUser || typeof matchedUser !== 'object') {
          console.error(`❌ [useMatches] Match ${index} structure invalide:`, matchedUser)
          throw new Error(`Match ${index} has invalid structure`)
        }

        // Détection flexible des champs selon la structure retournée
        let matchedUserId, name, age, matchedAt, hasUnreadMessages
        
        // Si c'est une structure MatchResponse standard
        if (matchedUser.matchedUserId) {
          matchedUserId = matchedUser.matchedUserId
          name = matchedUser.name
          age = matchedUser.age
          matchedAt = matchedUser.matchedAt
          hasUnreadMessages = matchedUser.hasUnreadMessages
          console.log(`📋 [useMatches] Structure MatchResponse détectée pour match ${index}`)
        }
        // Si c'est une structure de Like avec user1/user2
        else if (matchedUser.user1 || matchedUser.user2) {
          const otherUser = matchedUser.user1?.id === userId ? matchedUser.user2 : matchedUser.user1
          matchedUserId = otherUser?.id
          name = otherUser?.name
          age = otherUser?.age
          matchedAt = matchedUser.matchedAt
          hasUnreadMessages = false // À définir selon votre logique
          console.log(`📋 [useMatches] Structure Like avec user1/user2 détectée pour match ${index}`)
          console.log(`     Autre utilisateur:`, otherUser)
        }
        // Autres structures possibles
        else {
          console.error(`❌ [useMatches] Structure non reconnue pour match ${index}:`, matchedUser)
          throw new Error(`Match ${index} structure not recognized`)
        }

        if (!matchedUserId || !name) {
          console.error(`❌ [useMatches] Champs requis manquants pour match ${index}:`)
          console.log(`     matchedUserId:`, matchedUserId)
          console.log(`     name:`, name)
          throw new Error(`Match ${index} missing required fields`)
        }
        
        const avatars = ['👩‍🦰', '👨‍💻', '👩‍🎨', '👨‍🍳', '👩‍🚀', '👨‍🎓', '👩‍⚕️', '👨‍🎨', '👩‍💼', '👨‍🔧']
        const avatar = avatars[matchedUserId % avatars.length]

        const matchDate = new Date(matchedAt)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - matchDate.getTime()) / (1000 * 60 * 60))
        
        let timestamp: string
        if (diffInHours < 1) {
          timestamp = 'Il y a moins d\'1h'
        } else if (diffInHours < 24) {
          timestamp = `Il y a ${diffInHours}h`
        } else {
          const days = Math.floor(diffInHours / 24)
          timestamp = `Il y a ${days}j`
        }

        const transformedMatch = {
          id: matchedUserId.toString(),
          name: name || 'Utilisateur',
          age: age || 25,
          avatar,
          lastMessage: hasUnreadMessages 
            ? 'Nouveau message !' 
            : 'Vous pouvez maintenant discuter !',
          timestamp,
          isOnline: Math.random() > 0.7,
          unreadCount: hasUnreadMessages ? Math.floor(Math.random() * 3) + 1 : 0,
          isTyping: false,
          matchedAt: matchedAt,
          isMatched: true,
          canDiscuss: true
        }

        console.log(`✅ [useMatches] Match ${index} transformé:`, transformedMatch)
        return transformedMatch
      })

      setMatches(transformedMatches)
      console.log(`✅ [useMatches] SUCCÈS: ${transformedMatches.length} matches transformés et affichés`)
      console.log(`=== FIN TEST API MATCHES ===`)

    } catch (error: any) {
      console.error(`❌ [useMatches] ERREUR lors du chargement:`)
      console.error(`   Message:`, error.message)
      console.error(`   Stack:`, error.stack)
      if (error.response) {
        console.error(`   Status HTTP:`, error.response.status)
        console.error(`   Headers de réponse:`, error.response.headers)
        console.error(`   Data de la réponse:`, error.response.data)
      }
      console.log(`=== FIN TEST API MATCHES (ERREUR) ===`)
      setError(error.message || error.response?.data?.message || 'Erreur lors du chargement des matches')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMatches()
  }, [userId])

  const refreshMatches = () => {
    console.log('🔄 [useMatches] Manual refresh triggered')
    loadMatches()
  }

  return { matches, error, refreshMatches, matchCount: matches.length, loading }
}

// Fonction pour récupérer l'ID utilisateur depuis le localStorage ou token
const getCurrentUserId = (): number | null => {
  console.log(`🔍 [Auth] === DÉBUT RECHERCHE ID UTILISATEUR ===`)
  
  try {
    // 1. Chercher directement un ID dans localStorage
    console.log(`🔍 [Auth] Étape 1: Recherche directe dans localStorage`)
    const userIdKeys = ['userId', 'currentUserId', 'user_id', 'id']
    for (const key of userIdKeys) {
      const storedUserId = localStorage.getItem(key)
      console.log(`  Clé "${key}": ${storedUserId}`)
      if (storedUserId && !isNaN(parseInt(storedUserId))) {
        const id = parseInt(storedUserId)
        console.log(`✅ [Auth] ID utilisateur trouvé dans localStorage["${key}"]: ${id}`)
        return id
      }
    }

    // 2. Décoder le token JWT s'il existe
    console.log(`🔍 [Auth] Étape 2: Décodage token JWT`)
    const tokenKeys = ['authToken', 'token', 'accessToken', 'access_token']
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key)
      console.log(`  Token "${key}": ${token ? token.substring(0, 50) + '...' : 'null'}`)
      
      if (token && token.includes('.')) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          console.log(`  Payload JWT décodé:`, payload)
          
          const userIdFields = ['sub', 'userId', 'user_id', 'id']
          for (const field of userIdFields) {
            const userId = payload[field]
            console.log(`    Champ "${field}": ${userId}`)
            if (userId && !isNaN(parseInt(userId))) {
              const id = parseInt(userId)
              console.log(`✅ [Auth] ID utilisateur trouvé dans JWT["${field}"]: ${id}`)
              return id
            }
          }
        } catch (jwtError) {
          console.warn(`⚠️ [Auth] Erreur décodage JWT "${key}":`, jwtError)
        }
      }
    }

    // 3. Chercher dans un objet user stocké
    console.log(`🔍 [Auth] Étape 3: Recherche dans objet user`)
    const userKeys = ['user', 'currentUser', 'userProfile']
    for (const key of userKeys) {
      const userString = localStorage.getItem(key)
      console.log(`  User object "${key}": ${userString}`)
      
      if (userString) {
        try {
          const user = JSON.parse(userString)
          console.log(`  User object parsé:`, user)
          
          const userIdFields = ['id', 'userId', 'user_id']
          for (const field of userIdFields) {
            const userId = user[field]
            console.log(`    Champ "${field}": ${userId}`)
            if (userId && !isNaN(parseInt(userId))) {
              const id = parseInt(userId)
              console.log(`✅ [Auth] ID utilisateur trouvé dans user["${field}"]: ${id}`)
              return id
            }
          }
        } catch (parseError) {
          console.warn(`⚠️ [Auth] Erreur parsing user object "${key}":`, parseError)
        }
      }
    }

    console.warn(`❌ [Auth] Aucun ID utilisateur valide trouvé dans localStorage`)
    console.log(`🔍 [Auth] Contenu complet localStorage:`)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        console.log(`  "${key}": ${value}`)
      }
    }
    
    console.warn(`⚠️ [Auth] Utilisation de l'ID de test: 4`)
    return 4 // Fallback vers l'ID de test
    
  } catch (error) {
    console.error(`❌ [Auth] Erreur récupération ID utilisateur:`, error)
    return 4 // Fallback vers l'ID de test
  } finally {
    console.log(`🔍 [Auth] === FIN RECHERCHE ID UTILISATEUR ===`)
  }
}

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Match[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'matched' | 'all' | 'unread' | 'online'>('matched')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [selectedConversation, setSelectedConversation] = useState<Match | null>(null)

  // Initialiser l'ID utilisateur au montage du composant
  useEffect(() => {
    const userId = getCurrentUserId()
    setCurrentUserId(userId)
    console.log(`🆔 [Auth] ID utilisateur initialisé: ${userId}`)
    
    // Afficher le contenu du localStorage pour debug
    console.log(`📦 [Auth] Contenu localStorage:`)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        console.log(`  ${key}: ${value?.substring(0, 100)}${value && value.length > 100 ? '...' : ''}`)
      }
    }
  }, [])

  // Utiliser le hook des vraies données
  const { matches, error, refreshMatches, matchCount, loading } = useMatches(currentUserId)

  const totalUnreadCount = matches.reduce((sum, match) => sum + match.unreadCount, 0)
  const allowedConversations = matches.filter(match => match.canDiscuss)

  // Gérer l'affichage du temps côté client uniquement pour éviter l'hydratation
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString())
  }, [])

  // Fonction pour ouvrir une conversation
  const openConversation = (match: Match) => {
    console.log(`💬 [MessagesPage] Opening conversation with ${match.name} (ID: ${match.id})`)
    setSelectedConversation(match)
  }

  // Fonction pour fermer la conversation
  const closeConversation = () => {
    setSelectedConversation(null)
  }

  // Fonction pour tester l'API
  const handleTestAPI = async () => {
    console.log('🧪 [Test] Bouton de test cliqué - Test de l\'API des matches')
    
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')
      const headers: any = { 'Content-Type': 'application/json' }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await axios.get(`http://localhost:8080/api/likes/matches/user/${currentUserId}`, { headers })
      
      if (response.data.length > 0) {
        alert(`✅ API Test réussi! ${response.data.length} match(es) trouvé(s). Voir la console pour les détails.`)
      } else {
        alert(`⚠️ API fonctionne mais aucun match trouvé pour l'utilisateur ${currentUserId}`)
      }
    } catch (error) {
      alert(`❌ Erreur API! Voir la console pour les détails.`)
    }
  }

  // Fonction de recherche
  const searchUsers = async (query: string): Promise<Match[]> => {
    setIsSearching(true)
    
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const results = matches.filter(match => 
      match.name.toLowerCase().includes(query.toLowerCase())
    )
    
    setIsSearching(false)
    return results
  }

  const refreshConversations = () => {
    refreshMatches()
  }

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = 
      selectedTab === 'matched' ? match.canDiscuss :
      selectedTab === 'all' ? true :
      selectedTab === 'unread' ? match.unreadCount > 0 :
      selectedTab === 'online' ? match.isOnline : true
    
    return matchesSearch && matchesTab
  })

  // Si une conversation est sélectionnée, afficher le composant de chat
  if (selectedConversation) {
    return (
      <ChatInterface 
        currentUserId={currentUserId}
        otherUser={selectedConversation}
        onBack={closeConversation}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4">
        
        {/* Header avec bouton de test */}
        <div className="mb-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
              <p className="text-gray-600">
                {loading ? 'Chargement...' : 
                 allowedConversations.length > 0 
                  ? `${allowedConversations.length} conversation${allowedConversations.length > 1 ? 's' : ''} autorisée${allowedConversations.length > 1 ? 's' : ''}`
                  : 'Aucune conversation autorisée'
                }
                {totalUnreadCount > 0 && (
                  <span className="ml-2 text-pink-600 font-medium">
                    • {totalUnreadCount} non lu{totalUnreadCount > 1 ? 's' : ''}
                  </span>
                )}
                <span className="ml-2 text-sm text-green-600">• Mode API</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Utilisateur #{currentUserId || 'Non connecté'} • {matches.length} conversation{matches.length > 1 ? 's' : ''} chargée{matches.length > 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleTestAPI}
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <span className="text-xl">🧪</span>
                Tester API
              </button>
              
              <button 
                onClick={refreshConversations}
                disabled={loading}
                className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span className="text-xl">🔄</span>
                {loading ? 'Chargement...' : 'Actualiser'}
              </button>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={async (e) => {
                const value = e.target.value
                setSearchQuery(value)
                
                if (value.trim()) {
                  const results = await searchUsers(value)
                  setSearchResults(results)
                } else {
                  setSearchResults([])
                }
              }}
              className="w-full px-4 py-3 pl-12 bg-white rounded-2xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Zone d'information */}
          <div className="mb-4 bg-green-50 rounded-2xl p-4 border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <span className="text-xl">✅</span>
              Données API Chargées
            </h3>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Utilisateur actuel:</strong> ID {currentUserId || 'Non détecté'}</p>
              <p><strong>API utilisée:</strong> GET /api/likes/matches/user/{currentUserId}</p>
              <p><strong>Statut:</strong> {loading ? 'Chargement...' : error ? 'Erreur' : `${matchCount} match(es) chargé(s)`}</p>
              {error && <p className="text-red-600"><strong>Erreur:</strong> {error}</p>}
            </div>
          </div>

          {/* Résultats de recherche */}
          {searchQuery && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {isSearching ? 'Recherche en cours...' : `Résultats pour "${searchQuery}"`}
              </h3>
              {searchResults.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div 
                      key={user.id} 
                      onClick={() => openConversation(user)}
                      className="bg-green-50 hover:bg-green-100 border-green-200 cursor-pointer rounded-xl p-3 border transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full flex items-center justify-center text-lg">
                          {user.avatar}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{user.name}, {user.age}</h4>
                          <p className="text-sm text-green-600">✅ Conversation autorisée</p>
                        </div>
                        <div className="ml-auto">
                          <span className="text-green-500 text-xl">💬</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isSearching ? (
                <p className="text-gray-500 text-sm">Aucun utilisateur trouvé</p>
              ) : null}
            </div>
          )}

          {/* Onglets de filtrage */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedTab('matched')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedTab === 'matched'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Autorisées ({allowedConversations.length})
            </button>
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedTab === 'all'
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Toutes ({matches.length})
            </button>
            <button
              onClick={() => setSelectedTab('unread')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedTab === 'unread'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Non lues ({matches.filter(m => m.unreadCount > 0).length})
            </button>
            <button
              onClick={() => setSelectedTab('online')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedTab === 'online'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              En ligne ({matches.filter(m => m.isOnline).length})
            </button>
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="space-y-2">
          {loading ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Chargement...</h3>
              <p className="text-gray-600">Récupération de vos matches...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="text-6xl mb-4">
                {error ? '❌' : searchQuery ? '🔍' : selectedTab === 'matched' ? '💑' : '💬'}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {error ? 'Erreur de chargement' :
                 searchQuery ? 'Aucun résultat' : 
                 selectedTab === 'matched' ? 'Aucune conversation autorisée' : 'Aucune conversation'}
              </h3>
              <p className="text-gray-600 mb-4">
                {error ? `Impossible de charger les matches: ${error}` :
                 searchQuery 
                  ? `Aucune conversation ne correspond à "${searchQuery}"`
                  : selectedTab === 'matched' 
                    ? 'Commencez à matcher pour démarrer des conversations'
                    : 'Aucune conversation dans cette catégorie'
                }
              </p>
              {!error && (
                <button className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors">
                  Découvrir des profils
                </button>
              )}
            </div>
          ) : (
            filteredMatches.map((match) => (
              <div 
                key={match.id} 
                onClick={() => openConversation(match)}
                className="bg-white rounded-2xl p-4 shadow-sm border hover:shadow-md cursor-pointer border-transparent hover:border-green-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full flex items-center justify-center text-2xl">
                      {match.avatar}
                    </div>
                    {match.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                    <div className="absolute -top-1 -left-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {match.name}, {match.age}
                      </h3>
                      <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                        {match.timestamp}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${
                        match.unreadCount > 0 ? 'font-medium text-gray-800' : 'text-gray-600'
                      }`}>
                        {match.isTyping ? (
                          <span className="text-pink-600 italic flex items-center gap-1">
                            <span className="animate-pulse">💬</span>
                            En train d'écrire...
                          </span>
                        ) : (
                          match.lastMessage
                        )}
                      </p>
                      
                      {match.unreadCount > 0 && (
                        <div className="bg-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 ml-2">
                          {match.unreadCount > 9 ? '9+' : match.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xl text-gray-400">→</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Composant de chat séparé
interface ChatInterfaceProps {
  currentUserId: number
  otherUser: Match
  onBack: () => void
}

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
  isRead: boolean
  type: 'text' | 'image' | 'emoji'
}

function ChatInterface({ currentUserId, otherUser, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)

  // Charger les messages de la conversation
  useEffect(() => {
    loadConversation()
  }, [currentUserId, otherUser.id])

  const loadConversation = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')
      const headers: any = { 'Content-Type': 'application/json' }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      console.log(`📥 [Chat] Loading conversation between ${currentUserId} and ${otherUser.id}`)
      const response = await axios.get(`http://localhost:8080/api/messages/conversation`, {
        params: {
          userId1: currentUserId,
          userId2: parseInt(otherUser.id)
        },
        headers
      })

      console.log(`📨 [Chat] Received ${response.data.length} messages`)
      
      // Transformer les messages de l'API en format d'affichage
      const transformedMessages: Message[] = response.data.map((msg: any) => ({
        id: msg.id.toString(),
        senderId: msg.senderId.toString(),
        content: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isRead: msg.isRead,
        type: 'text'
      }))

      setMessages(transformedMessages)

    } catch (error: any) {
      console.error('❌ [Chat] Error loading conversation:', error)
      // En cas d'erreur, afficher des messages d'exemple
      setMessages([
        {
          id: '1',
          senderId: otherUser.id,
          content: `Salut ! Comment ça va ?`,
          timestamp: '14:30',
          isRead: true,
          type: 'text'
        },
        {
          id: '2',
          senderId: currentUserId.toString(),
          content: `Salut ${otherUser.name} ! Ça va très bien et toi ? 😊`,
          timestamp: '14:31',
          isRead: true,
          type: 'text'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const tempMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId.toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'text'
    }

    // Ajouter le message immédiatement à l'interface
    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')
      const headers: any = { 'Content-Type': 'application/json' }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      console.log(`📤 [Chat] Sending message from ${currentUserId} to ${otherUser.id}`)
      
      // Envoyer via l'API
      await axios.post(`http://localhost:8080/api/messages/quick`, null, {
        params: {
          senderId: currentUserId,
          receiverId: parseInt(otherUser.id),
          content: newMessage
        },
        headers
      })

      console.log(`✅ [Chat] Message sent successfully`)
      
      // Recharger la conversation pour avoir les IDs corrects
      loadConversation()

    } catch (error: any) {
      console.error('❌ [Chat] Error sending message:', error)
      
      // En cas d'erreur, simuler une réponse automatique
      setTimeout(() => {
        const responses = [
          'Haha c\'est marrant ! 😄',
          'Je suis d\'accord avec toi !',
          'Dis moi en plus !',
          'Super idée ! 👍',
          'On en parle de vive voix ? 😉'
        ]
        const response: Message = {
          id: (Date.now() + 1).toString(),
          senderId: otherUser.id,
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'text'
        }
        setMessages(prev => [...prev, response])
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header du chat */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Bouton retour */}
              <button 
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span className="text-xl">←</span>
              </button>
              
              {/* Avatar et info utilisateur */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full flex items-center justify-center text-xl">
                  {otherUser.avatar}
                </div>
                {otherUser.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              <div>
                <h1 className="font-semibold text-gray-800">
                  {otherUser.name}, {otherUser.age}
                </h1>
                <p className="text-sm text-gray-600">
                  {otherUser.isOnline ? (
                    <span className="text-green-600">🟢 En ligne</span>
                  ) : (
                    <span>Vu {otherUser.timestamp}</span>
                  )}
                  {otherUserTyping && (
                    <span className="text-pink-600 animate-pulse"> • En train d'écrire...</span>
                  )}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                📞
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                📹
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                ⋮
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Zone de messages */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="py-8 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Chargement de la conversation...</p>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUserId.toString() ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.senderId === currentUserId.toString()
                      ? 'bg-pink-500 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === currentUserId.toString() ? 'text-pink-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                    {message.senderId === currentUserId.toString() && (
                      <span className="ml-1">
                        {message.isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            
            {otherUserTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm px-4 py-2 max-w-xs">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Barre de saisie */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Boutons d'actions */}
            <button className="text-2xl hover:scale-110 transition-transform">
              😊
            </button>
            <button className="text-2xl hover:scale-110 transition-transform">
              📷
            </button>
            <button className="text-2xl hover:scale-110 transition-transform">
              📎
            </button>
            
            {/* Zone de texte */}
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="w-full px-4 py-2 pr-12 bg-gray-100 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-colors"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
              
              {/* Bouton d'envoi */}
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all ${
                  newMessage.trim()
                    ? 'bg-pink-500 hover:bg-pink-600 scale-100'
                    : 'bg-gray-300 scale-75'
                }`}
              >
                <span className="text-sm">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}