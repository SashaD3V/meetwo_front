'use client'

import { useState, useEffect } from 'react'

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

// Données statiques de test
const generateMockMatches = (): Match[] => {
  const names = [
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
    'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
    'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander'
  ]
  
  const lastMessages = [
    'Salut ! Comment ça va ?',
    'Tu as passé une bonne journée ?',
    'J\'ai adoré notre conversation d\'hier 😊',
    'On se voit ce weekend ?',
    'Merci pour les photos !',
    'Match requis pour discuter',
    'Haha c\'était drôle !',
    'Bonne nuit 💤',
    'Tu fais quoi de beau ?',
    '❤️',
    'À bientôt !',
    'Super soirée hier',
    'Tu es libre demain ?',
    'Excellent choix de restaurant',
    'Message en attente...'
  ]

  const avatars = ['👩‍🦰', '👨‍💻', '👩‍🎨', '👨‍🍳', '👩‍🚀', '👨‍🎓', '👩‍⚕️', '👨‍🎨', '👩‍💼', '👨‍🔧']

  return names.map((name, index) => {
    const isMatched = Math.random() > 0.3 // 70% de chance d'être matché
    const canDiscuss = isMatched && Math.random() > 0.2 // 80% des matchés peuvent discuter
    
    return {
      id: (index + 1).toString(),
      name,
      age: Math.floor(Math.random() * 15) + 20, // 20-35 ans
      avatar: avatars[index % avatars.length],
      lastMessage: canDiscuss 
        ? lastMessages[Math.floor(Math.random() * (lastMessages.length - 1))]
        : 'Match requis pour discuter',
      timestamp: generateRandomTimestamp(),
      isOnline: Math.random() > 0.6, // 40% en ligne
      unreadCount: canDiscuss && Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
      isTyping: false,
      matchedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      isMatched,
      canDiscuss
    }
  })
}

const generateRandomTimestamp = (): string => {
  const now = new Date()
  const randomHours = Math.floor(Math.random() * 72) // Dernières 72h
  const date = new Date(now.getTime() - randomHours * 60 * 60 * 1000)
  
  if (randomHours < 1) {
    return `Il y a ${Math.floor(Math.random() * 60)}min`
  } else if (randomHours < 24) {
    return `Il y a ${randomHours}h`
  } else {
    const days = Math.floor(randomHours / 24)
    return `Il y a ${days}j`
  }
}

