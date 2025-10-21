const fetch = require('node-fetch');

async function createTestUser() {
  console.log('👤 Création d\'un utilisateur de test...');
  
  try {
    const response = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'User',
        telephone: '0123456789'
      })
    });
    
    const data = await response.text();
    console.log('📥 Status:', response.status);
    console.log('📥 Response:', data);
    
    if (response.ok) {
      console.log('✅ Utilisateur de test créé avec succès');
    } else {
      console.log('ℹ️ L\'utilisateur existe peut-être déjà');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createTestUser();
