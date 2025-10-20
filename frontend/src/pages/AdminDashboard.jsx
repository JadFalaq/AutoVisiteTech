import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Calendar, FileText, DollarSign, TrendingUp, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0
  })
  const [recentAppointments, setRecentAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'admin') {
        alert('Accès refusé. Vous devez être administrateur.')
        navigate('/dashboard')
        return
      }
      setUser(parsedUser)
    } else {
      navigate('/login')
      return
    }

    // Charger les statistiques
    loadStats()
  }, [navigate])

  const loadStats = async () => {
    try {
      // Charger les rendez-vous
      const appointmentsRes = await fetch('http://localhost:8003/api/appointments')
      const appointments = await appointmentsRes.json()

      // Charger les utilisateurs
      const usersRes = await fetch('http://localhost:8001/api/users')
      const users = await usersRes.json()

      // Calculer les statistiques
      const pending = appointments.filter(a => a.status === 'pending').length
      const completed = appointments.filter(a => a.status === 'completed').length

      setStats({
        totalUsers: users.length,
        totalAppointments: appointments.length,
        pendingAppointments: pending,
        completedAppointments: completed,
        totalRevenue: completed * 70 // 70€ par visite technique
      })

      // Les 5 derniers rendez-vous
      setRecentAppointments(appointments.slice(0, 5))
      setLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
      setLoading(false)
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
          <p className="text-gray-600 mt-2">Bienvenue, {user?.prenom} {user?.nom}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="h-8 w-8" />}
            title="Utilisateurs"
            value={stats.totalUsers}
            color="bg-blue-500"
          />
          <StatCard
            icon={<Calendar className="h-8 w-8" />}
            title="Rendez-vous Total"
            value={stats.totalAppointments}
            color="bg-green-500"
          />
          <StatCard
            icon={<Activity className="h-8 w-8" />}
            title="En Attente"
            value={stats.pendingAppointments}
            color="bg-yellow-500"
          />
          <StatCard
            icon={<DollarSign className="h-8 w-8" />}
            title="Revenus"
            value={`${stats.totalRevenue}€`}
            color="bg-purple-500"
          />
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ActionCard
            title="Gérer les Réservations"
            description="Voir et gérer toutes les réservations"
            icon={<Calendar className="h-12 w-12" />}
            onClick={() => navigate('/admin/reservations')}
            color="bg-blue-600"
          />
          <ActionCard
            title="Gérer les Utilisateurs"
            description="Voir la liste des utilisateurs"
            icon={<Users className="h-12 w-12" />}
            onClick={() => navigate('/admin/users')}
            color="bg-green-600"
          />
          <ActionCard
            title="Rapports & Statistiques"
            description="Voir les rapports détaillés"
            icon={<FileText className="h-12 w-12" />}
            onClick={() => navigate('/admin/reports')}
            color="bg-purple-600"
          />
        </div>

        {/* Derniers rendez-vous */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Derniers Rendez-vous</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Immatriculation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{appointment.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.vehicle_registration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.appointment_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.appointment_time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function ActionCard({ title, description, icon, onClick, color }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1"
    >
      <div className={`${color} text-white p-4 rounded-lg inline-block mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
