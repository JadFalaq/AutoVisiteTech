const fetch = require('node-fetch');

async function testLogin() {
  console.log('🔧 Test de diagnostic de connexion');
  console.log('================================');
  
  // Test 1: Health check de l'API Gateway
  try {
    console.log('\n1️⃣ Test du health check API Gateway...');
    const healthResponse = await fetch('http://localhost:8000/health');
    const healthData = await healthResponse.json();
    console.log('✅ API Gateway OK:', healthData);
  } catch (error) {
    console.log('❌ API Gateway KO:', error.message);
    return;
  }
  
  // Test 2: Status des services
  try {
    console.log('\n2️⃣ Test du status des services...');
    const statusResponse = await fetch('http://localhost:8000/api/status');
    const statusData = await statusResponse.json();
    console.log('📊 Status des services:', statusData);
  } catch (error) {
    console.log('❌ Status des services KO:', error.message);
  }
  
  // Test 3: Test de connexion avec des identifiants de test
  try {
    console.log('\n3️⃣ Test de connexion...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    console.log('📤 Envoi de la requête de connexion...');
    const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('📥 Status de la réponse:', loginResponse.status);
    console.log('📥 Headers de la réponse:', Object.fromEntries(loginResponse.headers));
    
    const responseText = await loginResponse.text();
    console.log('📥 Contenu de la réponse:', responseText);
    
    if (loginResponse.ok) {
      const loginResult = JSON.parse(responseText);
      console.log('✅ Connexion réussie:', loginResult);
    } else {
      console.log('❌ Connexion échouée');
    }
    
  } catch (error) {
    console.log('❌ Erreur lors du test de connexion:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

testLogin().catch(console.error);
