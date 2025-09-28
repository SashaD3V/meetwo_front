import { useState, useEffect, useCallback, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import api from '@/lib/axios'

// 🔍 [useMessages] Types basés sur ton backend
interface BackendUser {
  id: number
  username: string
  name: string
  firstName: string
  lastName: string
  age: number
  city: string
  biography: string
}

interface MessageResponse {
  id: number
  senderId: number
  receiverId: number
  content: string
  isRead: boolean
  messageType: 'TEXT' | 'IMAGE' | 'EMOJI'
  createdAt: string
  updatedAt: string
  readAt?: string
}

interface ConversationResponse {
  partnerId: number
  partnerUsername: string
  partnerName: string
  partnerAge: number
  partnerCity: string
  partnerMainPhotoUrl?: string
  lastMessage?: MessageResponse
  lastMessageAt?: string
  unreadCount: number
  isOnline: boolean
  recentMessages: MessageResponse[]
}

interface Match {
  matchedUserId: number
  username: string
  name: string
  age: number
  city: string
  biography: string
  mainPhotoUrl?: string
  matchedAt: string
  hasUnreadMessages: boolean
}

interface SendMessageRequest {
  senderId: number
  receiverId: number
  content: string
  messageType?: 'TEXT' | 'IMAGE' | 'EMOJI'
}

interface UseMessagesReturn {
  // État global
  conversations: ConversationResponse[]
  matches: Match[]
  currentUser: BackendUser | null
  isLoading: boolean
  error: string | null
  
  // WebSocket
  isConnected: boolean
  onlineUsers: Set<number>
  typingUsers: Set<number>
  
  // Actions
  loadConversations: () => Promise<void>
  loadMatches: () => Promise<void>
  sendMessage: (receiverId: number, content: string) => Promise<void>
  markConversationAsRead: (partnerId: number) => Promise<void>
  deleteConversation: (partnerId: number) => Promise<void>
  
  // Messages d'une conversation spécifique
  getConversationMessages: (partnerId: number) => Promise<MessageResponse[]>
  
  // Utilitaires
  getTotalUnreadCount: () => number
  getUnreadCountForUser: (userId: number) => number
  isUserOnline: (userId: number) => boolean
  sendTypingIndicator: (receiverId: number, isTyping: boolean) => void
}

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws'

export function useMessages(): UseMessagesReturn {
  // 📦 [useMessages] État local
  const [conversations, setConversations] = useState<ConversationResponse[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [currentUser, setCurrentUser] = useState<BackendUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // WebSocket state
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set())
  
  // WebSocket client
  const clientRef = useRef<Client | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 🔍 [useMessages] Initialisation de l'utilisateur courant
  const initializeCurrentUser = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData: BackendUser = JSON.parse(storedUser)
        setCurrentUser(userData)
        console.log('🔍 [useMessages] Utilisateur courant chargé:', userData)
        return userData
      }
    } catch (error) {
      console.error('❌ [useMessages] Erreur chargement utilisateur:', error)
    }
    return null
  }, [])

  // 🔄 [useMessages] Connexion WebSocket
  const connectWebSocket = useCallback((userId: number) => {
    console.log('🔄 [useMessages] Connexion WebSocket pour utilisateur:', userId)
    
    try {
      const client = new Client({
        webSocketFactory: () => new SockJS(WEBSOCKET_URL),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        
        onConnect: (frame) => {
          console.log('✅ [useMessages] WebSocket connecté:', frame)
          setIsConnected(true)
          setError(null)
          
          // S'abonner aux messages privés
          client.subscribe(`/user/${userId}/queue/messages`, (message) => {
            console.log('📨 [useMessages] Message reçu:', message.body)
            try {
              const newMessage: MessageResponse = JSON.parse(message.body)
              handleIncomingMessage(newMessage)
            } catch (e) {
              console.error('❌ [useMessages] Erreur parsing message:', e)
            }
          })
          
          // S'abonner aux indicateurs de frappe
          client.subscribe(`/user/${userId}/queue/typing`, (message) => {
            console.log('⌨️ [useMessages] Indicateur de frappe:', message.body)
            try {
              const typingData = JSON.parse(message.body)
              handleTypingIndicator(typingData)
            } catch (e) {
              console.error('❌ [useMessages] Erreur parsing typing:', e)
            }
          })
          
          // S'abonner aux accusés de réception
          client.subscribe(`/user/${userId}/queue/read-receipts`, (message) => {
            console.log('✅ [useMessages] Accusé de réception:', message.body)
            try {
              const receiptData = JSON.parse(message.body)
              handleReadReceipt(receiptData)
            } catch (e) {
              console.error('❌ [useMessages] Erreur parsing receipt:', e)
            }
          })
        },
        
        onStompError: (frame) => {
          console.error('❌ [useMessages] Erreur STOMP:', frame)
          setIsConnected(false)
          setError('Erreur de connexion WebSocket')
        },
        
        onWebSocketClose: (event) => {
          console.log('🔌 [useMessages] WebSocket fermé:', event)
          setIsConnected(false)
          
          // Tentative de reconnexion automatique
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 [useMessages] Tentative de reconnexion...')
            connectWebSocket(userId)
          }, 3000)
        }
      })
      
      client.activate()
      clientRef.current = client
      
    } catch (error) {
      console.error('❌ [useMessages] Erreur connexion WebSocket:', error)
      setError('Impossible de se connecter au serveur de messages')
    }
  }, [])

  // 📨 [useMessages] Gestion des messages entrants
  const handleIncomingMessage = useCallback((message: MessageResponse) => {
    console.log('📨 [useMessages] Traitement message entrant:', message)
    
    setConversations(prev => {
      return prev.map(conv => {
        if (conv.partnerId === message.senderId) {
          return {
            ...conv,
            lastMessage: message,
            lastMessageAt: message.createdAt,
            unreadCount: conv.unreadCount + 1,
            recentMessages: [...conv.recentMessages.slice(-4), message] // Garder les 5 derniers
          }
        }
        return conv
      })
    })
  }, [])

  // ⌨️ [useMessages] Gestion indicateurs de frappe
  const handleTypingIndicator = useCallback((data: { senderId: number, isTyping: boolean }) => {
    console.log('⌨️ [useMessages] Indicateur frappe:', data)
    
    setTypingUsers(prev => {
      const newSet = new Set(prev)
      if (data.isTyping) {
        newSet.add(data.senderId)
      } else {
        newSet.delete(data.senderId)
      }
      return newSet
    })
    
    // Arrêter l'indicateur automatiquement après 3 secondes
    if (data.isTyping) {
      setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(data.senderId)
          return newSet
        })
      }, 3000)
    }
  }, [])

  // ✅ [useMessages] Gestion accusés de réception
  const handleReadReceipt = useCallback((data: { messageId: number, readBy: number, readAt: number }) => {
    console.log('✅ [useMessages] Accusé de réception:', data)
    
    setConversations(prev => {
      return prev.map(conv => {
        if (conv.partnerId === data.readBy) {
          return {
            ...conv,
            recentMessages: conv.recentMessages.map(msg => 
              msg.id === data.messageId ? { ...msg, isRead: true, readAt: new Date(data.readAt).toISOString() } : msg
            )
          }
        }
        return conv
      })
    })
  }, [])

  // 💬 [useMessages] Chargement des conversations
  const loadConversations = useCallback(async () => {
    if (!currentUser) return
    
    console.log('💬 [useMessages] Chargement des conversations...')
    
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.get(`/messages/conversations/user/${currentUser.id}`)
      const conversationsData: ConversationResponse[] = response.data || []
      
      console.log('📦 [useMessages] Conversations chargées:', {
        count: conversationsData.length,
        conversations: conversationsData.map(c => ({ 
          partnerId: c.partnerId, 
          partnerName: c.partnerName,
          unread: c.unreadCount 
        }))
      })
      
      setConversations(conversationsData)
      
    } catch (error: any) {
      console.error('❌ [useMessages] Erreur chargement conversations:', error)
      setError('Erreur lors du chargement des conversations')
    } finally {
      setIsLoading(false)
    }
  }, [currentUser])

  // 💕 [useMessages] Chargement des matches
  const loadMatches = useCallback(async () => {
    if (!currentUser) return
    
    console.log('💕 [useMessages] Chargement des matches...')
    
    try {
      const response = await api.get(`/likes/matches/user/${currentUser.id}`)
      const matchesData: Match[] = response.data || []
      
      console.log('📦 [useMessages] Matches chargés:', {
        count: matchesData.length,
        matches: matchesData.map(m => ({ id: m.matchedUserId, name: m.name }))
      })
      
      setMatches(matchesData)
      
    } catch (error: any) {
      console.error('❌ [useMessages] Erreur chargement matches:', error)
      setError('Erreur lors du chargement des matches')
    }
  }, [currentUser])

  // 📤 [useMessages] Envoi de message
  const sendMessage = useCallback(async (receiverId: number, content: string) => {
    if (!currentUser || !clientRef.current || !isConnected) {
      console.error('❌ [useMessages] Conditions non remplies pour envoi message')
      return
    }
    
    console.log('📤 [useMessages] Envoi message:', { receiverId, content })
    
    try {
      const messageData: SendMessageRequest = {
        senderId: currentUser.id,
        receiverId,
        content,
        messageType: 'TEXT'
      }
      
      // Envoyer via WebSocket
      clientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(messageData)
      })
      
      console.log('✅ [useMessages] Message envoyé via WebSocket')
      
      // Mettre à jour l'interface localement (optimistic update)
      const optimisticMessage: MessageResponse = {
        id: Date.now(), // ID temporaire
        senderId: currentUser.id,
        receiverId,
        content,
        isRead: false,
        messageType: 'TEXT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.partnerId === receiverId) {
            return {
              ...conv,
              lastMessage: optimisticMessage,
              lastMessageAt: optimisticMessage.createdAt,
              recentMessages: [...conv.recentMessages.slice(-4), optimisticMessage]
            }
          }
          return conv
        })
      })
      
    } catch (error: any) {
      console.error('❌ [useMessages] Erreur envoi message:', error)
      throw error
    }
  }, [currentUser, isConnected])

  // ⌨️ [useMessages] Indicateur de frappe
  const sendTypingIndicator = useCallback((receiverId: number, isTyping: boolean) => {
    if (!currentUser || !clientRef.current || !isConnected) return
    
    console.log('⌨️ [useMessages] Envoi indicateur frappe:', { receiverId, isTyping })
    
    const typingData = {
      senderId: currentUser.id,
      receiverId,
      isTyping
    }
    
    clientRef.current.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify(typingData)
    })
  }, [currentUser, isConnected])

  // 📖 [useMessages] Marquer conversation comme lue
  const markConversationAsRead = useCallback(async (partnerId: number) => {
    if (!currentUser) return
    
    console.log('📖 [useMessages] Marquage conversation comme lue:', partnerId)
    
    try {
      await api.put(`/messages/conversation/read?receiverId=${currentUser.id}&senderId=${partnerId}`)
      
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.partnerId === partnerId) {
            return {
              ...conv,
              unreadCount: 0,
              recentMessages: conv.recentMessages.map(msg => ({ ...msg, isRead: true }))
            }
          }
          return conv
        })
      })
      
      console.log('✅ [useMessages] Conversation marquée comme lue')
      
    } catch (error) {
      console.error('❌ [useMessages] Erreur marquage lecture:', error)
    }
  }, [currentUser])

  // 🗑️ [useMessages] Suppression conversation
  const deleteConversation = useCallback(async (partnerId: number) => {
    if (!currentUser) return
    
    console.log('🗑️ [useMessages] Suppression conversation:', partnerId)
    
    try {
      await api.delete(`/messages/conversation?userId=${currentUser.id}&otherUserId=${partnerId}`)
      
      setConversations(prev => prev.filter(conv => conv.partnerId !== partnerId))
      
      console.log('✅ [useMessages] Conversation supprimée')
      
    } catch (error) {
      console.error('❌ [useMessages] Erreur suppression conversation:', error)
    }
  }, [currentUser])

  // 📜 [useMessages] Messages d'une conversation
  const getConversationMessages = useCallback(async (partnerId: number): Promise<MessageResponse[]> => {
    if (!currentUser) return []
    
    console.log('📜 [useMessages] Chargement messages conversation:', partnerId)
    
    try {
      const response = await api.get(`/messages/conversation?userId1=${currentUser.id}&userId2=${partnerId}`)
      const messages: MessageResponse[] = response.data || []
      
      console.log('📦 [useMessages] Messages chargés:', messages.length)
      return messages
      
    } catch (error) {
      console.error('❌ [useMessages] Erreur chargement messages:', error)
      return []
    }
  }, [currentUser])

  // 🔢 [useMessages] Utilitaires de comptage
  const getTotalUnreadCount = useCallback(() => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0)
  }, [conversations])

  const getUnreadCountForUser = useCallback((userId: number) => {
    const conversation = conversations.find(conv => conv.partnerId === userId)
    return conversation?.unreadCount || 0
  }, [conversations])

  const isUserOnline = useCallback((userId: number) => {
    return onlineUsers.has(userId)
  }, [onlineUsers])

  // 🚀 [useMessages] Initialisation
  useEffect(() => {
    const user = initializeCurrentUser()
    if (user) {
      connectWebSocket(user.id)
      loadConversations()
      loadMatches()
    }
    
    // Cleanup à la fermeture
    return () => {
      if (clientRef.current) {
        console.log('🧹 [useMessages] Nettoyage WebSocket')
        clientRef.current.deactivate()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [initializeCurrentUser, connectWebSocket, loadConversations, loadMatches])

  return {
    // État global
    conversations,
    matches,
    currentUser,
    isLoading,
    error,
    
    // WebSocket
    isConnected,
    onlineUsers,
    typingUsers,
    
    // Actions
    loadConversations,
    loadMatches,
    sendMessage,
    markConversationAsRead,
    deleteConversation,
    
    // Messages spécifiques
    getConversationMessages,
    
    // Utilitaires
    getTotalUnreadCount,
    getUnreadCountForUser,
    isUserOnline,
    sendTypingIndicator
  }
}