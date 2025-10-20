const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8006;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'chatbot-db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'chatbot_db',
  user: process.env.DB_USER || 'chatbot_user',
  password: process.env.DB_PASSWORD || 'chatbot_password',
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

      // Create conversations table
      await client.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          session_id VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          response TEXT NOT NULL,
          intent VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Table conversations créée ou déjà existante');
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
  res.json({ status: 'OK', service: 'chatbot-service', timestamp: new Date() });
});

// Simple chatbot responses
const responses = {
  greeting: [
    'Bonjour! Comment puis-je vous aider aujourd\'hui?',
    'Salut! Je suis là pour vous aider avec vos visites techniques.',
    'Bienvenue! Que puis-je faire pour vous?'
  ],
  appointment: [
    'Pour prendre rendez-vous, rendez-vous sur la page de réservation. Je peux vous y diriger si vous le souhaitez.',
    'Vous pouvez réserver votre visite technique en quelques clics. Voulez-vous que je vous guide?'
  ],
  price: [
    'Le prix d\'une visite technique standard est de 70€. Des services supplémentaires sont disponibles.',
    'Nos tarifs commencent à 70€ pour un contrôle technique complet.'
  ],
  documents: [
    'Pour votre visite technique, apportez: carte grise, pièce d\'identité, et l\'ancien certificat de contrôle si vous en avez un.',
    'Documents nécessaires: carte grise du véhicule, pièce d\'identité du propriétaire.'
  ],
  default: [
    'Je ne suis pas sûr de comprendre. Pouvez-vous reformuler votre question?',
    'Désolé, je n\'ai pas bien compris. Pouvez-vous être plus précis?'
  ]
};

function detectIntent(message) {
  const msg = message.toLowerCase();
  
  if (msg.match(/bonjour|salut|hello|hey/)) return 'greeting';
  if (msg.match(/rendez-vous|réservation|rdv|appointment/)) return 'appointment';
  if (msg.match(/prix|tarif|coût|combien/)) return 'price';
  if (msg.match(/document|papier|carte grise/)) return 'documents';
  
  return 'default';
}

function getResponse(intent) {
  const responseList = responses[intent] || responses.default;
  return responseList[Math.floor(Math.random() * responseList.length)];
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, user_id, session_id } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message requis' });
    }

    // Detect intent and generate response
    const intent = detectIntent(message);
    const response = getResponse(intent);

    // Save conversation
    if (user_id && session_id) {
      await pool.query(
        `INSERT INTO conversations (user_id, session_id, message, response, intent) 
         VALUES ($1, $2, $3, $4, $5)`,
        [user_id, session_id, message, response, intent]
      );
    }

    res.json({
      message: 'Réponse générée',
      response,
      intent,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors du traitement du message', details: error.message });
  }
});

// Get conversation history
app.get('/api/chat/history', async (req, res) => {
  try {
    const { user_id, session_id } = req.query;

    if (!user_id && !session_id) {
      return res.status(400).json({ error: 'user_id ou session_id requis' });
    }

    let query = 'SELECT * FROM conversations WHERE ';
    let params = [];

    if (user_id && session_id) {
      query += 'user_id = $1 AND session_id = $2 ORDER BY created_at ASC';
      params = [user_id, session_id];
    } else if (user_id) {
      query += 'user_id = $1 ORDER BY created_at DESC LIMIT 50';
      params = [user_id];
    } else {
      query += 'session_id = $1 ORDER BY created_at ASC';
      params = [session_id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique', details: error.message });
  }
});

// Clear conversation history
app.delete('/api/chat/history/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    const result = await pool.query('DELETE FROM conversations WHERE session_id = $1 RETURNING *', [session_id]);

    res.json({
      message: 'Historique supprimé',
      deleted_count: result.rowCount
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'historique', details: error.message });
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
      console.log(`🤖 Chatbot Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();
