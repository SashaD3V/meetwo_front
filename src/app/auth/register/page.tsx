// app/auth/register/page.tsx
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';

const INTERESTS = [
  'SPORT', 'MUSIQUE', 'CINEMA', 'VOYAGE', 'CUISINE', 'LECTURE', 'ART', 
  'JEUX_VIDEO', 'FITNESS', 'NATURE', 'TECHNOLOGIE', 'PHOTOGRAPHIE', 'DANSE', 
  'MODE', 'THEATRE', 'RANDONNEE', 'YOGA', 'MEDITATION', 'ANIMAUX', 'JARDINAGE', 
  'BRICOLAGE', 'SHOPPING', 'SORTIES_NOCTURNES', 'CONCERTS', 'FESTIVALS'
];

export default function RegisterPage() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '' as 'HOMME' | 'FEMME' | '',
    city: '',
    biography: '',
    interests: [] as string[],
    seekingRelationshipType: '' as 'RELATION_SERIEUSE' | 'RELATION_CASUAL' | ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateStep = (step: number) => {
    const newErrors: {[key: string]: string} = {};
    
    if (step === 1) {
      if (!formData.email) {
        newErrors.email = 'L\'email est requis';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email invalide';
      }
      
      if (!formData.username) {
        newErrors.username = 'Le nom d\'utilisateur est requis';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Minimum 3 caractères';
      }
      
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Minimum 6 caractères';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmez le mot de passe';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }
    
    if (step === 2) {
      if (!formData.firstName) {
        newErrors.firstName = 'Le prénom est requis';
      }
      
      if (!formData.birthDate) {
        newErrors.birthDate = 'La date de naissance est requise';
      }
      
      if (!formData.gender) {
        newErrors.gender = 'Le genre est requis';
      }
      
      if (!formData.seekingRelationshipType) {
        newErrors.seekingRelationshipType = 'Le type de relation est requis';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(2)) return;
    
    setIsLoading(true);
    try {
      // Préparer les données selon ton CreateUserRequest
      const requestData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        gender: formData.gender,
        biography: formData.biography || undefined,
        city: formData.city || undefined,
        interests: formData.interests,
        seekingRelationshipType: formData.seekingRelationshipType
      };

      console.log('Données d\'inscription:', requestData);

      // Appel à ton API Spring Boot
      const response = await api.post('/auth/register', requestData);
      
      console.log('Réponse d\'inscription:', response.data);
      
      // Si l'inscription réussit, stocker le token
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      alert('Inscription réussie ! Token reçu');
      
      // Rediriger vers le dashboard (pour l'instant juste un alert)
      router.push('/');
      
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Erreur lors de l\'inscription' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">💕</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Meetwo</h1>
          <p className="text-gray-600">Rejoignez des milliers de célibataires</p>
        </div>

        {/* Indicateur de progression */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 w-8 rounded-full transition-all ${
                  step <= currentStep ? 'bg-pink-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white/20 backdrop-blur-sm">
          
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            {/* Étape 1: Informations de base */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Informations de base</h2>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    👤 Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    style={{ color: '#111827' }}
                    className={`w-full p-4 rounded-2xl border-2 transition-colors bg-gray-50 focus:bg-white focus:outline-none placeholder:text-gray-500 ${
                      errors.username ? 'border-red-300' : 'border-gray-200 focus:border-pink-400'
                    }`}
                    placeholder="votre_nom_utilisateur"
                  />
                  {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    📧 Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={{ color: '#111827' }}
                    className={`w-full p-4 rounded-2xl border-2 transition-colors bg-gray-50 focus:bg-white focus:outline-none placeholder:text-gray-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-200 focus:border-pink-400'
                    }`}
                    placeholder="votre@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    🔒 Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      style={{ color: '#111827' }}
                      className={`w-full p-4 rounded-2xl border-2 transition-colors bg-gray-50 focus:bg-white focus:outline-none pr-12 placeholder:text-gray-500 ${
                        errors.password ? 'border-red-300' : 'border-gray-200 focus:border-pink-400'
                      }`}
                      placeholder="Minimum 6 caractères"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    🔒 Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      style={{ color: '#111827' }}
                      className={`w-full p-4 rounded-2xl border-2 transition-colors bg-gray-50 focus:bg-white focus:outline-none pr-12 placeholder:text-gray-500 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-200 focus:border-pink-400'
                      }`}
                      placeholder="Répétez votre mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  Continuer →
                </button>
              </div>
            )}

            {/* Étape 2: Informations personnelles */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Parlez-nous de vous</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      style={{ color: '#111827' }}
                      className={`w-full p-4 rounded-2xl border-2 transition-colors bg-gray-50 focus:bg-white focus:outline-none placeholder:text-gray-500 ${
                        errors.firstName ? 'border-red-300' : 'border-gray-200 focus:border-pink-400'
                      }`}
                      placeholder="John"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      style={{ color: '#111827' }}
                      className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none transition-colors bg-gray-50 focus:bg-white placeholder:text-gray-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    🎂 Date de naissance
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    style={{ color: '#111827' }}
                    className={`w-full p-4 rounded-2xl border-2 transition-colors bg-gray-50 focus:bg-white focus:outline-none ${
                      errors.birthDate ? 'border-red-300' : 'border-gray-200 focus:border-pink-400'
                    }`}
                  />
                  {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Genre
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleInputChange('gender', 'HOMME')}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        formData.gender === 'HOMME'
                          ? 'border-pink-400 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      👨 Homme
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('gender', 'FEMME')}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        formData.gender === 'FEMME'
                          ? 'border-pink-400 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      👩 Femme
                    </button>
                  </div>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    📍 Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    style={{ color: '#111827' }}
                    className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none transition-colors bg-gray-50 focus:bg-white placeholder:text-gray-500"
                    placeholder="Paris"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Je recherche
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleInputChange('seekingRelationshipType', 'RELATION_SERIEUSE')}
                      className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                        formData.seekingRelationshipType === 'RELATION_SERIEUSE'
                          ? 'border-pink-400 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      💑 Une relation sérieuse
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('seekingRelationshipType', 'RELATION_CASUAL')}
                      className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                        formData.seekingRelationshipType === 'RELATION_CASUAL'
                          ? 'border-pink-400 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      😊 Quelque chose de décontracté
                    </button>
                  </div>
                  {errors.seekingRelationshipType && <p className="text-red-500 text-sm mt-1">{errors.seekingRelationshipType}</p>}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl font-medium hover:bg-gray-300 transition-colors"
                  >
                    ← Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-bold hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Continuer →
                  </button>
                </div>
              </div>
            )}

            {/* Étape 3: Centres d'intérêt et finalisation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Dernière étape !</h2>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    📝 Bio (optionnel)
                  </label>
                  <textarea
                    value={formData.biography}
                    onChange={(e) => handleInputChange('biography', e.target.value)}
                    style={{ color: '#111827' }}
                    className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none transition-colors bg-gray-50 focus:bg-white resize-none placeholder:text-gray-500"
                    rows={3}
                    maxLength={500}
                    placeholder="Parlez-nous de vous, vos passions, ce qui vous rend unique..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.biography.length}/500 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-3">
                    ❤️ Centres d'intérêt ({formData.interests.length}/10)
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {INTERESTS.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        disabled={!formData.interests.includes(interest) && formData.interests.length >= 10}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          formData.interests.includes(interest)
                            ? 'bg-pink-500 text-white'
                            : formData.interests.length >= 10
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-100 text-gray-700 hover:bg-pink-100 hover:text-pink-600'
                        }`}
                      >
                        {interest}
                        {formData.interests.includes(interest) && (
                          <span className="ml-1">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                  {formData.interests.length >= 10 && (
                    <p className="text-amber-600 text-sm mt-2">
                      ⚠️ Maximum 10 centres d'intérêt atteint
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl font-medium hover:bg-gray-300 transition-colors"
                  >
                    ← Retour
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all transform shadow-lg ${
                      isLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 hover:scale-105'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Création...
                      </span>
                    ) : (
                      '🎉 Créer mon compte'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Lien vers connexion */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Déjà un compte ?
              <Link
                href="/auth"
                className="text-pink-600 font-medium hover:text-pink-700 ml-1"
              >
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}