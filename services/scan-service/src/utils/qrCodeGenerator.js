const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

/**
 * Génère un QR code pour un rendez-vous
 * @param {Object} appointmentData - Données du rendez-vous
 * @returns {Promise<Object>} - QR code en base64 et chemin du fichier
 */
async function generateAppointmentQRCode(appointmentData) {
  try {
    const { appointmentId, userId, date, time } = appointmentData;

    // Créer les données du QR code
    const qrData = JSON.stringify({
      type: 'appointment',
      appointmentId,
      userId,
      date,
      time,
      timestamp: new Date().toISOString()
    });

    // Générer le QR code en base64
    const qrCodeBase64 = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#0066CC',  // Bleu
        light: '#FFFFFF'  // Blanc
      }
    });

    // Optionnel: Sauvegarder le QR code en fichier
    const qrDir = path.join(__dirname, '../../uploads/qrcodes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    const fileName = `qr_appointment_${appointmentId}_${Date.now()}.png`;
    const filePath = path.join(qrDir, fileName);

    // Extraire les données base64 et sauvegarder
    const base64Data = qrCodeBase64.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filePath, base64Data, 'base64');

    return {
      qrCodeBase64,
      filePath: `/uploads/qrcodes/${fileName}`,
      data: qrData
    };
  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error);
    throw error;
  }
}

/**
 * Génère un QR code pour un rapport de contrôle technique
 * @param {Object} reportData - Données du rapport
 * @returns {Promise<Object>} - QR code en base64
 */
async function generateReportQRCode(reportData) {
  try {
    const { reportId, vehicleRegistration, inspectionDate, result } = reportData;

    const qrData = JSON.stringify({
      type: 'inspection_report',
      reportId,
      vehicleRegistration,
      inspectionDate,
      result,
      timestamp: new Date().toISOString()
    });

    const qrCodeBase64 = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2
    });

    return {
      qrCodeBase64,
      data: qrData
    };
  } catch (error) {
    console.error('Erreur lors de la génération du QR code rapport:', error);
    throw error;
  }
}

/**
 * Génère un QR code simple à partir de texte
 * @param {String} text - Texte à encoder
 * @returns {Promise<String>} - QR code en base64
 */
async function generateSimpleQRCode(text) {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 200
    });
  } catch (error) {
    console.error('Erreur lors de la génération du QR code simple:', error);
    throw error;
  }
}

module.exports = {
  generateAppointmentQRCode,
  generateReportQRCode,
  generateSimpleQRCode
};
