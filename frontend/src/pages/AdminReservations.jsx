import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function AdminReservations() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'admin') {
        alert('Accès refusé')
        navigate('/dashboard')
        return
      }
    } else {
      navigate('/login')
      return
    }

    loadAppointments()
  }, [navigate])

  useEffect(() => {
    // Filtrer les rendez-vous
    let filtered = appointments

    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus)
    }

    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.vehicle_registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.vehicle_brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.centre_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredAppointments(filtered)
  }, [appointments, searchTerm, filterStatus])

  const loadAppointments = async () => {
    try {
      const response = await fetch('http://localhost:8003/api/appointments')
      const data = await response.json()
      setAppointments(data)
      setFilteredAppointments(data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`http://localhost:8003/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      loadAppointments() // Recharger la liste
      alert('Statut mis à jour!')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const deleteAppointment = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous?')) return

    try {
      await fetch(`http://localhost:8003/api/appointments/${id}`, {
        method: 'DELETE'
      })
      
      loadAppointments()
      alert('Rendez-vous supprimé!')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">⏳ Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="h-8 w-8" />
            Gestion des Réservations
          </h1>
          <p className="text-gray-600 mt-2">Gérer tous les rendez-vous de visite technique</p>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par immatriculation, marque, centre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtre par statut */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmé</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {filteredAppointments.length} rendez-vous trouvé(s)
          </div>
        </div>

        {/* Liste des rendez-vous */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Véhicule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Centre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{appointment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{appointment.vehicle_registration}</div>
                      <div className="text-sm text-gray-500">{appointment.vehicle_brand} {appointment.vehicle_model}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{appointment.centre_name}</div>
                      <div className="text-sm text-gray-500">{appointment.centre_address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.appointment_date}</div>
                      <div className="text-sm text-gray-500">{appointment.appointment_time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {appointment.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(appointment.id, 'confirmed')}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            title="Confirmer"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(appointment.id, 'completed')}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            title="Marquer terminé"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          title="Supprimer"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Aucun rendez-vous trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
