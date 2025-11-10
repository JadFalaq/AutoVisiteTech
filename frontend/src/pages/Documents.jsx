import { useState, useEffect } from 'react';
import { FileText, Upload, QrCode, Camera, Trash2, Download, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import * as scanService from '../services/scanService';

function Documents() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // upload, ocr, qrcode, myDocuments
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('carte_grise');
  const [ocrResult, setOcrResult] = useState(null);
  const [qrCodeResult, setQrCodeResult] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (activeTab === 'myDocuments') {
      loadUserScans();
    }
  }, [activeTab]);

  const loadUserScans = async () => {
    try {
      setLoading(true);
      const data = await scanService.getUserScans(user.id);
      setScans(data);
    } catch (err) {
      setError('Erreur lors du chargement des documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await scanService.uploadDocument(
        selectedFile,
        user.id,
        null,
        documentType
      );
      setSuccess('Document uploadé avec succès !');
      setSelectedFile(null);
      e.target.reset();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de l\'upload du document');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOCR = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Veuillez sélectionner une image');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setOcrResult(null);

      let result;
      if (documentType === 'carte_grise') {
        result = await scanService.extractCarteGriseData(selectedFile, user.id);
      } else if (documentType === 'pv') {
        result = await scanService.extractPVData(selectedFile);
      } else {
        result = await scanService.extractText(selectedFile);
      }

      setOcrResult(result);
      setSuccess('Analyse OCR terminée !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de l\'analyse OCR');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReadQRCode = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Veuillez sélectionner une image contenant un QR code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setQrCodeResult(null);

      const result = await scanService.readQRCode(selectedFile);
      setQrCodeResult(result);
      setSuccess('QR Code lu avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la lecture du QR code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScan = async (scanId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      await scanService.deleteScan(scanId);
      setScans(scans.filter(scan => scan.id !== scanId));
      setSuccess('Document supprimé avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la suppression du document');
      console.error(err);
    }
  };

  const getDocumentTypeLabel = (type) => {
    const types = {
      carte_grise: 'Carte Grise',
      pv: 'Procès-Verbal',
      permis: 'Permis de Conduire',
      assurance: 'Attestation d\'Assurance',
      autre: 'Autre Document'
    };
    return types[type] || type;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestion des Documents</h1>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-5 h-5 inline mr-2" />
            Upload
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'ocr'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-5 h-5 inline mr-2" />
            OCR
          </button>
          <button
            onClick={() => setActiveTab('qrcode')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'qrcode'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <QrCode className="w-5 h-5 inline mr-2" />
            QR Code
          </button>
          <button
            onClick={() => setActiveTab('myDocuments')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'myDocuments'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            Mes Documents
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Uploader un document</h2>
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Type de document
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="carte_grise">Carte Grise</option>
                  <option value="pv">Procès-Verbal</option>
                  <option value="permis">Permis de Conduire</option>
                  <option value="assurance">Attestation d'Assurance</option>
                  <option value="autre">Autre Document</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Fichier (Image ou PDF)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Upload en cours...' : 'Uploader le document'}
              </button>
            </form>
          </div>
        )}

        {/* OCR Tab */}
        {activeTab === 'ocr' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Reconnaissance OCR</h2>
            <form onSubmit={handleOCR}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Type de document
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="carte_grise">Carte Grise</option>
                  <option value="pv">Procès-Verbal</option>
                  <option value="texte">Texte Générique</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Image du document
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyse en cours...' : 'Analyser le document'}
              </button>
            </form>

            {/* OCR Results */}
            {ocrResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Résultats de l'analyse</h3>
                {ocrResult.data && (
                  <div className="space-y-2">
                    {Object.entries(ocrResult.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium text-gray-700">{key}:</span>
                        <span className="text-gray-900">{value || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                )}
                {ocrResult.text && (
                  <div className="mt-3">
                    <p className="font-medium text-gray-700 mb-2">Texte extrait:</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{ocrResult.text}</p>
                  </div>
                )}
                <p className="mt-3 text-sm text-gray-600">
                  Confiance: {ocrResult.confidence ? `${ocrResult.confidence.toFixed(2)}%` : 'N/A'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* QR Code Tab */}
        {activeTab === 'qrcode' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Lecture de QR Code</h2>
            <form onSubmit={handleReadQRCode}>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Image contenant un QR Code
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Lecture en cours...' : 'Lire le QR Code'}
              </button>
            </form>

            {/* QR Code Results */}
            {qrCodeResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Contenu du QR Code</h3>
                {qrCodeResult.data ? (
                  <div className="space-y-2">
                    {typeof qrCodeResult.data === 'object' ? (
                      Object.entries(qrCodeResult.data).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium text-gray-700">{key}:</span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-900">{qrCodeResult.data}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900">{qrCodeResult.rawData}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* My Documents Tab */}
        {activeTab === 'myDocuments' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Mes Documents</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement...</p>
              </div>
            ) : scans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Aucun document trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scans.map((scan) => (
                  <div key={scan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getDocumentTypeLabel(scan.document_type)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(scan.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteScan(scan.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {scan.file_path && (
                      <div className="mb-3">
                        <img
                          src={`http://localhost:8004${scan.file_path}`}
                          alt={scan.document_type}
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <a
                        href={`http://localhost:8004${scan.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        Voir
                      </a>
                      <a
                        href={`http://localhost:8004${scan.file_path}`}
                        download
                        className="flex-1 bg-gray-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-gray-700 transition-colors text-center"
                      >
                        <Download className="w-4 h-4 inline mr-1" />
                        Télécharger
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Documents;
