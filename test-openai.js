const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    console.log('🧪 Test de la clé OpenAI...');
    
    // Test simple
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Dis bonjour en français' }
      ],
      max_tokens: 50
    });

    console.log('✅ Succès ! Réponse OpenAI:');
    console.log(completion.choices[0].message.content);
    console.log('💰 Tokens utilisés:', completion.usage.total_tokens);
    
  } catch (error) {
    console.error('❌ Erreur OpenAI:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Type:', error.type);
  }
}

testOpenAI();