export default function MessagesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Match[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'matched' | 'all' | 'unread' | 'online'>('matched')
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId] = useState(42) // ID statique

  const totalUnreadCount = matches.reduce((sum, match) => sum + match.unreadCount, 0)
  const allowedConversations = matches.filter(match => match.canDiscuss)

  // Simuler le chargement initial
  useEffect(() => {
    setIsLoading(true)
    // Simuler un délai de chargement
    setTimeout(() => {
      const mockData = generateMockMatches()
      setMatches(mockData)
      setIsLoading(false)
    }, 1500)
  }, [])

  // Simuler la recherche
  const searchUsers = async (query: string): Promise<Match[]> => {
    setIsSearching(true)
    
    // Simuler un délai de recherche
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const results = matches.filter(match => 
      match.name.toLowerCase().includes(query.toLowerCase())
    )
    
    setIsSearching(false)
    return results
  }

  // Simuler l'actualisation
  const refreshConversations = () => {
    setIsLoading(true)
    setTimeout(() => {
      const updatedMatches = matches.map(match => ({
        ...match,
        isOnline: Math.random() > 0.6,
        unreadCount: match.canDiscuss && Math.random() > 0.8 ? match.unreadCount + 1 : match.unreadCount,
        isTyping: match.canDiscuss && Math.random() > 0.9
      }))
      setMatches(updatedMatches)
      setIsLoading(false)
    }, 1000)
  }

  // Simuler la frappe
  useEffect(() => {
    const interval = setInterval(() => {
      setMatches(prev => prev.map(match => ({
        ...match,
        isTyping: match.canDiscuss && Math.random() > 0.95 ? !match.isTyping : false
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = 
      selectedTab === 'matched' ? match.canDiscuss :
      selectedTab === 'all' ? true :
      selectedTab === 'unread' ? match.unreadCount > 0 :
      selectedTab === 'online' ? match.isOnline : true
    
    return matchesSearch && matchesTab
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des conversations...</p>
          <p className="text-sm text-gray-500 mt-2">Génération des données de test</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4">
        
        {/* Header */}
        <div className="mb-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
              <p className="text-gray-600">
                {allowedConversations.length > 0 
                  ? `${allowedConversations.length} conversation${allowedConversations.length > 1 ? 's' : ''} autorisée${allowedConversations.length > 1 ? 's' : ''}`
                  : 'Aucune conversation autorisée'
                }
                {totalUnreadCount > 0 && (
                  <span className="ml-2 text-pink-600 font-medium">
                    • {totalUnreadCount} non lu{totalUnreadCount > 1 ? 's' : ''}
                  </span>
                )}
                <span className="ml-2 text-sm text-green-600">• Mode démo</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Utilisateur #{currentUserId} • {matches.length} conversation{matches.length > 1 ? 's' : ''} générée{matches.length > 1 ? 's' : ''}
              </p>
            </div>
            
            <button 
              onClick={refreshConversations}
              disabled={isLoading}
              className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span className="text-xl">🔄</span>
              Actualiser
            </button>
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
            <span className="text-xl">🔍</span>
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

          {/* Résultats de recherche */}
          {searchQuery && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {isSearching ? 'Recherche en cours...' : `Résultats pour "${searchQuery}"`}
              </h3>
              {searchResults.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div key={user.id} className={`rounded-xl p-3 border transition-colors ${
                      user.canDiscuss 
                        ? 'bg-green-50 hover:bg-green-100 border-green-200 cursor-pointer' 
                        : 'bg-red-50 border-red-200 cursor-not-allowed'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full flex items-center justify-center text-lg">
                          {user.avatar}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{user.name}, {user.age}</h4>
                          <p className="text-sm text-green-600">
                            {user.canDiscuss ? '✅ Conversation autorisée' : '❌ Match requis'}
                          </p>
                        </div>
                        <div className="ml-auto">
                          {user.canDiscuss ? (
                            <span className="text-green-500 text-xl">💬</span>
                          ) : (
                            <span className="text-gray-400">🔒</span>
                          )}
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
          {filteredMatches.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="text-6xl mb-4">
                {selectedTab === 'matched' ? '💑' : '💬'}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchQuery ? 'Aucun résultat' : 
                 selectedTab === 'matched' ? 'Aucune conversation autorisée' : 'Aucune conversation'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `Aucune conversation ne correspond à "${searchQuery}"`
                  : selectedTab === 'matched' 
                    ? 'Pas de conversations disponibles dans cette catégorie'
                    : 'Commencez à matcher pour démarrer des conversations'
                }
              </p>
              <button className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors">
                Découvrir des profils
              </button>
            </div>
          ) : (
            filteredMatches.map((match) => (
              <div key={match.id} className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
                match.canDiscuss 
                  ? 'hover:shadow-md cursor-pointer border-transparent hover:border-green-200' 
                  : 'cursor-not-allowed opacity-75 border-red-200'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full flex items-center justify-center text-2xl">
                      {match.avatar}
                    </div>
                    {match.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                    <div className={`absolute -top-1 -left-1 w-6 h-6 border-2 border-white rounded-full flex items-center justify-center ${
                      match.canDiscuss ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      <span className="text-white text-xs">{match.canDiscuss ? '✓' : '✕'}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${
                        match.canDiscuss ? 'text-gray-800' : 'text-gray-600'
                      }`}>
                        {match.name}, {match.age}
                      </h3>
                      <span className={`text-sm flex-shrink-0 ml-2 ${
                        match.canDiscuss ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {match.canDiscuss ? match.timestamp : 'Bloqué'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${
                        match.canDiscuss && match.unreadCount > 0 ? 'font-medium text-gray-800' : 'text-gray-600'
                      }`}>
                        {match.isTyping ? (
                          <span className="text-pink-600 italic flex items-center gap-1">
                            <span className="animate-pulse">💬</span>
                            En train d'écrire...
                          </span>
                        ) : match.canDiscuss ? (
                          match.lastMessage
                        ) : (
                          '🔒 Match requis pour discuter'
                        )}
                      </p>
                      
                      {match.unreadCount > 0 && match.canDiscuss && (
                        <div className="bg-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 ml-2">
                          {match.unreadCount > 9 ? '9+' : match.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`text-xl ${match.canDiscuss ? 'text-gray-400' : 'text-gray-400'}`}>
                    {match.canDiscuss ? '→' : '🔒'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats et informations */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-pink-600">{matches.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{allowedConversations.length}</div>
            <div className="text-sm text-gray-600">Autorisées</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{matches.filter(m => m.isOnline).length}</div>
            <div className="text-sm text-gray-600">En ligne</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-red-600">{totalUnreadCount}</div>
            <div className="text-sm text-gray-600">Non lus</div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-xl text-center hover:from-pink-600 hover:to-purple-600 transition-all">
              <div className="text-2xl mb-1">🔍</div>
              <div className="text-sm font-medium">Découvrir</div>
            </button>
            <button 
              onClick={() => {
                const availableMatches = matches.filter(m => m.canDiscuss)
                if (availableMatches.length > 0) {
                  const randomMatch = availableMatches[Math.floor(Math.random() * availableMatches.length)]
                  alert(`Redirection vers la conversation avec ${randomMatch.name}`)
                } else {
                  alert('Aucune conversation autorisée !')
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-xl text-center hover:from-blue-600 hover:to-cyan-600 transition-all"
            >
              <div className="text-2xl mb-1">🎲</div>
              <div className="text-sm font-medium">Aléatoire</div>
            </button>
            <button 
              onClick={refreshConversations}
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-xl text-center hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50"
            >
              <div className="text-2xl mb-1">🔄</div>
              <div className="text-sm font-medium">Recharger</div>
            </button>
          </div>
        </div>

        {/* Informations sur la version démo */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-xl">🎭</span>
            Version Démo - Données Statiques
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p><strong>Conversations générées :</strong> {matches.length} profils aléatoires</p>
              <p><strong>Statut en ligne :</strong> Mise à jour automatique toutes les 3s</p>
              <p><strong>Messages non lus :</strong> Générés aléatoirement</p>
            </div>
            <div className="space-y-2">
              <p><strong>Recherche :</strong> Filtrage local par nom</p>
              <p><strong>Permissions :</strong> 70% des profils peuvent discuter</p>
              <p><strong>Actualisation :</strong> Simule de nouvelles données</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Note :</strong> Cette version utilise des données factices générées aléatoirement. 
              Les fonctionnalités de chat, WebSocket et base de données ont été supprimées.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}