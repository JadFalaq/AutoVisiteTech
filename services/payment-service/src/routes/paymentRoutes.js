const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Routes pour les paiements
router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/confirm-payment', paymentController.confirmPayment);
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleStripeWebhook);

// Routes pour la gestion des paiements
router.get('/user/:user_id', paymentController.getUserPayments);
router.get('/:id', paymentController.getPaymentById);
router.post('/:id/refund', paymentController.refundPayment);

module.exports = router;
