const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const path = require('path');
const reportController = require('./controllers/reportController');
const invoiceController = require('./controllers/invoiceController');
const { connectRabbitMQ, consumeQueue } = require('./messaging/rabbitmq');

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
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'report-service', 
    timestamp: new Date(),
    features: ['pdf_generation', 'email_sending', 'rabbitmq_integration']
  });
});

// ==================== ROUTES RAPPORTS ====================

// Get all reports
app.get('/api/reports', (req, res) => reportController.getAllReports(req, res, pool));

// Generate report (avec PDF réel)
app.post('/api/reports', (req, res) => reportController.generateReport(req, res, pool));

// Get report by ID
app.get('/api/reports/:id', (req, res) => reportController.getReportById(req, res, pool));

// Download report
app.get('/api/reports/download/:filename', (req, res) => reportController.downloadReport(req, res, pool));

// Resend report email
app.post('/api/reports/:id/resend', (req, res) => reportController.resendReportEmail(req, res, pool));

// Delete report
app.delete('/api/reports/:id', (req, res) => reportController.deleteReport(req, res, pool));

// ==================== ROUTES FACTURES ====================

// Get all invoices
app.get('/api/invoices', (req, res) => invoiceController.getAllInvoices(req, res, pool));

// Get overdue invoices
app.get('/api/invoices/overdue', (req, res) => invoiceController.getOverdueInvoices(req, res, pool));

// Create invoice (avec PDF réel)
app.post('/api/invoices', (req, res) => invoiceController.createInvoice(req, res, pool));

// Get invoice by ID
app.get('/api/invoices/:id', (req, res) => invoiceController.getInvoiceById(req, res, pool));

// Download invoice
app.get('/api/invoices/download/:filename', (req, res) => invoiceController.downloadInvoice(req, res, pool));

// Update invoice status
app.patch('/api/invoices/:id', (req, res) => invoiceController.updateInvoiceStatus(req, res, pool));

// Send payment reminder
app.post('/api/invoices/:id/reminder', (req, res) => invoiceController.sendPaymentReminder(req, res, pool));

// Resend invoice email
app.post('/api/invoices/:id/resend', (req, res) => invoiceController.resendInvoiceEmail(req, res, pool));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ==================== GESTIONNAIRES D'ÉVÉNEMENTS RABBITMQ ====================

/**
 * Gérer les événements d'inspection terminée
 */
async function handleInspectionCompleted(data) {
  console.log('🔔 Inspection terminée reçue:', data);
  
  try {
    // Générer automatiquement le rapport
    if (data.inspection_data && data.user_id) {
      const timestamp = Date.now();
      const fileName = `certificate_${data.inspection_id}_${timestamp}.pdf`;
      const filePath = path.join(__dirname, '../reports', fileName);
      
      const { generateInspectionCertificate } = require('./utils/pdfGenerator');
      await generateInspectionCertificate(data.inspection_data, filePath);
      
      const fileUrl = `${process.env.API_URL || 'http://localhost:8008'}/api/reports/download/${fileName}`;
      
      await pool.query(
        `INSERT INTO reports (
          inspection_id, user_id, report_type, file_name, file_path, file_url, status, generated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          data.inspection_id,
          data.user_id,
          'inspection_certificate',
          fileName,
          filePath,
          fileUrl,
          'completed',
          new Date()
        ]
      );
      
      console.log('✅ Rapport généré automatiquement pour inspection', data.inspection_id);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la génération automatique du rapport:', error);
  }
}

/**
 * Gérer les événements de paiement réussi
 */
async function handlePaymentSucceeded(data) {
  console.log('🔔 Paiement réussi reçu:', data);
  
  try {
    // Créer automatiquement une facture
    if (data.user_id && data.amount) {
      const invoice_number = `INV-${Date.now()}`;
      const tax_amount = data.amount * 0.20;
      const total_amount = data.amount + tax_amount;
      const due_date = new Date();
      due_date.setDate(due_date.getDate() + 30);
      
      await pool.query(
        `INSERT INTO invoices (
          user_id, appointment_id, payment_id, invoice_number, amount, tax_amount, total_amount, status, due_date, paid_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          data.user_id,
          data.appointment_id || null,
          data.payment_id || null,
          invoice_number,
          data.amount,
          tax_amount,
          total_amount,
          'paid',
          due_date,
          new Date()
        ]
      );
      
      console.log('✅ Facture créée automatiquement:', invoice_number);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création automatique de la facture:', error);
  }
}

// ==================== DÉMARRAGE DU SERVEUR ====================

async function startServer() {
  try {
    // Initialiser la base de données
    await initDatabase();
    
    // Connecter à RabbitMQ
    try {
      await connectRabbitMQ();
      
      // S'abonner aux événements
      await consumeQueue('report_generation', handleInspectionCompleted);
      await consumeQueue('invoice_creation', handlePaymentSucceeded);
      
      console.log('✅ Abonné aux événements RabbitMQ');
    } catch (rabbitmqError) {
      console.error('⚠️  RabbitMQ non disponible, le service fonctionnera sans événements:', rabbitmqError.message);
    }
    
    // Démarrer le serveur HTTP
    app.listen(PORT, () => {
      console.log(`📄 Report Service running on port ${PORT}`);
      console.log(`📊 Features: PDF Generation, Email Sending, RabbitMQ Integration`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion de l'arrêt gracieux
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM reçu, arrêt gracieux...');
  const { closeConnection } = require('./messaging/rabbitmq');
  await closeConnection();
  await pool.end();
  process.exit(0);
});

startServer();
