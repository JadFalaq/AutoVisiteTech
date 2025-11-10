import { useState, useEffect } from 'react';
import { 
  getAllInvoices,
  getOverdueInvoices,
  downloadInvoice,
  updateInvoiceStatus,
  sendPaymentReminder,
  resendInvoiceEmail,
  formatInvoiceStatus,
  isInvoiceOverdue,
  getDaysOverdue
} from '../services/reportService';

/**
 * Composant pour afficher la liste des factures
 */
const InvoicesList = ({ userId, showOverdueOnly = false }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [emailData, setEmailData] = useState({ email: '', name: '' });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailType, setEmailType] = useState('resend'); // 'resend' or 'reminder'

  useEffect(() => {
    loadInvoices();
  }, [userId, showOverdueOnly]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (showOverdueOnly) {
        data = await getOverdueInvoices();
      } else {
        const filters = {};
        if (userId) filters.user_id = userId;
        data = await getAllInvoices(filters);
      }
      
      setInvoices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (invoice) => {
    const url = downloadInvoice(invoice.file_name || `${invoice.invoice_number}.pdf`);
    window.open(url, '_blank');
  };

  const handleMarkAsPaid = async (invoiceId) => {
    if (!confirm('Marquer cette facture comme payée ?')) return;
    
    try {
      await updateInvoiceStatus(invoiceId, { status: 'paid' });
      alert('Facture marquée comme payée !');
      loadInvoices();
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const handleSendEmail = async () => {
    try {
      if (emailType === 'reminder') {
        await sendPaymentReminder(selectedInvoice.id, emailData);
        alert('Rappel de paiement envoyé !');
      } else {
        await resendInvoiceEmail(selectedInvoice.id, emailData);
        alert('Facture renvoyée par email !');
      }
      setShowEmailModal(false);
      setEmailData({ email: '', name: '' });
    } catch (err) {
      alert('Erreur lors de l\'envoi: ' + err.message);
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
          onClick={loadInvoices}
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
          {showOverdueOnly ? 'Factures en retard' : 'Mes Factures'} ({invoices.length})
        </h2>
        <button
          onClick={loadInvoices}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          🔄 Actualiser
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            {showOverdueOnly ? 'Aucune facture en retard' : 'Aucune facture disponible'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => {
            const status = formatInvoiceStatus(invoice.status);
            const overdue = isInvoiceOverdue(invoice.due_date, invoice.status);
            const daysOverdue = getDaysOverdue(invoice.due_date);
            
            return (
              <div 
                key={invoice.id}
                className={`bg-white border rounded-lg p-6 hover:shadow-lg transition ${
                  overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {invoice.invoice_number}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        status.color === 'success' ? 'bg-green-100 text-green-800' :
                        status.color === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        status.color === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status.label}
                      </span>
                      {overdue && (
                        <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium">
                          ⚠️ {daysOverdue} jour{daysOverdue > 1 ? 's' : ''} de retard
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <span className="text-sm text-gray-600">Montant HT:</span>
                        <p className="text-lg font-semibold text-gray-800">
                          {invoice.amount.toFixed(2)} €
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">TVA:</span>
                        <p className="text-lg font-semibold text-gray-800">
                          {invoice.tax_amount.toFixed(2)} €
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Total TTC:</span>
                        <p className="text-2xl font-bold text-blue-600">
                          {invoice.total_amount.toFixed(2)} €
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Échéance:</span>
                        <p className={`text-lg font-semibold ${overdue ? 'text-red-600' : 'text-gray-800'}`}>
                          {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    {invoice.paid_at && (
                      <div className="mt-3 text-sm text-green-600">
                        ✅ Payée le {new Date(invoice.paid_at).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleDownload(invoice)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
                      title="Télécharger le PDF"
                    >
                      📄 Télécharger
                    </button>
                    
                    {invoice.status !== 'paid' && (
                      <>
                        <button
                          onClick={() => handleMarkAsPaid(invoice.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2"
                          title="Marquer comme payée"
                        >
                          ✅ Payée
                        </button>
                        
                        {overdue && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setEmailType('reminder');
                              setShowEmailModal(true);
                            }}
                            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition flex items-center gap-2"
                            title="Envoyer un rappel"
                          >
                            ⚠️ Rappel
                          </button>
                        )}
                      </>
                    )}
                    
                    <button
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setEmailType('resend');
                        setShowEmailModal(true);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition flex items-center gap-2"
                      title="Renvoyer par email"
                    >
                      📧 Email
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
            <h3 className="text-xl font-bold mb-4">
              {emailType === 'reminder' ? 'Envoyer un rappel de paiement' : 'Renvoyer la facture'}
            </h3>
            
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
                onClick={handleSendEmail}
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

export default InvoicesList;
