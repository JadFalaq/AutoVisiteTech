import { useState, useEffect } from 'react';

/**
 * Version simplifiée pour déboguer
 */
const ReportsPageSimple = () => {
  const [reports, setReports] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');

  const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000';

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = activeTab === 'reports' ? '/api/reports' : '/api/invoices';
      console.log('Fetching from:', API_URL + endpoint);
      
      const response = await fetch(API_URL + endpoint);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Data received:', data);
      
      if (activeTab === 'reports') {
        setReports(data);
      } else {
        setInvoices(data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (item) => {
    const filename = item.file_name || `${item.invoice_number}.pdf`;
    const url = `${API_URL}/api/${activeTab === 'reports' ? 'reports' : 'invoices'}/download/${filename}`;
    console.log('Download URL:', url);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            📄 Rapports & Factures
          </h1>
          <p className="mt-2 text-gray-600">
            Version simplifiée pour déboguer
          </p>
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">🔍 Debug Info</h3>
          <p className="text-sm text-yellow-800">API URL: {API_URL}</p>
          <p className="text-sm text-yellow-800">Active Tab: {activeTab}</p>
          <p className="text-sm text-yellow-800">Loading: {loading ? 'Yes' : 'No'}</p>
          <p className="text-sm text-yellow-800">Error: {error || 'None'}</p>
          <p className="text-sm text-yellow-800">
            Items: {activeTab === 'reports' ? reports.length : invoices.length}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📄 Rapports ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'invoices'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                💰 Factures ({invoices.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            <button
              onClick={loadData}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              🔄 Actualiser
            </button>

            {/* Loading */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Chargement...</span>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="font-bold">❌ Erreur</p>
                <p>{error}</p>
                <button 
                  onClick={loadData}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Réessayer
                </button>
              </div>
            )}

            {/* Content - Reports */}
            {!loading && !error && activeTab === 'reports' && (
              <div>
                {reports.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">Aucun rapport disponible</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Générez des données de test avec: <code className="bg-gray-200 px-2 py-1 rounded">node test-report-service.js</code>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div 
                        key={report.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">
                              Rapport #{report.id}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Inspection: #{report.inspection_id}
                            </p>
                            <p className="text-sm text-gray-600">
                              Type: {report.report_type}
                            </p>
                            <p className="text-sm text-gray-600">
                              Statut: {report.status}
                            </p>
                            <p className="text-sm text-gray-600">
                              Créé: {new Date(report.created_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDownload(report)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                          >
                            📄 Télécharger
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content - Invoices */}
            {!loading && !error && activeTab === 'invoices' && (
              <div>
                {invoices.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">Aucune facture disponible</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Générez des données de test avec: <code className="bg-gray-200 px-2 py-1 rounded">node test-report-service.js</code>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div 
                        key={invoice.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {invoice.invoice_number}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Montant: {invoice.total_amount?.toFixed(2)} €
                            </p>
                            <p className="text-sm text-gray-600">
                              Statut: {invoice.status}
                            </p>
                            <p className="text-sm text-gray-600">
                              Échéance: {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                            </p>
                            <p className="text-sm text-gray-600">
                              Créé: {new Date(invoice.created_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDownload(invoice)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                          >
                            📄 Télécharger
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">🧪 Tests rapides</h3>
          <div className="space-y-2">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${API_URL}/health`);
                  const data = await response.json();
                  alert('API Gateway OK: ' + JSON.stringify(data, null, 2));
                } catch (err) {
                  alert('Erreur API Gateway: ' + err.message);
                }
              }}
              className="block w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
            >
              ✅ Tester API Gateway
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${API_URL}/api/reports`);
                  const data = await response.json();
                  alert('Reports API OK: ' + data.length + ' rapports');
                  console.log('Reports:', data);
                } catch (err) {
                  alert('Erreur Reports API: ' + err.message);
                }
              }}
              className="block w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
            >
              📄 Tester API Reports
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${API_URL}/api/invoices`);
                  const data = await response.json();
                  alert('Invoices API OK: ' + data.length + ' factures');
                  console.log('Invoices:', data);
                } catch (err) {
                  alert('Erreur Invoices API: ' + err.message);
                }
              }}
              className="block w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
            >
              💰 Tester API Invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPageSimple;
