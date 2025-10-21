import { Link } from 'react-router-dom'
import { Calendar, Clock, Shield, CheckCircle, Car, FileText, MessageCircle, MapPin, Phone, Mail, Building2 } from 'lucide-react'
import SafeImage from '../components/SafeImage'

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

      {/* Opening Hours Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Heures d'ouverture</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">Lundi - Vendredi</span>
                  <span className="text-blue-600 font-semibold">8h00 - 18h00</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">Samedi</span>
                  <span className="text-blue-600 font-semibold">8h00 - 16h00</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">Dimanche</span>
                  <span className="text-red-600 font-semibold">Fermé</span>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-800">Informations pratiques</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">123 Avenue de la République, 75001 Paris</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">01 23 45 67 89</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">contact@autovisitetech.fr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Notre Centre Auto Visite Tech</h2>
              <div className="space-y-4 text-gray-600">
                <p className="text-lg leading-relaxed">
                  Depuis plus de 15 ans, <strong>Auto Visite Tech</strong> est votre partenaire de confiance pour le contrôle technique automobile. Notre centre moderne et agréé par l'État dispose des équipements les plus récents pour garantir un contrôle précis et fiable.
                </p>
                <p className="text-lg leading-relaxed">
                  Notre équipe de techniciens certifiés met tout en œuvre pour vous offrir un service rapide, professionnel et transparent. Nous nous engageons à respecter les 133 points de contrôle réglementaires avec la plus grande rigueur.
                </p>
                <p className="text-lg leading-relaxed">
                  Grâce à notre système de réservation en ligne innovant, vous pouvez planifier votre visite technique en quelques clics et éviter les files d'attente. Votre satisfaction est notre priorité.
                </p>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">15+</div>
                  <div className="text-sm text-gray-600">Années d'expérience</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">10k+</div>
                  <div className="text-sm text-gray-600">Véhicules contrôlés</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-6">
                {/* Image du centre avec SafeImage */}
                <SafeImage
                  src="/images/centre-auto-visite-tech.jpg"
                  alt="Centre Auto Visite Tech - Vue extérieure"
                  className="w-full h-64 mb-6 shadow-lg"
                  fallbackIcon={Building2}
                  showLink={true}
                  linkText="Voir notre centre"
                />
                
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Centre Moderne & Agréé</h3>
                  <p className="text-gray-600 text-center mb-4">Équipements de dernière génération pour un contrôle optimal</p>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Facilement accessible en transport</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Parking gratuit sur place</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Espace d'attente climatisé</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>WiFi gratuit</span>
                    </div>
                  </div>
                </div>
              </div>
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
