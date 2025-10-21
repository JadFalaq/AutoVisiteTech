const http = require('http');

// Test de réservation via l'API Gateway
async function testReservationViaGateway() {
  console.log('📅 Test de réservation via API Gateway');
  console.log('=====================================');

  // Test 1: Health check API Gateway
  try {
    console.log('\n1️⃣ Test du health check API Gateway...');
    const healthResponse = await makeRequest('GET', 'localhost', 8000, '/health');
    console.log('✅ API Gateway OK:', JSON.parse(healthResponse));
  } catch (error) {
    console.log('❌ API Gateway KO:', error.message);
    return;
  }

  // Test 2: Créer un rendez-vous via API Gateway
  try {
    console.log('\n2️⃣ Test création de rendez-vous via API Gateway...');
    const appointmentData = {
      user_id: 1,
      vehicle_registration: 'TEST-123-45',
      vehicle_brand: 'Renault',
      vehicle_model: 'Clio',
      vehicle_year: 2020,
      centre_name: 'Centre Casablanca - Maarif',
      appointment_date: '2025-10-25',
      appointment_time: '10:00',
      service_type: 'controle',
      notes: 'Test via API Gateway'
    };

    console.log('📤 Données envoyées:', appointmentData);
    
    const appointmentResponse = await makeRequest('POST', 'localhost', 8000, '/api/appointments', appointmentData);
    const appointmentResult = JSON.parse(appointmentResponse);
    console.log('✅ Rendez-vous créé via API Gateway:', appointmentResult);
    
    return appointmentResult;
  } catch (error) {
    console.log('❌ Erreur création rendez-vous via API Gateway:', error.message);
    
    // Test direct au service appointment
    console.log('\n🔄 Test direct au service appointment...');
    try {
      const directResponse = await makeRequest('POST', 'localhost', 8003, '/api/appointments', {
        user_id: 1,
        vehicle_registration: 'DIRECT-123',
        vehicle_brand: 'Test',
        vehicle_model: 'Direct',
        vehicle_year: 2020,
        centre_name: 'Test Centre',
        appointment_date: '2025-10-25',
        appointment_time: '11:00',
        service_type: 'controle',
        notes: 'Test direct'
      });
      console.log('✅ Service appointment direct OK:', JSON.parse(directResponse));
    } catch (directError) {
      console.log('❌ Service appointment direct KO:', directError.message);
    }
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
      },
      timeout: 10000 // 10 secondes de timeout
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`📥 Status: ${res.statusCode}`);
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

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

testReservationViaGateway().catch(console.error);
