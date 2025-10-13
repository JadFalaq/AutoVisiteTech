import { useState } from 'react'
import { Calendar, Car, MapPin, Clock, CreditCard } from 'lucide-react'

export default function Reservation() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    vehicleType: '',
    immatriculation: '',
    marque: '',
    modele: '',
    annee: '',
    centre: '',
    date: '',
    heure: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    serviceType: 'controle'
  })

  const centres = [
    { id: 1, nom: 'Centre Casablanca - Maarif', adresse: 'Boulevard Zerktouni, Casablanca' },
    { id: 2, nom: 'Centre Rabat - Agdal', adresse: 'Avenue Hassan II, Rabat' },
    { id: 3, nom: 'Centre Marrakech - Gueliz', adresse: 'Avenue Mohammed V, Marrakech' },
    { id: 4, nom: 'Centre Tanger - Centre', adresse: 'Boulevard Pasteur, Tanger' }
  ]

  const creneaux = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost:8000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Réservation confirmée ! Vous recevrez un email de confirmation.')
        window.location.href = '/mes-reservations'
      } else {
        alert('Erreur lors de la réservation. Veuillez réessayer.')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur de connexion. Veuillez réessayer.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Réserver une visite technique</h1>

          {/* Progress Steps */}
          <div className="flex justify-between mb-12">
            <div className={`flex-1 text-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <p className="text-sm">Véhicule</p>
            </div>
            <div className={`flex-1 text-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <p className="text-sm">Centre & Date</p>
            </div>
            <div className={`flex-1 text-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <p className="text-sm">Coordonnées</p>
            </div>
            <div className={`flex-1 text-center ${step >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                4
              </div>
              <p className="text-sm">Paiement</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Véhicule */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <Car className="mr-2" /> Informations du véhicule
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de service
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="controle">Contrôle technique (69€)</option>
                    <option value="contre-visite">Contre-visite (25€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Immatriculation
                  </label>
                  <input
                    type="text"
                    name="immatriculation"
                    value={formData.immatriculation}
                    onChange={handleChange}
                    placeholder="Ex: 12345-A-67"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marque
                    </label>
                    <input
                      type="text"
                      name="marque"
                      value={formData.marque}
                      onChange={handleChange}
                      placeholder="Ex: Renault"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modèle
                    </label>
                    <input
                      type="text"
                      name="modele"
                      value={formData.modele}
                      onChange={handleChange}
                      placeholder="Ex: Clio"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année
                  </label>
                  <input
                    type="number"
                    name="annee"
                    value={formData.annee}
                    onChange={handleChange}
                    placeholder="Ex: 2020"
                    min="1950"
                    max="2025"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Continuer
                </button>
              </div>
            )}

            {/* Step 2: Centre & Date */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <MapPin className="mr-2" /> Choisir un centre et une date
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Centre de contrôle
                  </label>
                  <select
                    name="centre"
                    value={formData.centre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionnez un centre</option>
                    {centres.map(centre => (
                      <option key={centre.id} value={centre.nom}>
                        {centre.nom} - {centre.adresse}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date souhaitée
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Créneau horaire
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {creneaux.map(creneau => (
                      <button
                        key={creneau}
                        type="button"
                        onClick={() => setFormData({ ...formData, heure: creneau })}
                        className={`py-2 px-4 rounded-lg border ${
                          formData.heure === creneau
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                        }`}
                      >
                        {creneau}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!formData.centre || !formData.date || !formData.heure}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Coordonnées */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Vos coordonnées</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="06XXXXXXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Paiement */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <CreditCard className="mr-2" /> Récapitulatif et paiement
                </h2>

                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-lg mb-4">Récapitulatif de votre réservation</h3>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-semibold">
                      {formData.serviceType === 'controle' ? 'Contrôle technique' : 'Contre-visite'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Véhicule:</span>
                    <span className="font-semibold">{formData.marque} {formData.modele} ({formData.annee})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Immatriculation:</span>
                    <span className="font-semibold">{formData.immatriculation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Centre:</span>
                    <span className="font-semibold">{formData.centre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date et heure:</span>
                    <span className="font-semibold">{formData.date} à {formData.heure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-semibold">{formData.prenom} {formData.nom}</span>
                  </div>
                  <div className="border-t pt-3 mt-3 flex justify-between text-lg">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-blue-600">
                      {formData.serviceType === 'controle' ? '69€' : '25€'}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💳 Le paiement se fera sur place le jour de votre visite. Vous pouvez payer par carte bancaire ou en espèces.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Confirmer la réservation
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
