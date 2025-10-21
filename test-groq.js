const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function testGroq() {
  try {
    console.log('🧪 Test de la clé Groq...');
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'user', content: 'Dis bonjour en français' }
      ],
      max_tokens: 50
    });

    console.log('✅ Succès ! Réponse Groq:');
    console.log(completion.choices[0].message.content);
    console.log('💰 Tokens utilisés:', completion.usage.total_tokens);
    
  } catch (error) {
    console.error('❌ Erreur Groq:');
    console.error('Message:', error.message);
    console.error('Status:', error.status);
  }
}

testGroq();
