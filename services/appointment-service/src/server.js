const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8003;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'appointment-db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'appointment_db',
  user: process.env.DB_USER || 'appointment_user',
  password: process.env.DB_PASSWORD || 'appointment_password',
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

      // Create appointments table
      await client.query(`
        CREATE TABLE IF NOT EXISTS appointments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          vehicle_registration VARCHAR(50),
          vehicle_brand VARCHAR(100),
          vehicle_model VARCHAR(100),
          vehicle_year INTEGER,
          centre_name VARCHAR(255),
          centre_address VARCHAR(255),
          appointment_date DATE NOT NULL,
          appointment_time TIME NOT NULL,
          service_type VARCHAR(100) DEFAULT 'controle',
          status VARCHAR(50) DEFAULT 'pending',
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Table appointments créée ou déjà existante');
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
  res.json({ status: 'OK', service: 'appointment-service', timestamp: new Date() });
});

// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const userId = req.query.user_id;
    const status = req.query.status;
    
    let query = 'SELECT * FROM appointments ORDER BY appointment_date DESC, appointment_time DESC';
    let params = [];
    
    if (userId && status) {
      query = 'SELECT * FROM appointments WHERE user_id = $1 AND status = $2 ORDER BY appointment_date DESC, appointment_time DESC';
      params = [userId, status];
    } else if (userId) {
      query = 'SELECT * FROM appointments WHERE user_id = $1 ORDER BY appointment_date DESC, appointment_time DESC';
      params = [userId];
    } else if (status) {
      query = 'SELECT * FROM appointments WHERE status = $1 ORDER BY appointment_date DESC, appointment_time DESC';
      params = [status];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des rendez-vous', details: error.message });
  }
});

// Create appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const {
      user_id,
      vehicle_registration,
      vehicle_brand,
      vehicle_model,
      vehicle_year,
      centre_name,
      centre_address,
      appointment_date,
      appointment_time,
      service_type,
      notes
    } = req.body;

    if (!user_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'user_id, appointment_date et appointment_time sont requis' });
    }

    const result = await pool.query(
      `INSERT INTO appointments (
        user_id, vehicle_registration, vehicle_brand, vehicle_model, vehicle_year,
        centre_name, centre_address, appointment_date, appointment_time, service_type, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *`,
      [
        user_id,
        vehicle_registration || '',
        vehicle_brand || '',
        vehicle_model || '',
        vehicle_year || null,
        centre_name || '',
        centre_address || '',
        appointment_date,
        appointment_time,
        service_type || 'controle',
        notes || '',
        'pending'
      ]
    );

    res.status(201).json({
      message: 'Rendez-vous créé avec succès',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création du rendez-vous', details: error.message });
  }
});

// Get appointment by ID
app.get('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du rendez-vous', details: error.message });
  }
});

// Update appointment
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      appointment_date,
      appointment_time,
      status,
      notes
    } = req.body;

    const result = await pool.query(
      `UPDATE appointments 
       SET appointment_date = COALESCE($1, appointment_date),
           appointment_time = COALESCE($2, appointment_time),
           status = COALESCE($3, status),
           notes = COALESCE($4, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [appointment_date, appointment_time, status, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    res.json({
      message: 'Rendez-vous mis à jour',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rendez-vous', details: error.message });
  }
});

// Delete appointment
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    res.json({
      message: 'Rendez-vous supprimé',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du rendez-vous', details: error.message });
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
      console.log(`📅 Appointment Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();
