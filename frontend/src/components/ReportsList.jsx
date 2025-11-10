import { useState, useEffect } from 'react';
import { 
  getAllReports, 
  downloadReport, 
  resendReportEmail, 
  deleteReport,
  formatReportStatus,
  formatReportType 
} from '../services/reportService';

/**
 * Composant pour afficher la liste des rapports
 */
const ReportsList = ({ userId, inspectionId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [emailData, setEmailData] = useState({ email: '', name: '' });
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    loadReports();
  }, [userId, inspectionId]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (userId) filters.user_id = userId;
      if (inspectionId) filters.inspection_id = inspectionId;
      
      const data = await getAllReports(filters);
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (report) => {
    const url = downloadReport(report.file_name);
    window.open(url, '_blank');
  };

  const handleResendEmail = async () => {
    try {
      await resendReportEmail(selectedReport.id, emailData);
      alert('Email envoyé avec succès !');
      setShowEmailModal(false);
      setEmailData({ email: '', name: '' });
    } catch (err) {
      alert('Erreur lors de l\'envoi de l\'email: ' + err.message);
    }
  };

  const handleDelete = async (reportId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;
    
    try {
      await deleteReport(reportId);
      alert('Rapport supprimé avec succès !');
      loadReports();
    } catch (err) {
      alert('Erreur lors de la suppression: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Erreur</p>
        <p>{error}</p>
        <button 
          onClick={loadReports}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Mes Rapports ({reports.length})
        </h2>
        <button
          onClick={loadReports}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          🔄 Actualiser
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Aucun rapport disponible</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => {
            const status = formatReportStatus(report.status);
            const type = formatReportType(report.report_type);
            
            return (
              <div 
                key={report.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {type}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        status.color === 'success' ? 'bg-green-100 text-green-800' :
                        status.color === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        status.color === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Inspection:</span> #{report.inspection_id}
                      </div>
                      <div>
                        <span className="font-medium">Fichier:</span> {report.file_name}
                      </div>
                      <div>
                        <span className="font-medium">Généré le:</span>{' '}
                        {new Date(report.generated_at || report.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleDownload(report)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
                      title="Télécharger le PDF"
                    >
                      📄 Télécharger
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowEmailModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2"
                      title="Envoyer par email"
                    >
                      📧 Email
                    </button>
                    
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal d'envoi d'email */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Envoyer par email</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email du destinataire
                </label>
                <input
                  type="email"
                  value={emailData.email}
                  onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="exemple@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du destinataire
                </label>
                <input
                  type="text"
                  value={emailData.name}
                  onChange={(e) => setEmailData({ ...emailData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jean Dupont"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleResendEmail}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                disabled={!emailData.email || !emailData.name}
              >
                Envoyer
              </button>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailData({ email: '', name: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsList;
