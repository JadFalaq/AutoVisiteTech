import { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, Car, CheckCircle, XCircle } from 'lucide-react'

export default function MesReservations() {
  const [reservations, setReservations] = useState([])

  useEffect(() => {
    // Mock data - à remplacer par un vrai appel API
    setReservations([
      {
        id: 1,
        serviceType: 'Contrôle technique',
        vehicule: 'Renault Clio 2020',
        immatriculation: '12345-A-67',
        centre: 'Centre Casablanca - Maarif',
        date: '2025-10-20',
        heure: '10:00',
        statut: 'confirmé',
        prix: '69€'
      },
      {
        id: 2,
        serviceType: 'Contre-visite',
        vehicule: 'Peugeot 208 2019',
        immatriculation: '98765-B-12',
        centre: 'Centre Rabat - Agdal',
        date: '2025-10-15',
        heure: '14:30',
        statut: 'terminé',
        prix: '25€'
      }
    ])
  }, [])

  const getStatutBadge = (statut) => {
    switch (statut) {
      case 'confirmé':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Confirmé
          </span>
        )
      case 'terminé':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Terminé
          </span>
        )
      case 'annulé':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
            <XCircle className="h-4 w-4 mr-1" />
            Annulé
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Mes Réservations</h1>

        {reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Aucune réservation</h2>
            <p className="text-gray-600 mb-6">Vous n'avez pas encore de rendez-vous</p>
            <a
              href="/reservation"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Réserver maintenant
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{reservation.serviceType}</h3>
                    {getStatutBadge(reservation.statut)}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{reservation.prix}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Car className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Véhicule</p>
                        <p className="font-semibold">{reservation.vehicule}</p>
                        <p className="text-sm text-gray-500">{reservation.immatriculation}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Centre</p>
                        <p className="font-semibold">{reservation.centre}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-semibold">{new Date(reservation.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Heure</p>
                        <p className="font-semibold">{reservation.heure}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {reservation.statut === 'confirmé' && (
                  <div className="mt-6 flex space-x-4">
                    <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                      Modifier
                    </button>
                    <button className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition">
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
