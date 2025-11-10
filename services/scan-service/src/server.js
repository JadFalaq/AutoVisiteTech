const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const upload = require('./config/multer');
const { generateAppointmentQRCode, generateReportQRCode, generateSimpleQRCode } = require('./utils/qrCodeGenerator');
const { readQRCodeFromImage, readQRCodeFromBuffer } = require('./utils/qrCodeReader');
const { extractCarteGriseData, extractPVData, extractTextFromImage } = require('./utils/ocrProcessor');
const { resizeAndOptimizeImage, createThumbnail, enhanceForOCR, checkImageQuality } = require('./utils/imageProcessor');

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

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Upload de fichier avec traitement
app.post('/api/scans/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const { user_id, appointment_id, document_type } = req.body;

    if (!user_id || !document_type) {
      return res.status(400).json({ error: 'user_id et document_type sont requis' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;
    const fileSize = req.file.size;

    // Créer une miniature
    const thumbnailDir = path.join(__dirname, '../uploads/thumbnails');
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    const thumbnailPath = path.join(thumbnailDir, `thumb_${fileName}`);
    await createThumbnail(filePath, thumbnailPath, 200);

    // Optimiser l'image
    const optimizedDir = path.join(__dirname, '../uploads/optimized');
    if (!fs.existsSync(optimizedDir)) {
      fs.mkdirSync(optimizedDir, { recursive: true });
    }
    const optimizedPath = path.join(optimizedDir, `opt_${fileName}`);
    await resizeAndOptimizeImage(filePath, optimizedPath, { width: 1200, quality: 85 });

    // Enregistrer dans la base de données
    const result = await pool.query(
      `INSERT INTO scans (
        user_id, appointment_id, document_type, file_name, file_path, file_size, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [
        user_id,
        appointment_id || null,
        document_type,
        fileName,
        `/uploads/${fileName}`,
        fileSize,
        'completed'
      ]
    );

    res.status(201).json({
      message: 'Fichier uploadé et traité avec succès',
      scan: result.rows[0],
      files: {
        original: `/uploads/${fileName}`,
        thumbnail: `/uploads/thumbnails/thumb_${fileName}`,
        optimized: `/uploads/optimized/opt_${fileName}`
      }
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload du fichier', details: error.message });
  }
});

// Upload multiple files
app.post('/api/scans/upload-multiple', upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const { user_id, appointment_id, document_type } = req.body;

    if (!user_id || !document_type) {
      return res.status(400).json({ error: 'user_id et document_type sont requis' });
    }

    const uploadedScans = [];

    for (const file of req.files) {
      const result = await pool.query(
        `INSERT INTO scans (
          user_id, appointment_id, document_type, file_name, file_path, file_size, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [
          user_id,
          appointment_id || null,
          document_type,
          file.filename,
          `/uploads/${file.filename}`,
          file.size,
          'completed'
        ]
      );

      uploadedScans.push(result.rows[0]);
    }

    res.status(201).json({
      message: `${req.files.length} fichiers uploadés avec succès`,
      scans: uploadedScans
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload des fichiers', details: error.message });
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

// Générer un QR code pour un rendez-vous
app.post('/api/scans/generate-qr/appointment', async (req, res) => {
  try {
    const { appointmentId, userId, date, time } = req.body;

    if (!appointmentId || !userId) {
      return res.status(400).json({ error: 'appointmentId et userId sont requis' });
    }

    const qrCode = await generateAppointmentQRCode({ appointmentId, userId, date, time });

    res.json({
      message: 'QR Code généré avec succès',
      qrCode: qrCode.qrCodeBase64,
      filePath: qrCode.filePath,
      data: qrCode.data
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du QR code', details: error.message });
  }
});

// Générer un QR code pour un rapport
app.post('/api/scans/generate-qr/report', async (req, res) => {
  try {
    const { reportId, vehicleRegistration, inspectionDate, result } = req.body;

    if (!reportId) {
      return res.status(400).json({ error: 'reportId est requis' });
    }

    const qrCode = await generateReportQRCode({ reportId, vehicleRegistration, inspectionDate, result });

    res.json({
      message: 'QR Code de rapport généré avec succès',
      qrCode: qrCode.qrCodeBase64,
      data: qrCode.data
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du QR code', details: error.message });
  }
});

// Générer un QR code simple
app.post('/api/scans/generate-qr/simple', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text est requis' });
    }

    const qrCode = await generateSimpleQRCode(text);

    res.json({
      message: 'QR Code généré avec succès',
      qrCode
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du QR code', details: error.message });
  }
});

// Lire un QR code depuis une image uploadée
app.post('/api/scans/read-qr', upload.single('qrImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const result = await readQRCodeFromImage(req.file.path);

    // Supprimer le fichier temporaire
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'QR Code lu avec succès',
      ...result
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la lecture du QR code', details: error.message });
  }
});

// OCR - Extraire les données d'une carte grise
app.post('/api/scans/ocr/carte-grise', upload.single('carteGrise'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image de carte grise fournie' });
    }

    const { user_id, appointment_id } = req.body;
    const filePath = req.file.path;

    // Améliorer l'image pour l'OCR
    const enhancedDir = path.join(__dirname, '../uploads/enhanced');
    if (!fs.existsSync(enhancedDir)) {
      fs.mkdirSync(enhancedDir, { recursive: true });
    }
    const enhancedPath = path.join(enhancedDir, `enhanced_${req.file.filename}`);
    await enhanceForOCR(filePath, enhancedPath);

    // Extraire les données
    const ocrResult = await extractCarteGriseData(enhancedPath);

    // Enregistrer dans la base de données
    if (user_id) {
      await pool.query(
        `INSERT INTO scans (
          user_id, appointment_id, document_type, file_name, file_path, file_size, scan_data, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          user_id,
          appointment_id || null,
          'carte_grise',
          req.file.filename,
          `/uploads/${req.file.filename}`,
          req.file.size,
          JSON.stringify(ocrResult.data),
          'completed'
        ]
      );
    }

    res.json({
      message: 'Carte grise analysée avec succès',
      ...ocrResult,
      filePath: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'analyse de la carte grise', details: error.message });
  }
});

// OCR - Extraire les données d'un procès-verbal
app.post('/api/scans/ocr/pv', upload.single('pv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image de PV fournie' });
    }

    const filePath = req.file.path;
    const ocrResult = await extractPVData(filePath);

    res.json({
      message: 'Procès-verbal analysé avec succès',
      ...ocrResult,
      filePath: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'analyse du PV', details: error.message });
  }
});

// OCR - Extraire du texte générique
app.post('/api/scans/ocr/text', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const { lang = 'fra' } = req.body;
    const filePath = req.file.path;
    const ocrResult = await extractTextFromImage(filePath, lang);

    res.json({
      message: 'Texte extrait avec succès',
      ...ocrResult,
      filePath: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'extraction du texte', details: error.message });
  }
});

// Vérifier la qualité d'une image
app.post('/api/scans/check-quality', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const qualityInfo = await checkImageQuality(req.file.path);

    // Supprimer le fichier temporaire
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Qualité de l\'image vérifiée',
      ...qualityInfo
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification de la qualité', details: error.message });
  }
});

// Delete scan
app.delete('/api/scans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer les informations du scan pour supprimer les fichiers
    const scanResult = await pool.query('SELECT * FROM scans WHERE id = $1', [id]);
    
    if (scanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Scan non trouvé' });
    }

    const scan = scanResult.rows[0];
    
    // Supprimer les fichiers associés
    if (scan.file_name) {
      const filePath = path.join(__dirname, '../uploads', scan.file_name);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Supprimer de la base de données
    await pool.query('DELETE FROM scans WHERE id = $1', [id]);

    res.json({
      message: 'Scan et fichiers supprimés',
      scan
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
