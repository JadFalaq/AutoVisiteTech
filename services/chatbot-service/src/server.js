const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const winston = require('winston');
const createChatRoutes = require('./routes/chatRoutes');

dotenv.config();

// Configuration du logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

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
      logger.info('✅ Connecté à la base de données PostgreSQL');

      // Create conversations table with enhanced schema
      await client.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          session_id VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          response TEXT NOT NULL,
          intent VARCHAR(100),
          tokens_used INTEGER DEFAULT 0,
          model VARCHAR(50) DEFAULT 'fallback',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Add missing columns if they don't exist
      await client.query(`
        ALTER TABLE conversations ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0;
        ALTER TABLE conversations ADD COLUMN IF NOT EXISTS model VARCHAR(50) DEFAULT 'fallback';
      `);
      
      // Add indexes if they don't exist
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
      `);

      logger.info('✅ Table conversations et index créés ou déjà existants');
      client.release();
      return;
    } catch (err) {
      retries++;
      logger.warn(`⏳ Tentative de connexion ${retries}/${maxRetries}...`);
      if (retries >= maxRetries) {
        logger.error('❌ Impossible de se connecter à la base de données:', err.message);
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

pool.on('error', (err) => {
  logger.error('❌ Erreur inattendue du pool de connexions:', err);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware simplifié
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    
    res.json({ 
      status: 'OK', 
      service: 'chatbot-service', 
      timestamp: new Date(),
      database: 'connected',
      openai_configured: !!process.env.OPENAI_API_KEY
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      service: 'chatbot-service',
      timestamp: new Date(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Routes complètes du chatbot
app.use('/', createChatRoutes(pool));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Erreur non gérée:', err);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint non trouvé',
    path: req.originalUrl,
    method: req.method
  });
});

async function startServer() {
  try {
    await initDatabase();
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🤖 Chatbot Service running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM reçu, arrêt gracieux...');
      server.close(() => {
        logger.info('Serveur fermé');
        pool.end(() => {
          logger.info('Pool de connexions fermé');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    logger.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();
