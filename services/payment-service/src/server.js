const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'payment-db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'payment_db',
  user: process.env.DB_USER || 'payment_user',
  password: process.env.DB_PASSWORD || 'payment_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Initialize database
async function initDatabase() {
  const maxRetries = 10;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const client = await pool.connect();
      console.log('✅ Connecté à la base de données PostgreSQL');

      // Create payments table
      await client.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          appointment_id INTEGER,
          amount DECIMAL(10, 2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'EUR',
          status VARCHAR(50) DEFAULT 'pending',
          payment_method VARCHAR(50),
          stripe_payment_id VARCHAR(255),
          stripe_customer_id VARCHAR(255),
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Table payments créée ou déjà existante');
      client.release();
      return;
    } catch (err) {
      retries++;
      console.log(`⏳ Tentative de connexion ${retries}/${maxRetries}...`);
      if (retries >= maxRetries) {
        console.error('❌ Impossible de se connecter à la base de données:', err.message);
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

pool.on('error', (err) => {
  console.error('❌ Erreur inattendue du pool de connexions:', err);
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'payment-service', timestamp: new Date() });
});

// Get all payments for a user
app.get('/api/payments', async (req, res) => {
  try {
    const userId = req.query.user_id;
    
    let query = 'SELECT * FROM payments ORDER BY created_at DESC';
    let params = [];
    
    if (userId) {
      query = 'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC';
      params = [userId];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des paiements', details: error.message });
  }
});

// Create a payment
app.post('/api/payments', async (req, res) => {
  try {
    const { user_id, appointment_id, amount, payment_method } = req.body;

    if (!user_id || !amount) {
      return res.status(400).json({ error: 'user_id et amount sont requis' });
    }

    const result = await pool.query(
      `INSERT INTO payments (user_id, appointment_id, amount, payment_method, status) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [user_id, appointment_id || null, amount, payment_method || 'card', 'pending']
    );

    res.status(201).json({
      message: 'Paiement créé',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création du paiement', details: error.message });
  }
});

// Update payment status
app.patch('/api/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, stripe_payment_id } = req.body;

    const result = await pool.query(
      `UPDATE payments 
       SET status = $1, stripe_payment_id = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
      [status, stripe_payment_id || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    res.json({
      message: 'Paiement mis à jour',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du paiement', details: error.message });
  }
});

// Get payment by ID
app.get('/api/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du paiement', details: error.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`💳 Payment Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();
