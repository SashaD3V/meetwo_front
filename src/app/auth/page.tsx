// app/auth/login/page.tsx
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';

export default function LoginPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Appel à ton API Spring Boot
      const response = await api.post('/auth/login', {
        usernameOrEmail: formData.email,
        password: formData.password
      });
      
      console.log('Réponse de connexion:', response.data);
      
      // Si la connexion réussit, stocker le token
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Rediriger vers l'acceuil 
      router.push('/');
      
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Erreur de connexion' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Éléments décoratifs en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-pink-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-cyan-200 rounded-full opacity-50"></div>
        <div className="absolute bottom-20 right-32 w-24 h-24 bg-rose-200 rounded-full opacity-20"></div>
      </div>

      <div className="w-full max-w-md relative">
        
        {/* Header avec logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">💕</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Meetwo</h1>
          <p className="text-gray-600">Bon retour parmi nous !</p>
        </div>

        {/* Formulaire principal */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white/20 backdrop-blur-sm">
          
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                <span className="flex items-center gap-2">
                  📧 Email
                </span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{ color: '#111827' }}
                className={`w-full p-4 rounded-2xl border-2 transition-colors bg-gray-50 focus:bg-white focus:outline-none ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-400' 
                    : 'border-gray-200 focus:border-pink-400'
                }`}
                placeholder="votre@email.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                <span className="flex items-center gap-2">
                  🔒 Mot de passe
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  style={{ color: '#111827' }}
                  className={`w-full p-4 rounded-2xl border-2 transition-colors bg-gray-50 focus:bg-white focus:outline-none pr-12 ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-400' 
                      : 'border-gray-200 focus:border-pink-400'
                  }`}
                  placeholder="Votre mot de passe"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Options supplémentaires */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded" />
                Se souvenir de moi
              </label>
              <Link 
                href="/auth/forgot-password"
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg transition-all transform shadow-lg ${
                isLoading 
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:from-pink-600 hover:to-purple-600 hover:scale-105'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connexion...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🚀 Se connecter
                </span>
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">ou</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Connexion sociale */}
          <div className="space-y-3">
            <button 
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white py-3 rounded-2xl font-medium hover:bg-blue-600 transition-colors"
              disabled={isLoading}
            >
              <span className="text-xl">📘</span>
              Continuer avec Facebook
            </button>
            <button 
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-red-500 text-white py-3 rounded-2xl font-medium hover:bg-red-600 transition-colors"
              disabled={isLoading}
            >
              <span className="text-xl">🔴</span>
              Continuer avec Google
            </button>
          </div>

          {/* Lien vers inscription */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Pas encore de compte ?
              <Link
                href="/auth/register"
                className="text-pink-600 font-medium hover:text-pink-700 ml-1"
              >
                Inscrivez-vous
              </Link>
            </p>
          </div>
        </div>

        {/* Footer avec statistiques */}
        <div className="text-center mt-8 space-y-3">
          <div className="flex justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span className="text-pink-500">💕</span>
              <span>+10k couples formés</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-purple-500">⭐</span>
              <span>4.8/5 étoiles</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            🔒 Vos données sont sécurisées et protégées
          </p>
        </div>
      </div>
    </div>
  );
}