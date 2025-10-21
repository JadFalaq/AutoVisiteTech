const express = require('express');
const ChatController = require('../controllers/chatController');

function createChatRoutes(pool) {
  const router = express.Router();
  const chatController = new ChatController(pool);

  // Endpoint principal pour le chat - L'API Gateway envoie /api/chat
  router.post('/api/chat', (req, res) => chatController.handleChat(req, res));

  // Récupérer l'historique des conversations
  router.get('/chat/history', (req, res) => chatController.getConversationHistory(req, res));

  // Supprimer l'historique d'une session
  router.delete('/chat/history/:session_id', (req, res) => chatController.clearConversationHistory(req, res));

  // Statistiques du chatbot (pour l'admin)
  router.get('/chat/stats', (req, res) => chatController.getStats(req, res));

  // Test de connectivité du chatbot
  router.get('/chat/test', async (req, res) => {
    try {
      const testMessage = "Bonjour, pouvez-vous me donner vos horaires ?";
      
      // Simuler une requête de test
      const testReq = {
        body: {
          message: testMessage,
          session_id: `test_${Date.now()}`
        }
      };

      const testRes = {
        json: (data) => res.json({
          test_status: 'success',
          test_message: testMessage,
          test_response: data
        }),
        status: (code) => ({
          json: (data) => res.status(code).json({
            test_status: 'error',
            test_message: testMessage,
            error: data
          })
        })
      };

      await chatController.handleChat(testReq, testRes);
    } catch (error) {
      res.status(500).json({
        test_status: 'error',
        error: error.message
      });
    }
  });

  return router;
}

module.exports = createChatRoutes;
