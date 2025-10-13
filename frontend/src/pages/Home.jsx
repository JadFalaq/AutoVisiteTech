import { Link } from 'react-router-dom'
import { Calendar, Clock, Shield, CheckCircle, Car, FileText, MessageCircle } from 'lucide-react'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Visite Technique Automobile Simplifiée
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Réservez votre contrôle technique en ligne en quelques clics
            </p>
            <Link
              to="/reservation"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition shadow-lg"
            >
              Réserver maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi nous choisir ?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Réservation en ligne</h3>
              <p className="text-gray-600">
                Réservez votre créneau en quelques clics, 24h/24 et 7j/7
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Rapide et efficace</h3>
              <p className="text-gray-600">
                Contrôle technique réalisé en moins de 45 minutes
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Agréé et certifié</h3>
              <p className="text-gray-600">
                Centre agréé par l'État, contrôle conforme aux normes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Nos Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-start space-x-4">
                <Car className="h-10 w-10 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Contrôle technique véhicules légers</h3>
                  <p className="text-gray-600 mb-3">
                    Contrôle complet de votre véhicule selon les 133 points de contrôle réglementaires
                  </p>
                  <p className="text-blue-600 font-semibold">À partir de 69€</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-10 w-10 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Contre-visite</h3>
                  <p className="text-gray-600 mb-3">
                    Vérification des points défaillants après réparation
                  </p>
                  <p className="text-blue-600 font-semibold">À partir de 25€</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-start space-x-4">
                <FileText className="h-10 w-10 text-purple-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Scan et analyse de carte grise</h3>
                  <p className="text-gray-600 mb-3">
                    Extraction automatique des informations de votre véhicule
                  </p>
                  <p className="text-blue-600 font-semibold">Gratuit</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-start space-x-4">
                <MessageCircle className="h-10 w-10 text-orange-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Assistant virtuel</h3>
                  <p className="text-gray-600 mb-3">
                    Posez vos questions à notre chatbot disponible 24h/24
                  </p>
                  <p className="text-blue-600 font-semibold">Gratuit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à réserver votre visite technique ?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Prenez rendez-vous en ligne et gagnez du temps
          </p>
          <Link
            to="/reservation"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition shadow-lg"
          >
            Réserver maintenant
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Auto Visite Tech. Tous droits réservés.</p>
          <p className="text-gray-400 mt-2">Centre agréé par l'État</p>
        </div>
      </footer>
    </div>
  )
}
