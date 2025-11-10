/**
 * Service pour interagir avec le Report Service (Rapports et Factures)
 */

const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000';

/**
 * ==================== RAPPORTS ====================
 */

/**
 * Récupérer tous les rapports
 * @param {Object} filters - Filtres optionnels (user_id, inspection_id)
 * @returns {Promise<Array>} Liste des rapports
 */
export const getAllReports = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.user_id) queryParams.append('user_id', filters.user_id);
    if (filters.inspection_id) queryParams.append('inspection_id', filters.inspection_id);

    const url = `${API_URL}/api/reports${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports:', error);
    throw error;
  }
};

/**
 * Récupérer un rapport par ID
 * @param {number} reportId - ID du rapport
 * @returns {Promise<Object>} Détails du rapport
 */
export const getReportById = async (reportId) => {
  try {
    const response = await fetch(`${API_URL}/api/reports/${reportId}`);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération du rapport:', error);
    throw error;
  }
};

/**
 * Générer un nouveau rapport
 * @param {Object} reportData - Données du rapport
 * @returns {Promise<Object>} Rapport généré
 */
export const generateReport = async (reportData) => {
  try {
    const response = await fetch(`${API_URL}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Erreur ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    throw error;
  }
};

/**
 * Télécharger un rapport PDF
 * @param {string} filename - Nom du fichier
 * @returns {string} URL de téléchargement
 */
export const downloadReport = (filename) => {
  return `${API_URL}/api/reports/download/${filename}`;
};

/**
 * Renvoyer un rapport par email
 * @param {number} reportId - ID du rapport
 * @param {Object} emailData - Données email (email, name)
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export const resendReportEmail = async (reportId, emailData) => {
  try {
    const response = await fetch(`${API_URL}/api/reports/${reportId}/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Erreur ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors du renvoi du rapport:', error);
    throw error;
  }
};

/**
 * Supprimer un rapport
 * @param {number} reportId - ID du rapport
 * @returns {Promise<Object>} Résultat de la suppression
 */
export const deleteReport = async (reportId) => {
  try {
    const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Erreur ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la suppression du rapport:', error);
    throw error;
  }
};

/**
 * ==================== FACTURES ====================
 */

/**
 * Récupérer toutes les factures
 * @param {Object} filters - Filtres optionnels (user_id, status)
 * @returns {Promise<Array>} Liste des factures
 */
export const getAllInvoices = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.user_id) queryParams.append('user_id', filters.user_id);
    if (filters.status) queryParams.append('status', filters.status);

    const url = `${API_URL}/api/invoices${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    throw error;
  }
};

/**
 * Récupérer les factures en retard
 * @returns {Promise<Array>} Liste des factures en retard
 */
export const getOverdueInvoices = async () => {
  try {
    const response = await fetch(`${API_URL}/api/invoices/overdue`);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des factures en retard:', error);
    throw error;
  }
};

/**
 * Récupérer une facture par ID
 * @param {number} invoiceId - ID de la facture
 * @returns {Promise<Object>} Détails de la facture
 */
export const getInvoiceById = async (invoiceId) => {
  try {
    const response = await fetch(`${API_URL}/api/invoices/${invoiceId}`);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération de la facture:', error);
    throw error;
  }
};

/**
 * Créer une nouvelle facture
 * @param {Object} invoiceData - Données de la facture
 * @returns {Promise<Object>} Facture créée
 */
export const createInvoice = async (invoiceData) => {
  try {
    const response = await fetch(`${API_URL}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Erreur ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    throw error;
  }
};

/**
 * Télécharger une facture PDF
 * @param {string} filename - Nom du fichier
 * @returns {string} URL de téléchargement
 */
export const downloadInvoice = (filename) => {
  return `${API_URL}/api/invoices/download/${filename}`;
};

/**
 * Mettre à jour le statut d'une facture
 * @param {number} invoiceId - ID de la facture
 * @param {Object} statusData - Nouvelles données (status, customer_email, customer_name)
 * @returns {Promise<Object>} Facture mise à jour
 */
export const updateInvoiceStatus = async (invoiceId, statusData) => {
  try {
    const response = await fetch(`${API_URL}/api/invoices/${invoiceId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Erreur ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error);
    throw error;
  }
};

/**
 * Envoyer un rappel de paiement
 * @param {number} invoiceId - ID de la facture
 * @param {Object} emailData - Données email (email, name)
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export const sendPaymentReminder = async (invoiceId, emailData) => {
  try {
    const response = await fetch(`${API_URL}/api/invoices/${invoiceId}/reminder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Erreur ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'envoi du rappel:', error);
    throw error;
  }
};

/**
 * Renvoyer une facture par email
 * @param {number} invoiceId - ID de la facture
 * @param {Object} emailData - Données email (email, name)
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export const resendInvoiceEmail = async (invoiceId, emailData) => {
  try {
    const response = await fetch(`${API_URL}/api/invoices/${invoiceId}/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Erreur ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors du renvoi de la facture:', error);
    throw error;
  }
};

/**
 * ==================== HELPERS ====================
 */

/**
 * Formater le statut d'un rapport
 * @param {string} status - Statut du rapport
 * @returns {Object} Statut formaté avec label et couleur
 */
export const formatReportStatus = (status) => {
  const statusMap = {
    pending: { label: 'En attente', color: 'warning' },
    completed: { label: 'Terminé', color: 'success' },
    failed: { label: 'Échoué', color: 'error' },
  };
  return statusMap[status] || { label: status, color: 'default' };
};

/**
 * Formater le statut d'une facture
 * @param {string} status - Statut de la facture
 * @returns {Object} Statut formaté avec label et couleur
 */
export const formatInvoiceStatus = (status) => {
  const statusMap = {
    pending: { label: 'En attente', color: 'warning' },
    paid: { label: 'Payée', color: 'success' },
    overdue: { label: 'En retard', color: 'error' },
    cancelled: { label: 'Annulée', color: 'default' },
  };
  return statusMap[status] || { label: status, color: 'default' };
};

/**
 * Formater le type de rapport
 * @param {string} type - Type de rapport
 * @returns {string} Type formaté
 */
export const formatReportType = (type) => {
  const typeMap = {
    inspection_certificate: 'Certificat de contrôle technique',
    detailed_report: 'Rapport détaillé',
    invoice: 'Facture',
  };
  return typeMap[type] || type;
};

/**
 * Calculer si une facture est en retard
 * @param {string} dueDate - Date d'échéance
 * @param {string} status - Statut de la facture
 * @returns {boolean} True si en retard
 */
export const isInvoiceOverdue = (dueDate, status) => {
  if (status === 'paid') return false;
  const due = new Date(dueDate);
  const now = new Date();
  return due < now;
};

/**
 * Calculer les jours de retard
 * @param {string} dueDate - Date d'échéance
 * @returns {number} Nombre de jours de retard (0 si pas en retard)
 */
export const getDaysOverdue = (dueDate) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = now - due;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

export default {
  // Rapports
  getAllReports,
  getReportById,
  generateReport,
  downloadReport,
  resendReportEmail,
  deleteReport,
  
  // Factures
  getAllInvoices,
  getOverdueInvoices,
  getInvoiceById,
  createInvoice,
  downloadInvoice,
  updateInvoiceStatus,
  sendPaymentReminder,
  resendInvoiceEmail,
  
  // Helpers
  formatReportStatus,
  formatInvoiceStatus,
  formatReportType,
  isInvoiceOverdue,
  getDaysOverdue,
};
