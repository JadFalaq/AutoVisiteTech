import { useEffect, useState } from 'react'
import { User, Mail, Phone, Calendar } from 'lucide-react'

export default function Dashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Mon Compte</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <User className="mr-2" /> Informations personnelles
          </h2>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="font-semibold">{user.prenom} {user.nom}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-semibold">{user.telephone || 'Non renseigné'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Calendar className="mr-2" /> Actions rapides
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/reservation"
              className="block p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <h3 className="font-semibold text-lg mb-2">Nouvelle réservation</h3>
              <p className="text-gray-600">Réserver une visite technique</p>
            </a>

            <a
              href="/mes-reservations"
              className="block p-6 bg-green-50 rounded-lg hover:bg-green-100 transition"
            >
              <h3 className="font-semibold text-lg mb-2">Mes réservations</h3>
              <p className="text-gray-600">Voir mes rendez-vous</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
