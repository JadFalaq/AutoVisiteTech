import { useState } from 'react'
import { CreditCard, Lock, AlertCircle } from 'lucide-react'

export default function PaymentForm({ amount, onPaymentSuccess, onPaymentError }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Formatage automatique pour le numéro de carte
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
      if (formatted.length <= 19) { // 16 chiffres + 3 espaces
        setPaymentData(prev => ({ ...prev, [name]: formatted }))
      }
      return
    }
    
    // Formatage pour la date d'expiration
    if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2')
      if (formatted.length <= 5) {
        setPaymentData(prev => ({ ...prev, [name]: formatted }))
      }
      return
    }
    
    // Limitation CVV à 3-4 chiffres
    if (name === 'cvv') {
      const formatted = value.replace(/\D/g, '')
      if (formatted.length <= 4) {
        setPaymentData(prev => ({ ...prev, [name]: formatted }))
      }
      return
    }
    
    setPaymentData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const { cardNumber, expiryDate, cvv, cardholderName } = paymentData
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      setError('Numéro de carte invalide')
      return false
    }
    
    if (!expiryDate || expiryDate.length < 5) {
      setError('Date d\'expiration invalide')
      return false
    }
    
    if (!cvv || cvv.length < 3) {
      setError('CVV invalide')
      return false
    }
    
    if (!cardholderName.trim()) {
      setError('Nom du titulaire requis')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      // Récupérer l'utilisateur connecté
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const token = localStorage.getItem('token')
      
      if (!user.id || !token) {
        throw new Error('Utilisateur non connecté')
      }
      
      console.log('💳 Création du Payment Intent...')
      
      // Créer un Payment Intent
      const response = await fetch('http://localhost:8000/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amount,
          user_id: user.id,
          description: `Paiement AutoVisiteTech - ${amount}€`
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création du paiement')
      }
      
      const { client_secret, payment_id } = await response.json()
      
      console.log('✅ Payment Intent créé:', payment_id)
      
      // Simuler le traitement du paiement (en production, utiliser Stripe Elements)
      setTimeout(async () => {
        try {
          // Confirmer le paiement
          const confirmResponse = await fetch('http://localhost:8000/api/payments/confirm-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              payment_intent_id: client_secret.split('_secret_')[0] // Extraire l'ID du client_secret
            })
          })
          
          if (confirmResponse.ok) {
            const result = await confirmResponse.json()
            console.log('✅ Paiement confirmé:', result)
            onPaymentSuccess && onPaymentSuccess(result)
          } else {
            throw new Error('Erreur lors de la confirmation du paiement')
          }
        } catch (confirmError) {
          console.error('❌ Erreur confirmation:', confirmError)
          onPaymentError && onPaymentError(confirmError.message)
        } finally {
          setLoading(false)
        }
      }, 2000) // Simuler un délai de traitement
      
    } catch (error) {
      console.error('❌ Erreur paiement:', error)
      setError(error.message)
      setLoading(false)
      onPaymentError && onPaymentError(error.message)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold">Paiement sécurisé</h2>
        <Lock className="h-4 w-4 text-green-600 ml-auto" />
      </div>
      
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Montant à payer :</span>
          <span className="text-2xl font-bold text-blue-600">{amount}€</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de carte
          </label>
          <input
            type="text"
            name="cardNumber"
            value={paymentData.cardNumber}
            onChange={handleInputChange}
            placeholder="1234 5678 9012 3456"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date d'expiration
            </label>
            <input
              type="text"
              name="expiryDate"
              value={paymentData.expiryDate}
              onChange={handleInputChange}
              placeholder="MM/AA"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVV
            </label>
            <input
              type="text"
              name="cvv"
              value={paymentData.cvv}
              onChange={handleInputChange}
              placeholder="123"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du titulaire
          </label>
          <input
            type="text"
            name="cardholderName"
            value={paymentData.cardholderName}
            onChange={handleInputChange}
            placeholder="Jean Dupont"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Traitement en cours...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Payer {amount}€
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <Lock className="h-3 w-3 inline mr-1" />
        Paiement sécurisé par Stripe
      </div>
    </div>
  )
}
