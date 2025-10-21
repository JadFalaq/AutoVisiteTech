// Script pour tester la connexion directement via le service auth
const http = require('http');

const postData = JSON.stringify({
  email: 'test@example.com',
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 8001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🔐 Test de connexion directement via le service auth...');

const req = http.request(options, (res) => {
  console.log(`📥 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📥 Response:', data);
    if (res.statusCode === 200) {
      console.log('✅ Connexion réussie directement via le service auth');
    } else {
      console.log('❌ Connexion échouée');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erreur:', e.message);
});

req.write(postData);
req.end();
