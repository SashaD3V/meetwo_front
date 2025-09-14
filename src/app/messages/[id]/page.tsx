'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
  isRead: boolean
  type: 'text' | 'image' | 'emoji'
}

interface ChatUser {
  id: string
  name: string
  age: number
  avatar: string
  isOnline: boolean
  lastSeen?: string
}

// Données de démonstration
const mockUsers: { [key: string]: ChatUser } = {
  '1': {
    id: '1',
    name: 'Emma',
    age: 24,
    avatar: '👩‍🦰',
    isOnline: true
  },
  '2': {
    id: '2',
    name: 'Lucas',
    age: 28,
    avatar: '👨‍💻',
    isOnline: false,
    lastSeen: 'il y a 2h'
  },
  '3': {
    id: '3',
    name: 'Léa',
    age: 26,
    avatar: '👩‍🎨',
    isOnline: true
  },
  '4': {
    id: '4',
    name: 'Tom',
    age: 30,
    avatar: '👨‍🍳',
    isOnline: false,
    lastSeen: 'il y a 1 jour'
  },
  '5': {
    id: '5',
    name: 'Sarah',
    age: 25,
    avatar: '👩‍🚀',
    isOnline: true
  }
}

const mockMessages: { [key: string]: Message[] } = {
  '1': [
    {
      id: '1',
      senderId: '1',
      content: 'Salut ! Comment ça va ?',
      timestamp: '14:30',
      isRead: true,
      type: 'text'
    },
    {
      id: '2',
      senderId: 'me',
      content: 'Salut Emma ! Ça va très bien et toi ? 😊',
      timestamp: '14:31',
      isRead: true,
      type: 'text'
    },
    {
      id: '3',
      senderId: '1',
      content: 'Super ! J\'ai vu que tu aimes la cuisine, moi aussi ! Tu as un plat préféré ?',
      timestamp: '14:32',
      isRead: false,
      type: 'text'
    },
    {
      id: '4',
      senderId: 'me',
      content: 'Ah génial ! J\'adore faire des pâtes maison, et toi ?',
      timestamp: '14:33',
      isRead: false,
      type: 'text'
    },
    {
      id: '5',
      senderId: '1',
      content: 'Les pâtes c\'est la vie ! 🍝 Tu connais un bon resto italien ?',
      timestamp: '14:35',
      isRead: false,
      type: 'text'
    }
  ],
  '2': [
    {
      id: '1',
      senderId: '2',
      content: 'Hey ! On se fait un café demain ?',
      timestamp: '12:45',
      isRead: true,
      type: 'text'
    },
    {
      id: '2',
      senderId: 'me',
      content: 'Avec plaisir ! Tu connais un endroit sympa ?',
      timestamp: '12:50',
      isRead: true,
      type: 'text'
    }
  ]
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const chatId = params.id as string
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [messages, setMessages] = useState<Message[]>(mockMessages[chatId] || [])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  
  const currentUser = mockUsers[chatId]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Simuler que l'autre personne tape de temps en temps
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setOtherUserTyping(true)
        setTimeout(() => setOtherUserTyping(false), 2000)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    
    // Simuler une réponse automatique parfois
    if (Math.random() > 0.7) {
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
          senderId: chatId,
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'text'
        }
        setMessages(prev => [...prev, response])
      }, 1000 + Math.random() * 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Conversation introuvable</h2>
          <button 
            onClick={() => router.back()}
            className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    )
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
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span className="text-xl">←</span>
              </button>
              
              {/* Avatar et info utilisateur */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full flex items-center justify-center text-xl">
                  {currentUser.avatar}
                </div>
                {currentUser.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              <div>
                <h1 className="font-semibold text-gray-800">
                  {currentUser.name}, {currentUser.age}
                </h1>
                <p className="text-sm text-gray-600">
                  {currentUser.isOnline ? (
                    <span className="text-green-600">🟢 En ligne</span>
                  ) : (
                    <span>Vu {currentUser.lastSeen}</span>
                  )}
                  {otherUserTyping && (
                    <span className="text-pink-600 animate-pulse"> • En train d&apos;écrire...</span>
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
        <div className="py-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.senderId === 'me'
                    ? 'bg-pink-500 text-white rounded-br-md'
                    : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === 'me' ? 'text-pink-100' : 'text-gray-500'
                }`}>
                  {message.timestamp}
                  {message.senderId === 'me' && (
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
          
          <div ref={messagesEndRef} />
        </div>
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