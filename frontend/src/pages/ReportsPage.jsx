import { useState } from 'react';
import ReportsList from '../components/ReportsList';
import InvoicesList from '../components/InvoicesList';

/**
 * Page principale pour gérer les rapports et factures
 */
const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'invoices'
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Récupérer l'ID utilisateur depuis le contexte ou localStorage
  // Pour l'exemple, on utilise une valeur par défaut
  const userId = localStorage.getItem('userId') || null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            📄 Mes Documents
          </h1>
          <p className="mt-2 text-gray-600">
            Gérez vos rapports de contrôle technique et vos factures
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('reports')}
              className={`${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
            >
              📄 Rapports de contrôle
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`${
                activeTab === 'invoices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
            >
              💰 Factures
            </button>
          </nav>
        </div>

        {/* Filters for invoices */}
        {activeTab === 'invoices' && (
          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOverdueOnly}
                onChange={(e) => setShowOverdueOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Afficher uniquement les factures en retard
              </span>
            </label>
          </div>
        )}

        {/* Content */}
        <div className="mt-6 pb-12">
          {activeTab === 'reports' ? (
            <ReportsList userId={userId} />
          ) : (
            <InvoicesList userId={userId} showOverdueOnly={showOverdueOnly} />
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            ℹ️ Informations
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Les rapports de contrôle technique sont générés automatiquement après chaque inspection</li>
            <li>• Vous pouvez télécharger vos documents au format PDF à tout moment</li>
            <li>• Les factures peuvent être renvoyées par email si nécessaire</li>
            <li>• Un rappel automatique est envoyé pour les factures en retard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
