'use client'

import { useState } from 'react'
import Link from 'next/link'

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
}

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
  isRead: boolean
}

// Données de démonstration
const mockMatches: Match[] = [
  {
    id: '1',
    name: 'Emma',
    age: 24,
    avatar: '👩‍🦰',
    lastMessage: 'Salut ! Comment ça va ? 😊',
    timestamp: '14:32',
    isOnline: true,
    unreadCount: 2,
    isTyping: false
  },
  {
    id: '2',
    name: 'Lucas',
    age: 28,
    avatar: '👨‍💻',
    lastMessage: 'On se fait un café demain ?',
    timestamp: '12:45',
    isOnline: false,
    unreadCount: 0,
    isTyping: false
  },
  {
    id: '3',
    name: 'Léa',
    age: 26,
    avatar: '👩‍🎨',
    lastMessage: 'J\'ai adoré ce restaurant ! Merci pour la recommandation 🍝',
    timestamp: 'Hier',
    isOnline: true,
    unreadCount: 1,
    isTyping: true
  },
  {
    id: '4',
    name: 'Tom',
    age: 30,
    avatar: '👨‍🍳',
    lastMessage: 'À bientôt pour notre cours de cuisine !',
    timestamp: 'Vendredi',
    isOnline: false,
    unreadCount: 0,
    isTyping: false
  },
  {
    id: '5',
    name: 'Sarah',
    age: 25,
    avatar: '👩‍🚀',
    lastMessage: 'Tu as vu le dernier épisode ?',
    timestamp: 'Jeudi',
    isOnline: true,
    unreadCount: 3,
    isTyping: false
  }
]

export default function MessagesPage() {
  const [matches, setMatches] = useState<Match[]>(mockMatches)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'online'>('all')

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = 
      selectedTab === 'all' ? true :
      selectedTab === 'unread' ? match.unreadCount > 0 :
      selectedTab === 'online' ? match.isOnline : true
    
    return matchesSearch && matchesTab
  })

  const totalUnreadCount = matches.reduce((sum, match) => sum + match.unreadCount, 0)

  const getTimeDisplay = (timestamp: string) => {
    return timestamp
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
                {totalUnreadCount > 0 ? `${totalUnreadCount} nouveau${totalUnreadCount > 1 ? 'x' : ''} message${totalUnreadCount > 1 ? 's' : ''}` : 'Tous vos messages'}
              </p>
            </div>
            
            {/* Bouton nouveau message */}
            <button className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors flex items-center gap-2">
              <span className="text-xl">✉️</span>
              Nouveau
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white rounded-2xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ❌
              </button>
            )}
          </div>

          {/* Onglets de filtrage */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTab === 'all'
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tous ({matches.length})
            </button>
            <button
              onClick={() => setSelectedTab('unread')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTab === 'unread'
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Non lus ({matches.filter(m => m.unreadCount > 0).length})
            </button>
            <button
              onClick={() => setSelectedTab('online')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTab === 'online'
                  ? 'bg-pink-500 text-white'
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
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchQuery ? 'Aucun résultat' : 'Aucune conversation'}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? `Aucune conversation ne correspond à "${searchQuery}"`
                  : 'Commencez à matcher pour démarrer des conversations !'
                }
              </p>
              {!searchQuery && (
                <Link 
                  href="/discover"
                  className="inline-block mt-4 bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors"
                >
                  Découvrir des profils
                </Link>
              )}
            </div>
          ) : (
            filteredMatches.map((match) => (
              <Link key={match.id} href={`/messages/${match.id}`}>
                <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-pink-200">
                  <div className="flex items-center gap-4">
                    
                    {/* Avatar avec indicateur en ligne */}
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full flex items-center justify-center text-2xl">
                        {match.avatar}
                      </div>
                      {match.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Contenu de la conversation */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {match.name}, {match.age}
                        </h3>
                        <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                          {getTimeDisplay(match.timestamp)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          match.unreadCount > 0 ? 'font-medium text-gray-800' : 'text-gray-600'
                        }`}>
                          {match.isTyping ? (
                            <span className="text-pink-600 italic flex items-center gap-1">
                              <span className="animate-pulse">💬</span>
                              En train d&apos;écrire...
                            </span>
                          ) : (
                            match.lastMessage
                          )}
                        </p>
                        
                        {/* Badge de messages non lus */}
                        {match.unreadCount > 0 && (
                          <div className="bg-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 ml-2">
                            {match.unreadCount > 9 ? '9+' : match.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Icône de flèche */}
                    <div className="text-gray-400 text-xl">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Actions rapides en bas */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link 
              href="/discover"
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-xl text-center hover:from-pink-600 hover:to-purple-600 transition-all"
            >
              <div className="text-2xl mb-1">🔍</div>
              <div className="text-sm font-medium">Découvrir</div>
            </Link>
            <Link 
              href="/matches"
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-xl text-center hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              <div className="text-2xl mb-1">💖</div>
              <div className="text-sm font-medium">Matchs</div>
            </Link>
            <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-xl text-center hover:from-blue-600 hover:to-cyan-600 transition-all">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-sm font-medium">Super Likes</div>
            </button>
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-xl text-center hover:from-orange-600 hover:to-red-600 transition-all">
              <div className="text-2xl mb-1">🚀</div>
              <div className="text-sm font-medium">Booster</div>
            </button>
          </div>
        </div>

        {/* Stats en bas */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-pink-600">{matches.length}</div>
            <div className="text-sm text-gray-600">Conversations</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{matches.filter(m => m.isOnline).length}</div>
            <div className="text-sm text-gray-600">En ligne</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{totalUnreadCount}</div>
            <div className="text-sm text-gray-600">Non lus</div>
          </div>
        </div>
      </div>
    </div>
  )
}