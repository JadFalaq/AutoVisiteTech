const http = require('http');

// Test du service de rendez-vous
async function testAppointmentService() {
  console.log('📅 Test du service de rendez-vous');
  console.log('==================================');

  // Test 1: Health check
  try {
    console.log('\n1️⃣ Test du health check...');
    const healthResponse = await makeRequest('GET', 'localhost', 8003, '/health');
    console.log('✅ Health check OK:', JSON.parse(healthResponse));
  } catch (error) {
    console.log('❌ Health check KO:', error.message);
    return;
  }

  // Test 2: Créer un rendez-vous
  try {
    console.log('\n2️⃣ Test création de rendez-vous...');
    const appointmentData = {
      user_id: 1,
      vehicle_registration: 'ABC-123-45',
      vehicle_brand: 'Renault',
      vehicle_model: 'Clio',
      vehicle_year: 2020,
      centre_name: 'Centre Casablanca - Maarif',
      appointment_date: '2025-10-25',
      appointment_time: '10:00',
      service_type: 'controle',
      notes: 'Test de réservation'
    };

    const appointmentResponse = await makeRequest('POST', 'localhost', 8003, '/api/appointments', appointmentData);
    const appointmentResult = JSON.parse(appointmentResponse);
    console.log('✅ Rendez-vous créé:', appointmentResult);
    
    return appointmentResult;
  } catch (error) {
    console.log('❌ Erreur création rendez-vous:', error.message);
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

testAppointmentService().catch(console.error);
