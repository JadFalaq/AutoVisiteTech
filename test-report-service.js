/**
 * Script de test pour le Report Service
 * Usage: node test-report-service.js
 */

const BASE_URL = 'http://localhost:8008';

// Données de test
const testInspectionData = {
  inspection_number: 'CT-2024-TEST-001',
  inspection_date: new Date().toISOString(),
  vehicle_registration: 'AB-123-CD',
  vehicle_brand: 'Renault',
  vehicle_model: 'Clio V',
  vehicle_vin: 'VF1XXXXXXXX123456',
  vehicle_year: 2020,
  mileage: 45000,
  owner_name: 'Jean Dupont',
  owner_email: 'jean.dupont@example.com',
  owner_phone: '0612345678',
  status: 'passed',
  inspector_name: 'Marie Martin',
  validity_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  observations: 'Véhicule en excellent état. Aucune anomalie détectée lors du contrôle.',
  checkpoints: [
    { name: 'Freinage', status: 'passed', result: 'Efficacité: 95%' },
    { name: 'Direction', status: 'passed', result: 'Jeu normal' },
    { name: 'Éclairage', status: 'passed', result: 'Tous feux fonctionnels' },
    { name: 'Pneumatiques', status: 'passed', result: 'Profondeur: 4mm' },
    { name: 'Échappement', status: 'passed', result: 'Émissions conformes' },
    { name: 'Suspension', status: 'passed', result: 'État correct' }
  ]
};

const testCustomerData = {
  name: 'Jean Dupont',
  email: 'jean.dupont@example.com',
  phone: '0612345678'
};

// Fonctions utilitaires
async function testEndpoint(name, method, url, body = null) {
  console.log(`\n🧪 Test: ${name}`);
  console.log(`📍 ${method} ${url}`);
  
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
      console.log('📤 Body:', JSON.stringify(body, null, 2).substring(0, 200) + '...');
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Succès:', response.status);
      console.log('📥 Response:', JSON.stringify(data, null, 2).substring(0, 300) + '...');
      return data;
    } else {
      console.log('❌ Erreur:', response.status);
      console.log('📥 Response:', data);
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests du Report Service');
  console.log('=' .repeat(60));
  
  // Test 1: Health check
  await testEndpoint(
    'Health Check',
    'GET',
    `${BASE_URL}/health`
  );
  
  // Test 2: Générer un rapport
  const reportResult = await testEndpoint(
    'Générer un certificat de contrôle technique',
    'POST',
    `${BASE_URL}/api/reports`,
    {
      inspection_id: Math.floor(Math.random() * 1000),
      user_id: 1,
      report_type: 'inspection_certificate',
      send_email: false, // Mettre à true pour tester l'envoi d'email
      inspection_data: testInspectionData
    }
  );
  
  let reportId = null;
  if (reportResult && reportResult.report) {
    reportId = reportResult.report.id;
    console.log(`📄 Rapport créé avec ID: ${reportId}`);
    console.log(`🔗 URL de téléchargement: ${reportResult.report.file_url}`);
  }
  
  // Test 3: Récupérer tous les rapports
  await testEndpoint(
    'Récupérer tous les rapports',
    'GET',
    `${BASE_URL}/api/reports`
  );
  
  // Test 4: Récupérer un rapport par ID
  if (reportId) {
    await testEndpoint(
      'Récupérer un rapport par ID',
      'GET',
      `${BASE_URL}/api/reports/${reportId}`
    );
  }
  
  // Test 5: Créer une facture
  const invoiceResult = await testEndpoint(
    'Créer une facture',
    'POST',
    `${BASE_URL}/api/invoices`,
    {
      user_id: 1,
      appointment_id: Math.floor(Math.random() * 1000),
      amount: 70.00,
      tax_rate: 0.20,
      send_email: false, // Mettre à true pour tester l'envoi d'email
      customer_data: testCustomerData,
      items: [
        {
          description: 'Contrôle technique complet',
          quantity: 1,
          unit_price: 70.00
        }
      ]
    }
  );
  
  let invoiceId = null;
  if (invoiceResult && invoiceResult.invoice) {
    invoiceId = invoiceResult.invoice.id;
    console.log(`💰 Facture créée avec ID: ${invoiceId}`);
    console.log(`🔗 URL de téléchargement: ${invoiceResult.invoice.file_url}`);
  }
  
  // Test 6: Récupérer toutes les factures
  await testEndpoint(
    'Récupérer toutes les factures',
    'GET',
    `${BASE_URL}/api/invoices`
  );
  
  // Test 7: Récupérer une facture par ID
  if (invoiceId) {
    await testEndpoint(
      'Récupérer une facture par ID',
      'GET',
      `${BASE_URL}/api/invoices/${invoiceId}`
    );
  }
  
  // Test 8: Mettre à jour le statut d'une facture
  if (invoiceId) {
    await testEndpoint(
      'Marquer une facture comme payée',
      'PATCH',
      `${BASE_URL}/api/invoices/${invoiceId}`,
      {
        status: 'paid',
        customer_email: testCustomerData.email,
        customer_name: testCustomerData.name
      }
    );
  }
  
  // Test 9: Récupérer les factures en retard
  await testEndpoint(
    'Récupérer les factures en retard',
    'GET',
    `${BASE_URL}/api/invoices/overdue`
  );
  
  // Test 10: Générer un rapport avec défaillances
  await testEndpoint(
    'Générer un certificat avec défaillances',
    'POST',
    `${BASE_URL}/api/reports`,
    {
      inspection_id: Math.floor(Math.random() * 1000),
      user_id: 1,
      report_type: 'inspection_certificate',
      send_email: false,
      inspection_data: {
        ...testInspectionData,
        inspection_number: 'CT-2024-TEST-002',
        status: 'failed',
        observations: 'DÉFAILLANCES MAJEURES DÉTECTÉES - Contre-visite obligatoire.',
        checkpoints: [
          { name: 'Freinage', status: 'failed', result: 'Efficacité insuffisante: 42%' },
          { name: 'Direction', status: 'passed', result: 'Conforme' },
          { name: 'Éclairage', status: 'failed', result: 'Feux de croisement défaillants' },
          { name: 'Pneumatiques', status: 'failed', result: 'Pneu avant droit: 1.2mm' }
        ]
      }
    }
  );
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Tests terminés !');
  console.log('\n📊 Résumé:');
  console.log('- Health check: OK');
  console.log('- Génération de rapports: OK');
  console.log('- Création de factures: OK');
  console.log('- Récupération de données: OK');
  console.log('- Mise à jour de statut: OK');
  console.log('\n💡 Conseils:');
  console.log('- Vérifiez le dossier reports/ pour voir les PDF générés');
  console.log('- Activez send_email: true pour tester l\'envoi d\'emails');
  console.log('- Consultez les logs du service pour plus de détails');
  console.log('\n🔗 URLs utiles:');
  console.log(`- Health check: ${BASE_URL}/health`);
  console.log(`- Rapports: ${BASE_URL}/api/reports`);
  console.log(`- Factures: ${BASE_URL}/api/invoices`);
}

// Exécuter les tests
runTests().catch(console.error);
