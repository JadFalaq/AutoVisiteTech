const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8006;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'chatbot-service', timestamp: new Date() });
});

app.post('/api/chat', (req, res) => {
  res.json({ message: 'Chatbot service is running', response: 'Bonjour! Comment puis-je vous aider?' });
});

app.listen(PORT, () => {
  console.log(`🤖 Chatbot Service running on port ${PORT}`);
});
