// Script pour tester la connexion via l'API Gateway
const http = require('http');

const postData = JSON.stringify({
  email: 'test@example.com',
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 15000 // 15 secondes de timeout
};

console.log('🔐 Test de connexion via l\'API Gateway...');

const req = http.request(options, (res) => {
  console.log(`📥 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📥 Response:', data);
    if (res.statusCode === 200) {
      console.log('✅ Connexion réussie via l\'API Gateway');
    } else {
      console.log('❌ Connexion échouée via l\'API Gateway');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erreur:', e.message);
});

req.on('timeout', () => {
  console.error('❌ Timeout de la requête');
  req.destroy();
});

req.write(postData);
req.end();
