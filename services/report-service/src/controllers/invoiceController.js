const { Pool } = require('pg');
const path = require('path');
const fs = require('fs').promises;
const { generateInvoice } = require('../utils/pdfGenerator');
const { sendInvoice, sendInvoiceReminder, sendPaymentConfirmation } = require('../utils/emailService');
const { publishInvoiceCreated, publishInvoicePaid } = require('../messaging/rabbitmq');

// Créer le dossier invoices s'il n'existe pas
const INVOICES_DIR = path.join(__dirname, '../../reports/invoices');
fs.mkdir(INVOICES_DIR, { recursive: true }).catch(console.error);

/**
 * Récupérer toutes les factures
 */
async function getAllInvoices(req, res, pool) {
  try {
    const userId = req.query.user_id;
    const status = req.query.status;
    
    let query = 'SELECT * FROM invoices ORDER BY created_at DESC';
    let params = [];
    
    if (userId && status) {
      query = 'SELECT * FROM invoices WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC';
      params = [userId, status];
    } else if (userId) {
      query = 'SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC';
      params = [userId];
    } else if (status) {
      query = 'SELECT * FROM invoices WHERE status = $1 ORDER BY created_at DESC';
      params = [status];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des factures', details: error.message });
  }
}

/**
 * Récupérer une facture par ID
 */
async function getInvoiceById(req, res, pool) {
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
}

/**
 * Créer une facture
 */
async function createInvoice(req, res, pool) {
  try {
    const {
      user_id,
      appointment_id,
      payment_id,
      amount,
      tax_rate,
      customer_data,
      items,
      send_email
    } = req.body;

    if (!user_id || !amount) {
      return res.status(400).json({ error: 'user_id et amount sont requis' });
    }

    // Calculs
    const invoice_number = `INV-${Date.now()}`;
    const tax_amount = amount * (tax_rate || 0.20); // 20% TVA par défaut
    const total_amount = amount + tax_amount;
    const due_date = new Date();
    due_date.setDate(due_date.getDate() + 30); // 30 jours

    // Créer la facture dans la base de données
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

    const invoice = result.rows[0];

    // Générer le PDF
    const fileName = `${invoice_number}.pdf`;
    const filePath = path.join(INVOICES_DIR, fileName);

    const invoiceData = {
      ...invoice,
      customer_name: customer_data?.name || 'N/A',
      customer_email: customer_data?.email || 'N/A',
      customer_phone: customer_data?.phone || 'N/A',
      items: items || [{ description: 'Contrôle technique', quantity: 1, unit_price: amount }],
    };

    await generateInvoice(invoiceData, filePath);

    // Mettre à jour avec le chemin du fichier
    const fileUrl = `${process.env.API_URL || 'http://localhost:8008'}/api/invoices/download/${fileName}`;
    await pool.query(
      'UPDATE invoices SET file_path = $1, file_url = $2 WHERE id = $3',
      [filePath, fileUrl, invoice.id]
    );

    invoice.file_path = filePath;
    invoice.file_url = fileUrl;

    // Publier l'événement
    await publishInvoiceCreated({
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      user_id,
      amount: total_amount,
    });

    // Envoyer par email si demandé
    if (send_email && customer_data?.email) {
      try {
        await sendInvoice(
          customer_data.email,
          customer_data.name || 'Client',
          filePath,
          invoiceData
        );
        console.log('✅ Email de facture envoyé');
      } catch (emailError) {
        console.error('⚠️  Erreur lors de l\'envoi de l\'email:', emailError.message);
      }
    }

    res.status(201).json({
      message: 'Facture créée avec succès',
      invoice: invoice
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la facture', details: error.message });
  }
}

/**
 * Mettre à jour le statut d'une facture
 */
async function updateInvoiceStatus(req, res, pool) {
  try {
    const { id } = req.params;
    const { status, customer_email, customer_name } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status est requis' });
    }

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

    const invoice = result.rows[0];

    // Si la facture est payée, publier l'événement et envoyer confirmation
    if (status === 'paid') {
      await publishInvoicePaid({
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        user_id: invoice.user_id,
        amount: invoice.total_amount,
        paid_at: invoice.paid_at,
      });

      // Envoyer email de confirmation si email fourni
      if (customer_email) {
        try {
          await sendPaymentConfirmation(
            customer_email,
            customer_name || 'Client',
            invoice
          );
          console.log('✅ Email de confirmation envoyé');
        } catch (emailError) {
          console.error('⚠️  Erreur lors de l\'envoi de la confirmation:', emailError.message);
        }
      }
    }

    res.json({
      message: 'Facture mise à jour',
      invoice: invoice
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la facture', details: error.message });
  }
}

/**
 * Télécharger une facture
 */
async function downloadInvoice(req, res, pool) {
  try {
    const { filename } = req.params;
    const filePath = path.join(INVOICES_DIR, filename);

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
 * Envoyer un rappel de paiement
 */
async function sendPaymentReminder(req, res, pool) {
  try {
    const { id } = req.params;
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email est requis' });
    }

    // Récupérer la facture
    const result = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    const invoice = result.rows[0];

    if (invoice.status === 'paid') {
      return res.status(400).json({ error: 'Cette facture est déjà payée' });
    }

    // Envoyer le rappel
    await sendInvoiceReminder(email, name || 'Client', invoice);

    res.json({
      message: 'Rappel envoyé avec succès',
      email: email
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du rappel', details: error.message });
  }
}

/**
 * Renvoyer une facture par email
 */
async function resendInvoiceEmail(req, res, pool) {
  try {
    const { id } = req.params;
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email est requis' });
    }

    // Récupérer la facture
    const result = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    const invoice = result.rows[0];

    // Vérifier que le fichier existe
    if (!invoice.file_path) {
      return res.status(404).json({ error: 'Fichier de facture non trouvé' });
    }

    try {
      await fs.access(invoice.file_path);
    } catch {
      return res.status(404).json({ error: 'Fichier de facture non trouvé sur le disque' });
    }

    // Préparer les données
    const invoiceData = {
      ...invoice,
      customer_name: name || 'Client',
      customer_email: email,
    };

    // Envoyer l'email
    await sendInvoice(email, name || 'Client', invoice.file_path, invoiceData);

    res.json({
      message: 'Email envoyé avec succès',
      email: email
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email', details: error.message });
  }
}

/**
 * Récupérer les factures en retard
 */
async function getOverdueInvoices(req, res, pool) {
  try {
    const result = await pool.query(
      `SELECT * FROM invoices 
       WHERE status = 'pending' 
       AND due_date < CURRENT_DATE 
       ORDER BY due_date ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des factures en retard', details: error.message });
  }
}

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  downloadInvoice,
  sendPaymentReminder,
  resendInvoiceEmail,
  getOverdueInvoices,
};
