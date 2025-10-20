import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    console.log('🔐 Tentative de connexion avec:', formData.email)
    
    try {
      const url = 'http://localhost:8001/api/auth/login'  // Appel direct au service auth
      console.log('📡 Envoi de la requête vers:', url)
      console.log('📦 Données envoyées:', { email: formData.email, password: '***' })
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      console.log('📥 Réponse reçue, status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur serveur' }))
        console.error('❌ Erreur serveur:', errorData)
        setError(errorData.error || 'Email ou mot de passe incorrect')
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log('✅ Connexion réussie!')
      console.log('✅ Token reçu:', data.token ? 'Oui' : 'Non')
      console.log('✅ User reçu:', data.user ? 'Oui' : 'Non')

      if (!data.token || !data.user) {
        throw new Error('Token ou utilisateur manquant dans la réponse')
      }

      // Sauvegarder dans localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      console.log('💾 Données sauvegardées dans localStorage')
      
      // Redirection immédiate
      console.log('🚀 Redirection vers dashboard')
      window.location.href = '/dashboard'  // Utiliser window.location pour forcer le rechargement complet
      
    } catch (error) {
      console.error('❌ Erreur de connexion:', error)
      setError('Impossible de se connecter au serveur: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <LogIn className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Connexion</h2>
            <p className="mt-2 text-sm text-gray-600">
              Accédez à votre espace personnel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? '⏳ Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
