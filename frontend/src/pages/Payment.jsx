import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import PaymentForm from '../components/PaymentForm'

export default function Payment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState('form') // 'form', 'success', 'error'
  const [paymentResult, setPaymentResult] = useState(null)
  
  // Récupérer le montant depuis les paramètres URL
  const amount = parseFloat(searchParams.get('amount')) || 50.00
  const appointmentId = searchParams.get('appointment_id')

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!user || !token) {
      navigate('/login')
    }
  }, [navigate])

  const handlePaymentSuccess = (result) => {
    console.log('✅ Paiement réussi:', result)
    setPaymentResult(result)
    setPaymentStatus('success')
  }

  const handlePaymentError = (error) => {
    console.error('❌ Erreur paiement:', error)
    setPaymentResult({ error })
    setPaymentStatus('error')
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h1>
          <p className="text-gray-600 mb-6">
            Votre paiement de <span className="font-semibold">{amount}€</span> a été traité avec succès.
          </p>
          
          {paymentResult && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Détails du paiement</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>ID de paiement: {paymentResult.payment?.id}</div>
                <div>Statut: {paymentResult.payment?.status}</div>
                <div>Montant: {paymentResult.payment?.amount}€</div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleBackToDashboard}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </button>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Erreur de paiement
          </h1>
          <p className="text-gray-600 mb-6">
            Une erreur s'est produite lors du traitement de votre paiement.
          </p>
          
          {paymentResult?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{paymentResult.error}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => setPaymentStatus('form')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Réessayer le paiement
            </button>
            <button
              onClick={handleBackToDashboard}
              className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finaliser votre paiement
          </h1>
          <p className="text-gray-600">
            Sécurisé et rapide avec notre système de paiement
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Résumé de la commande */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Résumé de la commande</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service AutoVisiteTech</span>
                <span className="font-semibold">{amount}€</span>
              </div>
              
              {appointmentId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Rendez-vous</span>
                  <span className="text-sm text-gray-500">#{appointmentId}</span>
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">{amount}€</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Inclus dans votre service :</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Inspection complète du véhicule</li>
                <li>• Rapport détaillé</li>
                <li>• Garantie de service</li>
                <li>• Support client 24/7</li>
              </ul>
            </div>
          </div>

          {/* Formulaire de paiement */}
          <div>
            <PaymentForm
              amount={amount}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={handleBackToDashboard}
            className="text-gray-600 hover:text-gray-800 flex items-center mx-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </button>
        </div>
      </div>
    </div>
  )
}
