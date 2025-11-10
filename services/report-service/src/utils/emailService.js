const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * Configuration du transporteur email
 */
function createEmailTransporter() {
  // En production, utiliser un vrai service SMTP (Gmail, SendGrid, etc.)
  // Pour le développement, utiliser Ethereal (service de test)
  
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Configuration production
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true pour port 465, false pour autres ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Configuration développement (Ethereal - emails de test)
    console.log('⚠️  Configuration email non trouvée, utilisation du mode test');
    console.log('💡 Configurez EMAIL_HOST, EMAIL_USER, EMAIL_PASS dans .env pour la production');
    
    // Retourner un transporteur de test
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'test@ethereal.email',
        pass: 'testpassword',
      },
    });
  }
}

/**
 * Envoie un email avec un certificat de contrôle technique
 */
async function sendInspectionCertificate(recipientEmail, recipientName, certificatePath, inspectionData) {
  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Auto Visite Tech" <noreply@autovisitetech.fr>',
      to: recipientEmail,
      subject: `Certificat de contrôle technique - ${inspectionData.vehicle_registration}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Certificat de contrôle technique</h2>
          
          <p>Bonjour ${recipientName},</p>
          
          <p>Votre contrôle technique a été effectué avec succès.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Détails du véhicule</h3>
            <p><strong>Immatriculation:</strong> ${inspectionData.vehicle_registration}</p>
            <p><strong>Marque:</strong> ${inspectionData.vehicle_brand}</p>
            <p><strong>Modèle:</strong> ${inspectionData.vehicle_model}</p>
            <p><strong>Date du contrôle:</strong> ${new Date(inspectionData.inspection_date).toLocaleDateString('fr-FR')}</p>
            <p><strong>Résultat:</strong> <span style="color: ${inspectionData.status === 'passed' ? '#28a745' : '#dc3545'}; font-weight: bold;">
              ${inspectionData.status === 'passed' ? 'FAVORABLE' : inspectionData.status === 'conditional' ? 'FAVORABLE AVEC RÉSERVES' : 'DÉFAVORABLE'}
            </span></p>
          </div>
          
          <p>Vous trouverez votre certificat en pièce jointe.</p>
          
          ${inspectionData.observations ? `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #856404;">Observations</h4>
              <p>${inspectionData.observations}</p>
            </div>
          ` : ''}
          
          <p>Merci de votre confiance.</p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #6c757d;">
            <strong>Auto Visite Tech</strong><br>
            Centre de contrôle technique agréé<br>
            📞 01 23 45 67 89 | 📧 contact@autovisitetech.fr<br>
            🌐 www.autovisitetech.fr
          </p>
        </div>
      `,
      attachments: [
        {
          filename: path.basename(certificatePath),
          path: certificatePath,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé:', info.messageId);
    
    // En mode test, afficher l'URL de prévisualisation
    if (info.messageId && process.env.NODE_ENV !== 'production') {
      console.log('🔗 Prévisualisation:', nodemailer.getTestMessageUrl(info));
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}

/**
 * Envoie un email avec une facture
 */
async function sendInvoice(recipientEmail, recipientName, invoicePath, invoiceData) {
  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Auto Visite Tech" <noreply@autovisitetech.fr>',
      to: recipientEmail,
      subject: `Facture ${invoiceData.invoice_number} - Auto Visite Tech`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Votre facture</h2>
          
          <p>Bonjour ${recipientName},</p>
          
          <p>Veuillez trouver ci-joint votre facture pour le contrôle technique effectué.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Détails de la facture</h3>
            <p><strong>Numéro:</strong> ${invoiceData.invoice_number}</p>
            <p><strong>Date:</strong> ${new Date(invoiceData.created_at).toLocaleDateString('fr-FR')}</p>
            <p><strong>Montant HT:</strong> ${invoiceData.amount.toFixed(2)} €</p>
            <p><strong>TVA:</strong> ${invoiceData.tax_amount.toFixed(2)} €</p>
            <p><strong>Montant TTC:</strong> <span style="font-size: 18px; font-weight: bold; color: #28a745;">${invoiceData.total_amount.toFixed(2)} €</span></p>
            <p><strong>Statut:</strong> ${invoiceData.status === 'paid' ? '✅ PAYÉE' : '⏳ EN ATTENTE'}</p>
            ${invoiceData.status !== 'paid' ? `<p><strong>Date d'échéance:</strong> ${new Date(invoiceData.due_date).toLocaleDateString('fr-FR')}</p>` : ''}
          </div>
          
          ${invoiceData.status !== 'paid' ? `
            <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460;">
                💳 <strong>Paiement en ligne disponible</strong><br>
                Connectez-vous à votre espace client pour régler cette facture.
              </p>
            </div>
          ` : ''}
          
          <p>Pour toute question concernant cette facture, n'hésitez pas à nous contacter.</p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #6c757d;">
            <strong>Auto Visite Tech</strong><br>
            Centre de contrôle technique agréé<br>
            📞 01 23 45 67 89 | 📧 contact@autovisitetech.fr<br>
            🌐 www.autovisitetech.fr
          </p>
        </div>
      `,
      attachments: [
        {
          filename: path.basename(invoicePath),
          path: invoicePath,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé:', info.messageId);
    
    if (info.messageId && process.env.NODE_ENV !== 'production') {
      console.log('🔗 Prévisualisation:', nodemailer.getTestMessageUrl(info));
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}

/**
 * Envoie un email de rappel pour une facture impayée
 */
async function sendInvoiceReminder(recipientEmail, recipientName, invoiceData) {
  try {
    const transporter = createEmailTransporter();

    const daysOverdue = Math.floor((new Date() - new Date(invoiceData.due_date)) / (1000 * 60 * 60 * 24));

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Auto Visite Tech" <noreply@autovisitetech.fr>',
      to: recipientEmail,
      subject: `Rappel - Facture ${invoiceData.invoice_number} en attente`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Rappel de paiement</h2>
          
          <p>Bonjour ${recipientName},</p>
          
          <p>Nous vous rappelons que la facture suivante est en attente de paiement${daysOverdue > 0 ? ` depuis ${daysOverdue} jour(s)` : ''}.</p>
          
          <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="margin-top: 0; color: #721c24;">Détails de la facture</h3>
            <p><strong>Numéro:</strong> ${invoiceData.invoice_number}</p>
            <p><strong>Date d'échéance:</strong> ${new Date(invoiceData.due_date).toLocaleDateString('fr-FR')}</p>
            <p><strong>Montant à régler:</strong> <span style="font-size: 18px; font-weight: bold;">${invoiceData.total_amount.toFixed(2)} €</span></p>
          </div>
          
          <p>Merci de procéder au règlement dans les plus brefs délais.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/invoices/${invoiceData.id}" 
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Payer maintenant
            </a>
          </div>
          
          <p style="font-size: 12px; color: #6c757d;">
            Si vous avez déjà effectué le paiement, veuillez ignorer ce message.
          </p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #6c757d;">
            <strong>Auto Visite Tech</strong><br>
            📞 01 23 45 67 89 | 📧 contact@autovisitetech.fr
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de rappel envoyé:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du rappel:', error);
    throw error;
  }
}

/**
 * Envoie un email de confirmation de paiement
 */
async function sendPaymentConfirmation(recipientEmail, recipientName, invoiceData) {
  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Auto Visite Tech" <noreply@autovisitetech.fr>',
      to: recipientEmail,
      subject: `Confirmation de paiement - Facture ${invoiceData.invoice_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">✅ Paiement confirmé</h2>
          
          <p>Bonjour ${recipientName},</p>
          
          <p>Nous avons bien reçu votre paiement. Merci !</p>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #155724;">Détails du paiement</h3>
            <p><strong>Facture:</strong> ${invoiceData.invoice_number}</p>
            <p><strong>Montant payé:</strong> ${invoiceData.total_amount.toFixed(2)} €</p>
            <p><strong>Date de paiement:</strong> ${new Date(invoiceData.paid_at).toLocaleDateString('fr-FR')}</p>
          </div>
          
          <p>Un reçu de paiement vous sera envoyé séparément.</p>
          
          <p>Merci de votre confiance.</p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #6c757d;">
            <strong>Auto Visite Tech</strong><br>
            📞 01 23 45 67 89 | 📧 contact@autovisitetech.fr
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmation envoyé:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la confirmation:', error);
    throw error;
  }
}

module.exports = {
  sendInspectionCertificate,
  sendInvoice,
  sendInvoiceReminder,
  sendPaymentConfirmation,
};
