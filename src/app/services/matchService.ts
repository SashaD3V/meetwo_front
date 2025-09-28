// services/matchService.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Configuration simple d'Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types basiques pour commencer
export interface User {
  id: number;
  name: string;
  age: number;
  username: string;
  city?: string;
}

export interface MatchResponse {
  user1: User;
  user2: User;
  matchedAt: string;
}

// Service pour récupérer les matches d'un utilisateur
export const getUserMatches = async (userId: number): Promise<MatchResponse[]> => {
  console.log(`🔍 [MatchService] Fetching matches for user: ${userId}`);
  
  try {
    const response = await api.get(`/likes/matches/user/${userId}`);
    
    console.log(`✅ [MatchService] Matches fetched successfully:`, {
      userId,
      matchCount: response.data.length,
      matches: response.data
    });
    
    return response.data;
    
  } catch (error) {
    console.error(`❌ [MatchService] Error fetching matches for user ${userId}:`, error);
    
    // En cas d'erreur, on peut retourner un tableau vide ou relancer l'erreur
    if (axios.isAxiosError(error)) {
      console.error(`HTTP Status: ${error.response?.status}`);
      console.error(`Error message: ${error.response?.data?.message || error.message}`);
    }
    
    throw error;
  }
};

export default { getUserMatches };