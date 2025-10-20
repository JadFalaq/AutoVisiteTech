const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8007;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'inspection-db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'inspection_db',
  user: process.env.DB_USER || 'inspection_user',
  password: process.env.DB_PASSWORD || 'inspection_password',
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

      // Create inspections table
      await client.query(`
        CREATE TABLE IF NOT EXISTS inspections (
          id SERIAL PRIMARY KEY,
          appointment_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          vehicle_registration VARCHAR(50),
          inspector_name VARCHAR(255),
          status VARCHAR(50) DEFAULT 'pending',
          result VARCHAR(50),
          defects JSONB,
          notes TEXT,
          inspection_date TIMESTAMP,
          completed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create inspection_items table
      await client.query(`
        CREATE TABLE IF NOT EXISTS inspection_items (
          id SERIAL PRIMARY KEY,
          inspection_id INTEGER NOT NULL,
          category VARCHAR(100),
          item_name VARCHAR(255),
          status VARCHAR(50),
          severity VARCHAR(50),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Tables inspections créées ou déjà existantes');
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
  res.json({ status: 'OK', service: 'inspection-service', timestamp: new Date() });
});

// Get all inspections
app.get('/api/inspections', async (req, res) => {
  try {
    const userId = req.query.user_id;
    const appointmentId = req.query.appointment_id;
    const status = req.query.status;
    
    let query = 'SELECT * FROM inspections ORDER BY created_at DESC';
    let params = [];
    
    if (userId) {
      query = 'SELECT * FROM inspections WHERE user_id = $1 ORDER BY created_at DESC';
      params = [userId];
    } else if (appointmentId) {
      query = 'SELECT * FROM inspections WHERE appointment_id = $1 ORDER BY created_at DESC';
      params = [appointmentId];
    } else if (status) {
      query = 'SELECT * FROM inspections WHERE status = $1 ORDER BY created_at DESC';
      params = [status];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des inspections', details: error.message });
  }
});

// Create inspection
app.post('/api/inspections', async (req, res) => {
  try {
    const {
      appointment_id,
      user_id,
      vehicle_registration,
      inspector_name
    } = req.body;

    if (!appointment_id || !user_id) {
      return res.status(400).json({ error: 'appointment_id et user_id sont requis' });
    }

    const result = await pool.query(
      `INSERT INTO inspections (
        appointment_id, user_id, vehicle_registration, inspector_name, status, inspection_date
      ) VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [
        appointment_id,
        user_id,
        vehicle_registration || '',
        inspector_name || 'Non assigné',
        'pending',
        new Date()
      ]
    );

    res.status(201).json({
      message: 'Inspection créée avec succès',
      inspection: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'inspection', details: error.message });
  }
});

// Get inspection by ID
app.get('/api/inspections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const inspection = await pool.query('SELECT * FROM inspections WHERE id = $1', [id]);

    if (inspection.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection non trouvée' });
    }

    // Get inspection items
    const items = await pool.query('SELECT * FROM inspection_items WHERE inspection_id = $1', [id]);

    res.json({
      ...inspection.rows[0],
      items: items.rows
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'inspection', details: error.message });
  }
});

// Update inspection
app.put('/api/inspections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      result,
      defects,
      notes,
      inspector_name
    } = req.body;

    const completed_at = status === 'completed' ? new Date() : null;

    const updateResult = await pool.query(
      `UPDATE inspections 
       SET status = COALESCE($1, status),
           result = COALESCE($2, result),
           defects = COALESCE($3, defects),
           notes = COALESCE($4, notes),
           inspector_name = COALESCE($5, inspector_name),
           completed_at = COALESCE($6, completed_at),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`,
      [status, result, defects ? JSON.stringify(defects) : null, notes, inspector_name, completed_at, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection non trouvée' });
    }

    res.json({
      message: 'Inspection mise à jour',
      inspection: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'inspection', details: error.message });
  }
});

// Add inspection item
app.post('/api/inspections/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, item_name, status, severity, notes } = req.body;

    if (!category || !item_name) {
      return res.status(400).json({ error: 'category et item_name sont requis' });
    }

    const result = await pool.query(
      `INSERT INTO inspection_items (inspection_id, category, item_name, status, severity, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [id, category, item_name, status || 'ok', severity || 'none', notes || '']
    );

    res.status(201).json({
      message: 'Item d\'inspection ajouté',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'item', details: error.message });
  }
});

// Delete inspection
app.delete('/api/inspections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete items first
    await pool.query('DELETE FROM inspection_items WHERE inspection_id = $1', [id]);
    
    // Delete inspection
    const result = await pool.query('DELETE FROM inspections WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection non trouvée' });
    }

    res.json({
      message: 'Inspection supprimée',
      inspection: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'inspection', details: error.message });
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
      console.log(`🔍 Inspection Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();
