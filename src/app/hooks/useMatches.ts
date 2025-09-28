// hooks/useMatches.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

// Types basiques
export interface User {
  id: number;
  name: string;
  age: number;
  username: string;
  city?: string;
}

export interface MatchData {
  user1: User;
  user2: User;
  matchedAt: string;
}

export interface ConversationMatch {
  id: number;
  name: string;
  age: number;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  unreadCount: number;
  isMatched: boolean;
  canDiscuss: boolean;
  matchedAt: string;
}

// Hook pour récupérer les matches
export const useMatches = (userId: number | null) => {
  const [matches, setMatches] = useState<ConversationMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = async () => {
    if (!userId) return;

    console.log(`🔄 [useMatches] Loading matches for user: ${userId}`);
    setIsLoading(true);
    setError(null);

    try {
      // Configuration pour l'API
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Appel API pour récupérer les matches
      const response = await axios.get(`http://localhost:8080/api/likes/matches/user/${userId}`, {
        headers
      });

      console.log(`✅ [useMatches] Received ${response.data.length} matches`);

      // Transformer les données API en format d'affichage
      const transformedMatches: ConversationMatch[] = response.data.map((match: MatchData, index: number) => {
        // Déterminer l'autre utilisateur dans le match
        const otherUser = match.user1.id === userId ? match.user2 : match.user1;
        
        // Générer un avatar simple basé sur l'ID
        const avatars = ['👩‍🦰', '👨‍💻', '👩‍🎨', '👨‍🍳', '👩‍🚀', '👨‍🎓', '👩‍⚕️', '👨‍🎨', '👩‍💼', '👨‍🔧'];
        const avatar = avatars[otherUser.id % avatars.length];

        // Calculer le timestamp depuis le match
        const matchDate = new Date(match.matchedAt);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - matchDate.getTime()) / (1000 * 60 * 60));
        
        let timestamp: string;
        if (diffInHours < 1) {
          timestamp = 'Il y a moins d\'1h';
        } else if (diffInHours < 24) {
          timestamp = `Il y a ${diffInHours}h`;
        } else {
          const days = Math.floor(diffInHours / 24);
          timestamp = `Il y a ${days}j`;
        }

        return {
          id: otherUser.id,
          name: otherUser.name,
          age: otherUser.age,
          avatar,
          lastMessage: 'Vous pouvez maintenant discuter !', // Message par défaut
          timestamp,
          isOnline: Math.random() > 0.7, // TODO: Implémenter le statut en ligne
          unreadCount: 0, // TODO: Récupérer depuis l'API des messages
          isMatched: true,
          canDiscuss: true, // Puisque c'est un match
          matchedAt: match.matchedAt
        };
      });

      setMatches(transformedMatches);
      console.log(`✅ [useMatches] Transformed ${transformedMatches.length} matches for display`);

    } catch (error: any) {
      console.error('❌ [useMatches] Error loading matches:', error);
      setError(error.response?.data?.message || 'Erreur lors du chargement des matches');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger au montage et quand userId change
  useEffect(() => {
    loadMatches();
  }, [userId]);

  // Fonction pour rafraîchir manuellement
  const refreshMatches = () => {
    console.log('🔄 [useMatches] Manual refresh triggered');
    loadMatches();
  };

  return {
    matches,
    isLoading,
    error,
    refreshMatches,
    matchCount: matches.length
  };
};