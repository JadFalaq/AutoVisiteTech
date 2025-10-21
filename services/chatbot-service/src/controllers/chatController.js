const MultiLLMService = require('../services/multiLlmService');

class ChatController {
  constructor(pool) {
    this.pool = pool;
    this.llmService = new MultiLLMService();
    this.isLLMAvailable = false;
    
    // Vérifier la disponibilité du service LLM au démarrage
    this.checkLLMAvailability();
  }

  async checkLLMAvailability() {
    this.isLLMAvailable = await this.llmService.isServiceAvailable();
    console.log(`🤖 Service LLM: ${this.isLLMAvailable !== 'fallback' ? `Disponible (${this.isLLMAvailable.toUpperCase()})` : 'Mode fallback'}`);
  }

  async handleChat(req, res) {
    try {
      const { message, user_id, session_id } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message requis' });
      }

      // Générer un session_id si non fourni
      const actualSessionId = session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Récupérer l'historique récent pour le contexte
      const conversationHistory = await this.getRecentHistory(user_id, actualSessionId);

      let response, intent, tokens_used, model;

      if (this.isLLMAvailable) {
        // Utiliser le LLM
        const llmResult = await this.llmService.generateResponse(message, conversationHistory);
        response = llmResult.response;
        tokens_used = llmResult.tokens_used;
        model = llmResult.model;
        intent = 'llm_generated';
      } else {
        // Utiliser le fallback
        const fallbackResult = this.llmService.getFallbackResponse(message);
        response = fallbackResult;
        intent = this.detectIntent(message);
        tokens_used = 0;
        model = 'fallback';
      }

      // Sauvegarder la conversation
      await this.saveConversation(user_id, actualSessionId, message, response, intent, tokens_used);

      res.json({
        message: 'Réponse générée',
        response,
        intent,
        session_id: actualSessionId,
        model,
        tokens_used,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Erreur dans handleChat:', error);
      res.status(500).json({ 
        error: 'Erreur lors du traitement du message', 
        details: error.message 
      });
    }
  }

  async getRecentHistory(user_id, session_id, limit = 5) {
    try {
      let query, params;

      if (user_id && session_id) {
        query = `SELECT message, response FROM conversations 
                 WHERE user_id = $1 AND session_id = $2 
                 ORDER BY created_at DESC LIMIT $3`;
        params = [user_id, session_id, limit];
      } else if (session_id) {
        query = `SELECT message, response FROM conversations 
                 WHERE session_id = $1 
                 ORDER BY created_at DESC LIMIT $2`;
        params = [session_id, limit];
      } else {
        return [];
      }

      const result = await this.pool.query(query, params);
      return result.rows.reverse(); // Inverser pour avoir l'ordre chronologique
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  async saveConversation(user_id, session_id, message, response, intent, tokens_used = 0) {
    try {
      await this.pool.query(
        `INSERT INTO conversations (user_id, session_id, message, response, intent, tokens_used) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user_id, session_id, message, response, intent, tokens_used]
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // Ne pas faire échouer la requête si la sauvegarde échoue
    }
  }

  detectIntent(message) {
    const msg = message.toLowerCase();
    
    if (msg.match(/bonjour|salut|hello|hey/)) return 'greeting';
    if (msg.match(/rendez-vous|réservation|rdv|appointment/)) return 'appointment';
    if (msg.match(/prix|tarif|coût|combien/)) return 'price';
    if (msg.match(/document|papier|carte grise/)) return 'documents';
    if (msg.match(/horaire|heure|ouvert|fermé/)) return 'hours';
    if (msg.match(/contact|téléphone|adresse|email/)) return 'contact';
    
    return 'general';
  }

  async getConversationHistory(req, res) {
    try {
      const { user_id, session_id, limit = 50 } = req.query;

      if (!user_id && !session_id) {
        return res.status(400).json({ error: 'user_id ou session_id requis' });
      }

      let query = 'SELECT * FROM conversations WHERE ';
      let params = [];

      if (user_id && session_id) {
        query += 'user_id = $1 AND session_id = $2 ORDER BY created_at ASC LIMIT $3';
        params = [user_id, session_id, limit];
      } else if (user_id) {
        query += 'user_id = $1 ORDER BY created_at DESC LIMIT $2';
        params = [user_id, limit];
      } else {
        query += 'session_id = $1 ORDER BY created_at ASC LIMIT $2';
        params = [session_id, limit];
      }

      const result = await this.pool.query(query, params);
      res.json({
        conversations: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération de l\'historique', 
        details: error.message 
      });
    }
  }

  async clearConversationHistory(req, res) {
    try {
      const { session_id } = req.params;
      const { user_id } = req.query;

      let query, params;

      if (user_id) {
        query = 'DELETE FROM conversations WHERE session_id = $1 AND user_id = $2 RETURNING *';
        params = [session_id, user_id];
      } else {
        query = 'DELETE FROM conversations WHERE session_id = $1 RETURNING *';
        params = [session_id];
      }

      const result = await this.pool.query(query, params);

      res.json({
        message: 'Historique supprimé',
        deleted_count: result.rowCount
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la suppression de l\'historique', 
        details: error.message 
      });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await this.pool.query(`
        SELECT 
          COUNT(*) as total_conversations,
          COUNT(DISTINCT session_id) as unique_sessions,
          COUNT(DISTINCT user_id) as unique_users,
          AVG(tokens_used) as avg_tokens_per_message,
          intent,
          COUNT(*) as intent_count
        FROM conversations 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY intent
        ORDER BY intent_count DESC
      `);

      const totalStats = await this.pool.query(`
        SELECT 
          COUNT(*) as total_conversations,
          COUNT(DISTINCT session_id) as unique_sessions,
          COUNT(DISTINCT user_id) as unique_users,
          SUM(tokens_used) as total_tokens_used
        FROM conversations 
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `);

      res.json({
        period: 'Last 30 days',
        overview: totalStats.rows[0],
        by_intent: stats.rows,
        llm_status: this.isLLMAvailable ? 'active' : 'fallback'
      });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des statistiques', 
        details: error.message 
      });
    }
  }
}

module.exports = ChatController;
