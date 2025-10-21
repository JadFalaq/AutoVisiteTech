const http = require('http');

// Test du service de paiement
async function testPaymentService() {
  console.log('💳 Test du service de paiement');
  console.log('================================');

  // Test 1: Health check
  try {
    console.log('\n1️⃣ Test du health check...');
    const healthResponse = await makeRequest('GET', 'localhost', 8002, '/health');
    console.log('✅ Health check OK:', JSON.parse(healthResponse));
  } catch (error) {
    console.log('❌ Health check KO:', error.message);
    return;
  }

  // Test 2: Créer un Payment Intent
  try {
    console.log('\n2️⃣ Test création Payment Intent...');
    const paymentData = {
      amount: 50.00,
      user_id: 1,
      description: 'Test paiement AutoVisiteTech'
    };

    const paymentResponse = await makeRequest('POST', 'localhost', 8002, '/api/payments/create-payment-intent', paymentData);
    const paymentResult = JSON.parse(paymentResponse);
    console.log('✅ Payment Intent créé:', paymentResult);
    
    return paymentResult;
  } catch (error) {
    console.log('❌ Erreur création Payment Intent:', error.message);
  }
}

// Fonction utilitaire pour faire des requêtes HTTP
function makeRequest(method, hostname, port, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname,
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

testPaymentService().catch(console.error);
