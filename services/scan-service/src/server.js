const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8004;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'scan-db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'scan_db',
  user: process.env.DB_USER || 'scan_user',
  password: process.env.DB_PASSWORD || 'scan_password',
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

      // Create scans table
      await client.query(`
        CREATE TABLE IF NOT EXISTS scans (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          appointment_id INTEGER,
          document_type VARCHAR(100),
          file_name VARCHAR(255),
          file_path VARCHAR(500),
          file_size INTEGER,
          scan_data JSONB,
          qr_code_data TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Table scans créée ou déjà existante');
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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'scan-service', timestamp: new Date() });
});

// Get all scans
app.get('/api/scans', async (req, res) => {
  try {
    const userId = req.query.user_id;
    const appointmentId = req.query.appointment_id;
    
    let query = 'SELECT * FROM scans ORDER BY created_at DESC';
    let params = [];
    
    if (userId) {
      query = 'SELECT * FROM scans WHERE user_id = $1 ORDER BY created_at DESC';
      params = [userId];
    } else if (appointmentId) {
      query = 'SELECT * FROM scans WHERE appointment_id = $1 ORDER BY created_at DESC';
      params = [appointmentId];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des scans', details: error.message });
  }
});

// Upload/Create scan
app.post('/api/scans', async (req, res) => {
  try {
    const {
      user_id,
      appointment_id,
      document_type,
      file_name,
      file_data,
      qr_code_data
    } = req.body;

    if (!user_id || !document_type) {
      return res.status(400).json({ error: 'user_id et document_type sont requis' });
    }

    // Simulate file storage (in production, use S3, Azure Blob, etc.)
    const file_path = file_name ? `/uploads/${Date.now()}_${file_name}` : null;
    const file_size = file_data ? Buffer.byteLength(file_data, 'base64') : 0;

    const result = await pool.query(
      `INSERT INTO scans (
        user_id, appointment_id, document_type, file_name, file_path, file_size, qr_code_data, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        user_id,
        appointment_id || null,
        document_type,
        file_name || '',
        file_path,
        file_size,
        qr_code_data || '',
        'completed'
      ]
    );

    res.status(201).json({
      message: 'Scan enregistré avec succès',
      scan: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du scan', details: error.message });
  }
});

// Get scan by ID
app.get('/api/scans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM scans WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scan non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du scan', details: error.message });
  }
});

// Scan QR code
app.post('/api/scans/qr-code', async (req, res) => {
  try {
    const { qr_data, user_id } = req.body;

    if (!qr_data) {
      return res.status(400).json({ error: 'qr_data est requis' });
    }

    // Simulate QR code processing
    const decoded_data = {
      type: 'appointment',
      id: Math.floor(Math.random() * 1000),
      data: qr_data
    };

    res.json({
      message: 'QR Code scanné avec succès',
      decoded_data
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors du scan du QR code', details: error.message });
  }
});

// Delete scan
app.delete('/api/scans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM scans WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scan non trouvé' });
    }

    res.json({
      message: 'Scan supprimé',
      scan: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du scan', details: error.message });
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
      console.log(`📷 Scan Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();
