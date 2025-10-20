import { Link, useNavigate } from 'react-router-dom'
import { Car, Calendar, User, LogOut, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // Vérifier l'état de connexion au chargement et lors des changements
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      setIsLoggedIn(!!token)
      if (userData) {
        try {
          setUser(JSON.parse(userData))
        } catch (e) {
          setUser(null)
        }
      }
    }

    // Vérifier au chargement
    checkAuth()

    // Écouter les changements de localStorage
    window.addEventListener('storage', checkAuth)
    
    // Vérifier toutes les secondes (pour détecter les changements dans le même onglet)
    const interval = setInterval(checkAuth, 1000)

    return () => {
      window.removeEventListener('storage', checkAuth)
      clearInterval(interval)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Auto Visite Tech</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/reservation"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <Calendar className="h-5 w-5" />
              <span>Réserver</span>
            </Link>

            {isLoggedIn ? (
              <>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link
                  to="/mes-reservations"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Mes Réservations</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  <User className="h-5 w-5" />
                  <span>{user ? `${user.prenom} ${user.nom}` : 'Mon Compte'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
