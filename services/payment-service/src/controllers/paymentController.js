// Configuration Stripe avec mode test
const stripeKey = process.env.STRIPE_SECRET_KEY;
const isTestMode = !stripeKey || stripeKey === 'your_stripe_key' || stripeKey.startsWith('sk_test_');
const stripe = stripeKey && !stripeKey.includes('your_stripe_key') ? require('stripe')(stripeKey) : null;
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'payment-db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'payment_db',
  user: process.env.DB_USER || 'payment_user',
  password: process.env.DB_PASSWORD || 'payment_password',
});

// Créer un Payment Intent Stripe
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'eur', user_id, appointment_id, description } = req.body;

    if (!amount || !user_id) {
      return res.status(400).json({ 
        error: 'Amount et user_id sont requis' 
      });
    }

    let paymentIntent;
    
    if (stripe && !isTestMode) {
      // Mode production avec Stripe réel
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe utilise les centimes
        currency: currency,
        description: description || 'Paiement AutoVisiteTech',
        metadata: {
          user_id: user_id.toString(),
          appointment_id: appointment_id ? appointment_id.toString() : null
        }
      });
    } else {
      // Mode test sans Stripe
      console.log('🧪 Mode test - Simulation du Payment Intent');
      paymentIntent = {
        id: `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        client_secret: `pi_test_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        status: 'requires_payment_method',
        amount: Math.round(amount * 100),
        currency: currency
      };
    }

    // Enregistrer dans la base de données
    const result = await pool.query(
      `INSERT INTO payments (user_id, appointment_id, amount, currency, status, stripe_payment_id, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        user_id, 
        appointment_id || null, 
        amount, 
        currency, 
        'pending',
        paymentIntent.id,
        JSON.stringify({ description })
      ]
    );

    res.status(201).json({
      message: 'Payment Intent créé avec succès',
      client_secret: paymentIntent.client_secret,
      payment_id: result.rows[0].id,
      stripe_payment_id: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Erreur création Payment Intent:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création du paiement',
      details: error.message 
    });
  }
};

// Confirmer un paiement
exports.confirmPayment = async (req, res) => {
  try {
    const { payment_intent_id } = req.body;

    if (!payment_intent_id) {
      return res.status(400).json({ error: 'payment_intent_id requis' });
    }

    // Récupérer le Payment Intent depuis Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    // Mettre à jour le statut dans la base de données
    const result = await pool.query(
      `UPDATE payments 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE stripe_payment_id = $2 
       RETURNING *`,
      [paymentIntent.status === 'succeeded' ? 'completed' : paymentIntent.status, payment_intent_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    res.json({
      message: 'Paiement confirmé',
      payment: result.rows[0],
      stripe_status: paymentIntent.status
    });

  } catch (error) {
    console.error('❌ Erreur confirmation paiement:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la confirmation du paiement',
      details: error.message 
    });
  }
};

// Webhook Stripe pour les événements de paiement
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Erreur webhook signature:', err.message);
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  // Gérer les différents types d'événements
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Mettre à jour le statut du paiement
      await pool.query(
        `UPDATE payments 
         SET status = 'completed', updated_at = CURRENT_TIMESTAMP 
         WHERE stripe_payment_id = $1`,
        [paymentIntent.id]
      );
      
      console.log('✅ Paiement réussi:', paymentIntent.id);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      
      await pool.query(
        `UPDATE payments 
         SET status = 'failed', updated_at = CURRENT_TIMESTAMP 
         WHERE stripe_payment_id = $1`,
        [failedPayment.id]
      );
      
      console.log('❌ Paiement échoué:', failedPayment.id);
      break;

    default:
      console.log(`Événement non géré: ${event.type}`);
  }

  res.json({ received: true });
};

// Obtenir tous les paiements d'un utilisateur
exports.getUserPayments = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    
    res.json({
      payments: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('❌ Erreur récupération paiements:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des paiements',
      details: error.message 
    });
  }
};

// Obtenir un paiement par ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM payments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('❌ Erreur récupération paiement:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du paiement',
      details: error.message 
    });
  }
};

// Rembourser un paiement
exports.refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason = 'requested_by_customer' } = req.body;

    // Récupérer le paiement
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE id = $1',
      [id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    const payment = paymentResult.rows[0];

    if (payment.status !== 'completed') {
      return res.status(400).json({ error: 'Seuls les paiements complétés peuvent être remboursés' });
    }

    // Créer le remboursement avec Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_id,
      amount: amount ? Math.round(amount * 100) : undefined, // Remboursement partiel ou total
      reason: reason
    });

    // Mettre à jour le statut du paiement
    await pool.query(
      `UPDATE payments 
       SET status = 'refunded', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [id]
    );

    res.json({
      message: 'Remboursement effectué avec succès',
      refund_id: refund.id,
      amount_refunded: refund.amount / 100
    });

  } catch (error) {
    console.error('❌ Erreur remboursement:', error);
    res.status(500).json({ 
      error: 'Erreur lors du remboursement',
      details: error.message 
    });
  }
};
