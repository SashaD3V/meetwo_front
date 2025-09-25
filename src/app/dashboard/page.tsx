// app/dashboard/page.tsx
'use client'

import { useAuth, withAuth } from '@/contexts/AuthContext';
import { useMessages, useLikes } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PhotoService, UserService } from '@/lib/api';

function DashboardPage() {
  const { user, logout } = useAuth();
  const { conversations, unreadCount, loadConversations } = useMessages(user?.id);
  const { matches, stats, loadMatches, loadStats } = useLikes(user?.id);
  
  const [currentTime, setCurrentTime] = useState('');
  const [userPhotos, setUserPhotos] = useState<any[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      let greeting = 'Bonsoir';
      if (hours < 12) greeting = 'Bonjour';
      else if (hours < 18) greeting = 'Bon après-midi';
      setCurrentTime(greeting);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Charger les photos de l'utilisateur
  useEffect(() => {
    if (user?.id) {
      PhotoService.getPhotosByUserId(user.id)
        .then(setUserPhotos)
        .catch(console.error);
    }
  }, [user?.id]);

  const quickStats = [
    { icon: '👀', label: 'Vues aujourd\'hui', value: '12', color: 'blue' },
    { icon: '💖', label: 'Likes reçus', value: stats?.likesReceived?.toString() || '0', color: 'pink' },
    { icon: '⚡', label: 'Nouveaux matchs', value: matches?.length?.toString() || '0', color: 'green' },
    { icon: '💬', label: 'Messages', value: unreadCount?.toString() || '0', color: 'purple' }
  ];

  const getStatColor = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-cyan-500';
      case 'pink': return 'from-pink-500 to-rose-500';
      case 'green': return 'from-green-500 to-emerald-500';
      case 'purple': return 'from-purple-500 to-violet-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-4">

        {/* Header avec navigation */}
        <div className="flex justify-between items-center mb-8 pt-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {currentTime}, {user.firstName || user.name} ! 👋
              </h1>
              <p className="text-gray-600">Prêt à faire de nouvelles rencontres ?</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-white transition-colors"
              title="Mon profil"
            >
              👤
            </Link>
            <Link
              href="/settings"
              className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-white transition-colors"
              title="Paramètres"
            >
              ⚙️
            </Link>
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-white transition-colors"
              title="Se déconnecter"
            >
              🚪
            </button>
          </div>
        </div>

        {/* Header de bienvenue avec statistiques */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Votre activité</h2>
                <p className="text-gray-600">Voici un aperçu de vos interactions</p>
              </div>
              <div className="text-4xl">🌟</div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickStats.map((stat, index) => (
                <div key={index} className={`bg-gradient-to-r ${getStatColor(stat.color)} rounded-2xl p-4 text-white text-center`}>
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Actions principales */}
          <div className="lg:col-span-2 space-y-6">

            {/* Navigation rapide */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                🚀 Actions rapides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/discover"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-2xl hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl mb-2">🔥</div>
                      <h3 className="font-bold text-lg">Découvrir</h3>
                      <p className="text-sm opacity-90">Trouvez votre match parfait</p>
                    </div>
                    <div className="text-2xl group-hover:scale-110 transition-transform">→</div>
                  </div>
                </Link>

                <Link
                  href="/messages"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 group relative"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl mb-2">💬</div>
                      <h3 className="font-bold text-lg">Messages</h3>
                      <p className="text-sm opacity-90">{conversations.length} conversations</p>
                    </div>
                    <div className="text-2xl group-hover:scale-110 transition-transform">→</div>
                  </div>
                  {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </Link>

                <Link
                  href="/matches"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl mb-2">💖</div>
                      <h3 className="font-bold text-lg">Mes Matchs</h3>
                      <p className="text-sm opacity-90">{matches.length} matchs</p>
                    </div>
                    <div className="text-2xl group-hover:scale-110 transition-transform">→</div>
                  </div>
                </Link>

                <Link
                  href="/profile"
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl mb-2">👤</div>
                      <h3 className="font-bold text-lg">Mon Profil</h3>
                      <p className="text-sm opacity-90">{userPhotos.length} photos</p>
                    </div>
                    <div className="text-2xl group-hover:scale-110 transition-transform">→</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Derniers matchs */}
            {matches.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  ✨ Derniers matchs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {matches.slice(0, 3).map((match) => (
                    <Link
                      key={match.matchedUserId}
                      href={`/messages/${match.matchedUserId}`}
                      className="bg-gradient-to-br from-pink-100 to-purple-100 p-4 rounded-2xl text-center cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-2">
                        {match.mainPhotoUrl ? (
                          <img 
                            src={match.mainPhotoUrl} 
                            alt={match.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">👤</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-800">{match.name}</h3>
                      <p className="text-sm text-gray-600">{match.city}</p>
                      <p className="text-xs text-pink-600 mt-1">
                        Match {new Date(match.matchedAt).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                </div>
                {matches.length > 3 && (
                  <Link
                    href="/matches"
                    className="block text-center mt-4 text-pink-600 text-sm hover:text-pink-700 font-medium"
                  >
                    Voir tous les matchs ({matches.length}) →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Sidebar droite */}
          <div className="space-y-6">

            {/* Conversations récentes */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                🔔 Conversations récentes
              </h2>
              <div className="space-y-4">
                {conversations.slice(0, 4).map((conv) => (
                  <Link
                    key={conv.conversationWithUserId}
                    href={`/messages/${conv.conversationWithUserId}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.conversationWithMainPhotoUrl ? (
                        <img 
                          src={conv.conversationWithMainPhotoUrl} 
                          alt={conv.conversationWithName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm">👤</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-800 text-sm truncate">
                          {conv.conversationWithName}
                        </span>
                        {conv.unreadCount > 0 && (
                          <div className="bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                            {conv.unreadCount > 9 ? '9' : conv.unreadCount}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {conv.lastMessage?.content || 'Nouveau match !'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <div className="text-gray-400 text-sm">→</div>
                  </Link>
                ))}
              </div>
              {conversations.length > 4 && (
                <Link
                  href="/messages"
                  className="block text-center mt-4 text-pink-600 text-sm hover:text-pink-700 font-medium"
                >
                  Voir toutes les conversations →
                </Link>
              )}
            </div>

            {/* Profil completion */}
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-6 shadow-lg border border-yellow-200">
              <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
                💡 Optimisez votre profil
              </h2>
              <div className="space-y-3">
                {userPhotos.length === 0 && (
                  <div className="flex items-center gap-3 text-orange-700">
                    <span className="text-red-500">●</span>
                    <span className="text-sm">Ajoutez une photo de profil</span>
                  </div>
                )}
                {!user.biography && (
                  <div className="flex items-center gap-3 text-orange-700">
                    <span className="text-red-500">●</span>
                    <span className="text-sm">Rédigez votre bio</span>
                  </div>
                )}
                {(!user.interests || user.interests.length === 0) && (
                  <div className="flex items-center gap-3 text-orange-700">
                    <span className="text-red-500">●</span>
                    <span className="text-sm">Ajoutez vos centres d'intérêt</span>
                  </div>
                )}
                {userPhotos.length > 0 && user.biography && user.interests && user.interests.length > 0 && (
                  <div className="flex items-center gap-3 text-green-700">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm">Profil complet !</span>
                  </div>
                )}
              </div>
              <Link
                href="/profile/edit"
                className="block bg-orange-500 text-white px-4 py-2 rounded-full text-sm hover:bg-orange-600 transition-colors mt-4 text-center"
              >
                Modifier mon profil
              </Link>
            </div>

            {/* Météo de l'amour */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                🌈 Votre popularité
              </h2>
              <div className="text-center">
                <div className="text-5xl mb-2">
                  {stats?.popularityScore > 50 ? '☀️' : stats?.popularityScore > 20 ? '⛅' : '🌤️'}
                </div>
                <h3 className="font-bold text-purple-800 text-lg">
                  {stats?.popularityScore > 50 ? 'Excellente' : stats?.popularityScore > 20 ? 'Bonne' : 'En progression'}
                </h3>
                <p className="text-sm text-purple-700 mb-4">
                  Score: {Math.round(stats?.popularityScore || 0)}/100
                </p>
                <div className="bg-white/50 rounded-xl p-3">
                  <p className="text-xs text-purple-600">
                    {stats?.likeBackRate > 50 
                      ? 'Excellent taux de retour !' 
                      : 'Continuez à être authentique !'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer motivationnel */}
        <div className="mt-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl p-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Votre âme sœur vous attend ! 💕</h2>
          <p className="mb-4 opacity-90">
            Chaque interaction vous rapproche de la personne qui vous correspond
          </p>
          <Link
            href="/discover"
            className="bg-white text-pink-500 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors inline-block"
          >
            Découvrir des profils ! 🚀
          </Link>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage);

