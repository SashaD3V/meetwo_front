// contexts/AuthContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserService } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender: 'HOMME' | 'FEMME';
  biography?: string;
  city?: string;
  interests?: string[];
  seekingRelationshipType: 'RELATION_SERIEUSE' | 'RELATION_CASUAL';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier si l'utilisateur est connecté au démarrage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          
          // Optionnel: Vérifier si le token est encore valide
          try {
            const refreshedUser = await UserService.getUserById(parsedUser.id);
            setUser(refreshedUser);
            setIsAuthenticated(true);
          } catch (error) {
            // Si l'API retourne une erreur, nettoyer les données locales
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Ici, tu devras créer un endpoint d'authentification dans ton backend
      // Pour l'instant, je simule avec une recherche par email
      
      // TODO: Créer un vrai endpoint /auth/login dans le backend
      // const response = await apiClient.post('/auth/login', { email, password });
      
      // Simulation temporaire - À REMPLACER par le vrai endpoint
      const users = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`).then(r => r.json());
      const foundUser = users.find((u: any) => u.email === email);
      
      if (!foundUser) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Simulation des tokens - À REMPLACER par la vraie logique
      const simulatedTokens = {
        accessToken: 'fake-jwt-token-' + Date.now(),
        refreshToken: 'fake-refresh-token-' + Date.now(),
        user: foundUser
      };

      localStorage.setItem('accessToken', simulatedTokens.accessToken);
      localStorage.setItem('refreshToken', simulatedTokens.refreshToken);
      localStorage.setItem('userData', JSON.stringify(simulatedTokens.user));

      setUser(simulatedTokens.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      const newUser = await UserService.createUser(userData);
      
      // Après inscription, connecter automatiquement l'utilisateur
      // TODO: Adapter quand le backend retournera des tokens
      const simulatedTokens = {
        accessToken: 'fake-jwt-token-' + Date.now(),
        refreshToken: 'fake-refresh-token-' + Date.now(),
      };

      localStorage.setItem('accessToken', simulatedTokens.accessToken);
      localStorage.setItem('refreshToken', simulatedTokens.refreshToken);
      localStorage.setItem('userData', JSON.stringify(newUser));

      setUser(newUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user) throw new Error('Aucun utilisateur connecté');
    
    try {
      const updatedUser = await UserService.updateUser(user.id, userData);
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// HOC pour protéger les routes
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        window.location.href = '/auth/login';
      }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // La redirection se fait dans useEffect
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  return AuthenticatedComponent;
};
