const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8008;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'report-db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'report_db',
  user: process.env.DB_USER || 'report_user',
  password: process.env.DB_PASSWORD || 'report_password',
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

      // Create reports table
      await client.query(`
        CREATE TABLE IF NOT EXISTS reports (
          id SERIAL PRIMARY KEY,
          inspection_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          report_type VARCHAR(100),
          file_name VARCHAR(255),
          file_path VARCHAR(500),
          file_url VARCHAR(500),
          status VARCHAR(50) DEFAULT 'pending',
          generated_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create invoices table
      await client.query(`
        CREATE TABLE IF NOT EXISTS invoices (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          appointment_id INTEGER,
          payment_id INTEGER,
          invoice_number VARCHAR(100) UNIQUE,
          amount DECIMAL(10, 2) NOT NULL,
          tax_amount DECIMAL(10, 2),
          total_amount DECIMAL(10, 2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          due_date DATE,
          paid_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Tables reports créées ou déjà existantes');
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
  res.json({ status: 'OK', service: 'report-service', timestamp: new Date() });
});

// Get all reports
app.get('/api/reports', async (req, res) => {
  try {
    const userId = req.query.user_id;
    const inspectionId = req.query.inspection_id;
    
    let query = 'SELECT * FROM reports ORDER BY created_at DESC';
    let params = [];
    
    if (userId) {
      query = 'SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC';
      params = [userId];
    } else if (inspectionId) {
      query = 'SELECT * FROM reports WHERE inspection_id = $1 ORDER BY created_at DESC';
      params = [inspectionId];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des rapports', details: error.message });
  }
});

// Generate report
app.post('/api/reports', async (req, res) => {
  try {
    const {
      inspection_id,
      user_id,
      report_type
    } = req.body;

    if (!inspection_id || !user_id) {
      return res.status(400).json({ error: 'inspection_id et user_id sont requis' });
    }

    // Simulate PDF generation
    const file_name = `report_${inspection_id}_${Date.now()}.pdf`;
    const file_path = `/reports/${file_name}`;
    const file_url = `http://localhost:${PORT}/downloads/${file_name}`;

    const result = await pool.query(
      `INSERT INTO reports (
        inspection_id, user_id, report_type, file_name, file_path, file_url, status, generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        inspection_id,
        user_id,
        report_type || 'inspection_certificate',
        file_name,
        file_path,
        file_url,
        'completed',
        new Date()
      ]
    );

    res.status(201).json({
      message: 'Rapport généré avec succès',
      report: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du rapport', details: error.message });
  }
});

// Get report by ID
app.get('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du rapport', details: error.message });
  }
});

// Delete report
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM reports WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    res.json({
      message: 'Rapport supprimé',
      report: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du rapport', details: error.message });
  }
});

// Get all invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const userId = req.query.user_id;
    
    let query = 'SELECT * FROM invoices ORDER BY created_at DESC';
    let params = [];
    
    if (userId) {
      query = 'SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC';
      params = [userId];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des factures', details: error.message });
  }
});

// Create invoice
app.post('/api/invoices', async (req, res) => {
  try {
    const {
      user_id,
      appointment_id,
      payment_id,
      amount,
      tax_rate
    } = req.body;

    if (!user_id || !amount) {
      return res.status(400).json({ error: 'user_id et amount sont requis' });
    }

    const invoice_number = `INV-${Date.now()}`;
    const tax_amount = amount * (tax_rate || 0.20); // 20% TVA par défaut
    const total_amount = amount + tax_amount;
    const due_date = new Date();
    due_date.setDate(due_date.getDate() + 30); // 30 jours

    const result = await pool.query(
      `INSERT INTO invoices (
        user_id, appointment_id, payment_id, invoice_number, amount, tax_amount, total_amount, status, due_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [
        user_id,
        appointment_id || null,
        payment_id || null,
        invoice_number,
        amount,
        tax_amount,
        total_amount,
        'pending',
        due_date
      ]
    );

    res.status(201).json({
      message: 'Facture créée avec succès',
      invoice: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la facture', details: error.message });
  }
});

// Get invoice by ID
app.get('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la facture', details: error.message });
  }
});

// Update invoice status
app.patch('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const paid_at = status === 'paid' ? new Date() : null;

    const result = await pool.query(
      `UPDATE invoices 
       SET status = $1, paid_at = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
      [status, paid_at, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    res.json({
      message: 'Facture mise à jour',
      invoice: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la facture', details: error.message });
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
      console.log(`📄 Report Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();
