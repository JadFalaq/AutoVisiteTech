// Script pour créer un utilisateur directement via l'API auth
const http = require('http');

const postData = JSON.stringify({
  email: 'test@example.com',
  password: 'password123',
  nom: 'Test',
  prenom: 'User'
});

const options = {
  hostname: 'localhost',
  port: 8001,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('👤 Création d\'un utilisateur de test directement via le service auth...');

const req = http.request(options, (res) => {
  console.log(`📥 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📥 Response:', data);
    if (res.statusCode === 201) {
      console.log('✅ Utilisateur créé avec succès');
    } else {
      console.log('ℹ️ L\'utilisateur existe peut-être déjà');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erreur:', e.message);
});

req.write(postData);
req.end();
