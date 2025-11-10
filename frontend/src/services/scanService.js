import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Upload un document
export const uploadDocument = async (file, userId, appointmentId, documentType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);
  formData.append('document_type', documentType);
  if (appointmentId) {
    formData.append('appointment_id', appointmentId);
  }

  const response = await axios.post(`${API_URL}/api/scans/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Upload multiple documents
export const uploadMultipleDocuments = async (files, userId, appointmentId, documentType) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  formData.append('user_id', userId);
  formData.append('document_type', documentType);
  if (appointmentId) {
    formData.append('appointment_id', appointmentId);
  }

  const response = await axios.post(`${API_URL}/api/scans/upload-multiple`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Récupérer tous les scans d'un utilisateur
export const getUserScans = async (userId) => {
  const response = await axios.get(`${API_URL}/api/scans?user_id=${userId}`);
  return response.data;
};

// Récupérer les scans d'un rendez-vous
export const getAppointmentScans = async (appointmentId) => {
  const response = await axios.get(`${API_URL}/api/scans?appointment_id=${appointmentId}`);
  return response.data;
};

// Récupérer un scan par ID
export const getScanById = async (scanId) => {
  const response = await axios.get(`${API_URL}/api/scans/${scanId}`);
  return response.data;
};

// Supprimer un scan
export const deleteScan = async (scanId) => {
  const response = await axios.delete(`${API_URL}/api/scans/${scanId}`);
  return response.data;
};

// OCR - Extraire les données d'une carte grise
export const extractCarteGriseData = async (file, userId, appointmentId) => {
  const formData = new FormData();
  formData.append('carteGrise', file);
  formData.append('user_id', userId);
  if (appointmentId) {
    formData.append('appointment_id', appointmentId);
  }

  const response = await axios.post(`${API_URL}/api/scans/ocr/carte-grise`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// OCR - Extraire les données d'un PV
export const extractPVData = async (file) => {
  const formData = new FormData();
  formData.append('pv', file);

  const response = await axios.post(`${API_URL}/api/scans/ocr/pv`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// OCR - Extraire du texte générique
export const extractText = async (file, lang = 'fra') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('lang', lang);

  const response = await axios.post(`${API_URL}/api/scans/ocr/text`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Générer un QR code pour un rendez-vous
export const generateAppointmentQRCode = async (appointmentId, userId, date, time) => {
  const response = await axios.post(`${API_URL}/api/scans/generate-qr/appointment`, {
    appointmentId,
    userId,
    date,
    time,
  });
  return response.data;
};

// Générer un QR code pour un rapport
export const generateReportQRCode = async (reportId, vehicleRegistration, inspectionDate, result) => {
  const response = await axios.post(`${API_URL}/api/scans/generate-qr/report`, {
    reportId,
    vehicleRegistration,
    inspectionDate,
    result,
  });
  return response.data;
};

// Générer un QR code simple
export const generateSimpleQRCode = async (text) => {
  const response = await axios.post(`${API_URL}/api/scans/generate-qr/simple`, {
    text,
  });
  return response.data;
};

// Lire un QR code depuis une image
export const readQRCode = async (file) => {
  const formData = new FormData();
  formData.append('qrImage', file);

  const response = await axios.post(`${API_URL}/api/scans/read-qr`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Vérifier la qualité d'une image
export const checkImageQuality = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${API_URL}/api/scans/check-quality`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
