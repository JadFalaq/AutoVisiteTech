const { Pool } = require('pg');
const path = require('path');
const fs = require('fs').promises;
const { generateInspectionCertificate, generateDetailedReport } = require('../utils/pdfGenerator');
const { sendInspectionCertificate } = require('../utils/emailService');
const { publishReportGenerated } = require('../messaging/rabbitmq');

// Créer le dossier reports s'il n'existe pas
const REPORTS_DIR = path.join(__dirname, '../../reports');
fs.mkdir(REPORTS_DIR, { recursive: true }).catch(console.error);

/**
 * Récupérer tous les rapports
 */
async function getAllReports(req, res, pool) {
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
}

/**
 * Récupérer un rapport par ID
 */
async function getReportById(req, res, pool) {
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
}

/**
 * Générer un rapport d'inspection
 */
async function generateReport(req, res, pool) {
  try {
    const {
      inspection_id,
      user_id,
      report_type,
      inspection_data,
      send_email
    } = req.body;

    if (!inspection_id || !user_id) {
      return res.status(400).json({ error: 'inspection_id et user_id sont requis' });
    }

    if (!inspection_data) {
      return res.status(400).json({ error: 'inspection_data est requis pour générer le rapport' });
    }

    // Générer le nom du fichier
    const timestamp = Date.now();
    const fileName = `${report_type || 'certificate'}_${inspection_id}_${timestamp}.pdf`;
    const filePath = path.join(REPORTS_DIR, fileName);

    // Générer le PDF selon le type
    let generatedPath;
    if (report_type === 'detailed_report') {
      generatedPath = await generateDetailedReport(inspection_data, filePath);
    } else {
      generatedPath = await generateInspectionCertificate(inspection_data, filePath);
    }

    // Enregistrer dans la base de données
    const fileUrl = `${process.env.API_URL || 'http://localhost:8008'}/api/reports/download/${fileName}`;
    
    const result = await pool.query(
      `INSERT INTO reports (
        inspection_id, user_id, report_type, file_name, file_path, file_url, status, generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        inspection_id,
        user_id,
        report_type || 'inspection_certificate',
        fileName,
        filePath,
        fileUrl,
        'completed',
        new Date()
      ]
    );

    const report = result.rows[0];

    // Publier l'événement
    await publishReportGenerated({
      report_id: report.id,
      inspection_id,
      user_id,
      report_type: report.report_type,
      file_url: fileUrl,
    });

    // Envoyer par email si demandé
    if (send_email && inspection_data.owner_email) {
      try {
        await sendInspectionCertificate(
          inspection_data.owner_email,
          inspection_data.owner_name || 'Client',
          filePath,
          inspection_data
        );
        console.log('✅ Email envoyé avec succès');
      } catch (emailError) {
        console.error('⚠️  Erreur lors de l\'envoi de l\'email:', emailError.message);
        // Ne pas faire échouer la génération si l'email échoue
      }
    }

    res.status(201).json({
      message: 'Rapport généré avec succès',
      report: report
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du rapport', details: error.message });
  }
}

/**
 * Télécharger un rapport
 */
async function downloadReport(req, res, pool) {
  try {
    const { filename } = req.params;
    const filePath = path.join(REPORTS_DIR, filename);

    // Vérifier que le fichier existe
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    // Envoyer le fichier
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Erreur lors du téléchargement' });
        }
      }
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement', details: error.message });
  }
}

/**
 * Supprimer un rapport
 */
async function deleteReport(req, res, pool) {
  try {
    const { id } = req.params;
    
    // Récupérer le rapport pour obtenir le chemin du fichier
    const reportResult = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
    
    if (reportResult.rows.length === 0) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    const report = reportResult.rows[0];

    // Supprimer le fichier physique
    try {
      await fs.unlink(report.file_path);
    } catch (fileError) {
      console.error('⚠️  Erreur lors de la suppression du fichier:', fileError.message);
    }

    // Supprimer de la base de données
    await pool.query('DELETE FROM reports WHERE id = $1', [id]);

    res.json({
      message: 'Rapport supprimé',
      report: report
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du rapport', details: error.message });
  }
}

/**
 * Renvoyer un rapport par email
 */
async function resendReportEmail(req, res, pool) {
  try {
    const { id } = req.params;
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email est requis' });
    }

    // Récupérer le rapport
    const reportResult = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
    
    if (reportResult.rows.length === 0) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    const report = reportResult.rows[0];

    // Vérifier que le fichier existe
    try {
      await fs.access(report.file_path);
    } catch {
      return res.status(404).json({ error: 'Fichier du rapport non trouvé' });
    }

    // Préparer les données d'inspection (simplifiées)
    const inspectionData = {
      vehicle_registration: 'N/A',
      vehicle_brand: 'N/A',
      vehicle_model: 'N/A',
      inspection_date: report.created_at,
      status: 'completed',
      observations: 'Rapport renvoyé',
    };

    // Envoyer l'email
    await sendInspectionCertificate(
      email,
      name || 'Client',
      report.file_path,
      inspectionData
    );

    res.json({
      message: 'Email envoyé avec succès',
      email: email
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email', details: error.message });
  }
}

module.exports = {
  getAllReports,
  getReportById,
  generateReport,
  downloadReport,
  deleteReport,
  resendReportEmail,
};
