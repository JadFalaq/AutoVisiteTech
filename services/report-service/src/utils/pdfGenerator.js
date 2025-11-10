const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Génère un certificat de contrôle technique en PDF
 */
async function generateInspectionCertificate(inspectionData, filePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // En-tête
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('CERTIFICAT DE CONTRÔLE TECHNIQUE', { align: 'center' })
         .moveDown();

      doc.fontSize(12)
         .font('Helvetica')
         .text(`Numéro: ${inspectionData.inspection_number || 'N/A'}`, { align: 'center' })
         .text(`Date: ${new Date(inspectionData.inspection_date).toLocaleDateString('fr-FR')}`, { align: 'center' })
         .moveDown(2);

      // Informations du véhicule
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('INFORMATIONS DU VÉHICULE')
         .moveDown(0.5);

      doc.fontSize(11)
         .font('Helvetica');

      const vehicleInfo = [
        ['Immatriculation:', inspectionData.vehicle_registration || 'N/A'],
        ['Marque:', inspectionData.vehicle_brand || 'N/A'],
        ['Modèle:', inspectionData.vehicle_model || 'N/A'],
        ['VIN:', inspectionData.vehicle_vin || 'N/A'],
        ['Année:', inspectionData.vehicle_year || 'N/A'],
        ['Kilométrage:', `${inspectionData.mileage || 'N/A'} km`],
      ];

      vehicleInfo.forEach(([label, value]) => {
        doc.text(`${label} ${value}`, { continued: false });
      });

      doc.moveDown(1.5);

      // Informations du propriétaire
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('INFORMATIONS DU PROPRIÉTAIRE')
         .moveDown(0.5);

      doc.fontSize(11)
         .font('Helvetica');

      const ownerInfo = [
        ['Nom:', inspectionData.owner_name || 'N/A'],
        ['Email:', inspectionData.owner_email || 'N/A'],
        ['Téléphone:', inspectionData.owner_phone || 'N/A'],
      ];

      ownerInfo.forEach(([label, value]) => {
        doc.text(`${label} ${value}`);
      });

      doc.moveDown(1.5);

      // Résultat du contrôle
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('RÉSULTAT DU CONTRÔLE')
         .moveDown(0.5);

      const status = inspectionData.status || 'pending';
      const statusText = {
        'passed': 'FAVORABLE',
        'failed': 'DÉFAVORABLE',
        'conditional': 'FAVORABLE AVEC RÉSERVES'
      }[status] || 'EN ATTENTE';

      const statusColor = {
        'passed': '#28a745',
        'failed': '#dc3545',
        'conditional': '#ffc107'
      }[status] || '#6c757d';

      doc.fontSize(18)
         .fillColor(statusColor)
         .font('Helvetica-Bold')
         .text(statusText, { align: 'center' })
         .fillColor('#000000')
         .moveDown(1.5);

      // Points de contrôle
      if (inspectionData.checkpoints && inspectionData.checkpoints.length > 0) {
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('POINTS DE CONTRÔLE')
           .moveDown(0.5);

        doc.fontSize(10)
           .font('Helvetica');

        inspectionData.checkpoints.forEach((checkpoint, index) => {
          const checkStatus = checkpoint.status === 'passed' ? '✓' : '✗';
          const checkColor = checkpoint.status === 'passed' ? '#28a745' : '#dc3545';
          
          doc.fillColor(checkColor)
             .text(`${checkStatus} ${checkpoint.name}`, { continued: true })
             .fillColor('#000000')
             .text(` - ${checkpoint.result || 'OK'}`, { continued: false });
        });

        doc.moveDown(1.5);
      }

      // Observations
      if (inspectionData.observations) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('OBSERVATIONS')
           .moveDown(0.5);

        doc.fontSize(10)
           .font('Helvetica')
           .text(inspectionData.observations, { align: 'justify' })
           .moveDown(1.5);
      }

      // Inspecteur
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Inspecteur: ${inspectionData.inspector_name || 'N/A'}`)
         .text(`Date de validité: ${inspectionData.validity_date ? new Date(inspectionData.validity_date).toLocaleDateString('fr-FR') : 'N/A'}`)
         .moveDown(2);

      // Pied de page
      doc.fontSize(8)
         .font('Helvetica')
         .text('Auto Visite Tech - Centre de contrôle technique agréé', { align: 'center' })
         .text('Ce document est valable uniquement avec le cachet et la signature', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Génère une facture en PDF
 */
async function generateInvoice(invoiceData, filePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // En-tête
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .text('FACTURE', { align: 'center' })
         .moveDown();

      doc.fontSize(12)
         .font('Helvetica')
         .text(`Numéro: ${invoiceData.invoice_number}`, { align: 'center' })
         .text(`Date: ${new Date(invoiceData.created_at).toLocaleDateString('fr-FR')}`, { align: 'center' })
         .moveDown(2);

      // Informations entreprise
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('AUTO VISITE TECH', { align: 'left' })
         .fontSize(10)
         .font('Helvetica')
         .text('123 Avenue du Contrôle Technique')
         .text('75001 Paris, France')
         .text('SIRET: 123 456 789 00012')
         .text('TVA: FR12345678901')
         .moveDown(1.5);

      // Informations client
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('FACTURÉ À:', { align: 'left' })
         .fontSize(10)
         .font('Helvetica')
         .text(invoiceData.customer_name || 'N/A')
         .text(invoiceData.customer_email || 'N/A')
         .text(invoiceData.customer_phone || 'N/A')
         .moveDown(2);

      // Ligne de séparation
      doc.moveTo(50, doc.y)
         .lineTo(550, doc.y)
         .stroke()
         .moveDown(1);

      // Tableau des services
      doc.fontSize(12)
         .font('Helvetica-Bold');

      const tableTop = doc.y;
      doc.text('Description', 50, tableTop)
         .text('Quantité', 300, tableTop)
         .text('Prix unitaire', 380, tableTop)
         .text('Total', 480, tableTop, { align: 'right' });

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y)
         .lineTo(550, doc.y)
         .stroke()
         .moveDown(0.5);

      // Lignes de la facture
      doc.fontSize(10)
         .font('Helvetica');

      const items = invoiceData.items || [
        { description: 'Contrôle technique complet', quantity: 1, unit_price: invoiceData.amount }
      ];

      items.forEach((item) => {
        const itemY = doc.y;
        doc.text(item.description, 50, itemY, { width: 240 })
           .text(item.quantity.toString(), 300, itemY)
           .text(`${item.unit_price.toFixed(2)} €`, 380, itemY)
           .text(`${(item.quantity * item.unit_price).toFixed(2)} €`, 480, itemY, { align: 'right' });
        doc.moveDown(0.8);
      });

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y)
         .lineTo(550, doc.y)
         .stroke()
         .moveDown(1);

      // Totaux
      const totalsX = 380;
      doc.fontSize(11)
         .font('Helvetica');

      doc.text('Sous-total:', totalsX, doc.y)
         .text(`${invoiceData.amount.toFixed(2)} €`, 480, doc.y, { align: 'right' });
      doc.moveDown(0.5);

      doc.text(`TVA (${((invoiceData.tax_amount / invoiceData.amount) * 100).toFixed(0)}%):`, totalsX, doc.y)
         .text(`${invoiceData.tax_amount.toFixed(2)} €`, 480, doc.y, { align: 'right' });
      doc.moveDown(0.5);

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('TOTAL:', totalsX, doc.y)
         .text(`${invoiceData.total_amount.toFixed(2)} €`, 480, doc.y, { align: 'right' });

      doc.moveDown(2);

      // Informations de paiement
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Date d'échéance: ${new Date(invoiceData.due_date).toLocaleDateString('fr-FR')}`)
         .text(`Statut: ${invoiceData.status === 'paid' ? 'PAYÉE' : 'EN ATTENTE'}`)
         .moveDown(2);

      // Conditions
      doc.fontSize(8)
         .font('Helvetica')
         .text('Conditions de paiement: Paiement à réception', { align: 'left' })
         .text('En cas de retard de paiement, des pénalités de 3 fois le taux d\'intérêt légal seront appliquées.')
         .moveDown(2);

      // Pied de page
      doc.fontSize(8)
         .text('Merci de votre confiance !', { align: 'center' })
         .text('Auto Visite Tech - www.autovisitetech.fr - contact@autovisitetech.fr', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Génère un rapport détaillé d'inspection
 */
async function generateDetailedReport(inspectionData, filePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // En-tête
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('RAPPORT DÉTAILLÉ D\'INSPECTION', { align: 'center' })
         .moveDown();

      doc.fontSize(10)
         .font('Helvetica')
         .text(`Référence: ${inspectionData.inspection_number || 'N/A'}`, { align: 'center' })
         .text(`Date: ${new Date(inspectionData.inspection_date).toLocaleDateString('fr-FR')}`, { align: 'center' })
         .moveDown(2);

      // Contenu du rapport
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('SYNTHÈSE')
         .moveDown(0.5);

      doc.fontSize(10)
         .font('Helvetica')
         .text(`Véhicule: ${inspectionData.vehicle_brand} ${inspectionData.vehicle_model}`)
         .text(`Immatriculation: ${inspectionData.vehicle_registration}`)
         .text(`Kilométrage: ${inspectionData.mileage} km`)
         .text(`Résultat: ${inspectionData.status}`)
         .moveDown(1.5);

      // Détails techniques
      if (inspectionData.technical_details) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('DÉTAILS TECHNIQUES')
           .moveDown(0.5);

        doc.fontSize(10)
           .font('Helvetica')
           .text(inspectionData.technical_details, { align: 'justify' })
           .moveDown(1.5);
      }

      // Recommandations
      if (inspectionData.recommendations) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('RECOMMANDATIONS')
           .moveDown(0.5);

        doc.fontSize(10)
           .font('Helvetica')
           .text(inspectionData.recommendations, { align: 'justify' });
      }

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateInspectionCertificate,
  generateInvoice,
  generateDetailedReport
};
