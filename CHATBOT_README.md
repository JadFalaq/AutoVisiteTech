# 🤖 Chatbot Auto Visite Tech - Guide Complet

## 📋 Vue d'ensemble

Le chatbot d'Auto Visite Tech utilise un LLM (Large Language Model) pour répondre intelligemment aux questions des clients concernant les services de contrôle technique automobile.

## 🏗️ Architecture

```
Frontend (React) → API Gateway → Chatbot Service → OpenAI API
                                      ↓
                               PostgreSQL Database
```

## ⚙️ Configuration

### 1. Variables d'environnement

Ajoutez dans votre fichier `.env` (AutoVisiteTech/) :

```env
# Chatbot Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Chatbot
CHATBOT_DB_NAME=chatbot_db
CHATBOT_DB_USER=chatbot_user
CHATBOT_DB_PASSWORD=chatbot_password
```

### 2. Obtenir une clé API OpenAI

1. Créez un compte sur [OpenAI Platform](https://platform.openai.com/)
2. Générez une clé API dans la section "API Keys"
3. Ajoutez la clé dans votre fichier `.env`

**Note :** Sans clé OpenAI, le chatbot fonctionne en mode "fallback" avec des réponses prédéfinies.

## 🚀 Démarrage

### Mode Docker (Recommandé)

```bash
# Démarrer tous les services
cd AutoVisiteTech
docker compose up -d

# Ou seulement le chatbot et ses dépendances
docker compose up chatbot-service chatbot-db rabbitmq api-gateway -d
```

### Mode Développement

```bash
# Service chatbot uniquement
cd AutoVisiteTech/services/chatbot-service
npm install
npm run dev
```

## 📡 API Endpoints

### Chat Principal
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Bonjour, quels sont vos horaires ?",
  "session_id": "optional_session_id",
  "user_id": "optional_user_id"
}
```

**Réponse :**
```json
{
  "message": "Réponse générée",
  "response": "Nous sommes ouverts du lundi au vendredi de 8h à 18h...",
  "intent": "llm_generated",
  "session_id": "session_123",
  "model": "gpt-3.5-turbo",
  "tokens_used": 45,
  "timestamp": "2025-10-20T22:00:00.000Z"
}
```

### Historique des conversations
```http
GET /api/chat/history?session_id=session_123
```

### Statistiques (Admin)
```http
GET /api/chat/stats
```

### Test de connectivité
```http
GET /api/chat/test
```

## 🎯 Fonctionnalités

### ✅ Implémentées

- **LLM Integration** : OpenAI GPT-3.5-turbo avec contexte spécialisé
- **Mode Fallback** : Réponses prédéfinies si OpenAI indisponible
- **Historique** : Sauvegarde des conversations en base
- **Sessions** : Gestion des sessions utilisateur
- **Interface** : Widget chat moderne et responsive
- **Routage** : Intégration via API Gateway
- **Logging** : Logs détaillés avec Winston
- **Statistiques** : Métriques d'utilisation

### 🎨 Interface Frontend

- **Widget flottant** : Bouton chat en bas à droite
- **Chat moderne** : Interface similaire aux messageries populaires
- **Responsive** : Adaptable mobile/desktop
- **États visuels** : Loading, erreurs, statuts
- **Accessibilité** : Support clavier, ARIA labels

## 🧠 Contexte IA Spécialisé

Le chatbot est configuré avec un contexte spécialisé incluant :

- **Informations entreprise** : Historique, certifications, équipements
- **Services** : Contrôle technique, contre-visite, scan carte grise
- **Tarifs** : Prix détaillés par service
- **Horaires** : Heures d'ouverture complètes
- **Contact** : Adresse, téléphone, email
- **Documents** : Liste des pièces nécessaires

## 🔧 Personnalisation

### Modifier le contexte IA

Éditez le fichier `services/chatbot-service/src/services/llmService.js` :

```javascript
this.systemPrompt = `Votre nouveau contexte personnalisé...`
```

### Ajouter des réponses fallback

Dans `llmService.js`, section `getFallbackResponse()` :

```javascript
const responses = {
  nouveau_intent: "Nouvelle réponse prédéfinie",
  // ...
}
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8006/health
```

### Logs en temps réel
```bash
docker compose logs -f chatbot-service
```

### Statistiques d'usage
```bash
curl http://localhost:8000/api/chat/stats
```

## 🐛 Dépannage

### Problèmes courants

1. **Chatbot ne répond pas**
   - Vérifiez que le service est démarré : `docker compose ps`
   - Consultez les logs : `docker compose logs chatbot-service`

2. **Erreur OpenAI**
   - Vérifiez la clé API dans `.env`
   - Le chatbot bascule automatiquement en mode fallback

3. **Base de données**
   - Vérifiez la connexion PostgreSQL
   - Les tables se créent automatiquement au démarrage

4. **Frontend ne se connecte pas**
   - Vérifiez que l'API Gateway tourne sur le port 8000
   - Contrôlez les CORS dans la console navigateur

### Commandes utiles

```bash
# Redémarrer le chatbot
docker compose restart chatbot-service

# Reconstruire après modifications
docker compose build chatbot-service
docker compose up chatbot-service -d

# Voir les logs détaillés
docker compose logs --tail=100 chatbot-service

# Tester l'API directement
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

## 🔒 Sécurité

- **Validation** : Tous les inputs sont validés
- **Rate limiting** : Peut être ajouté au niveau API Gateway
- **Sanitization** : Messages nettoyés avant traitement
- **Logs** : Aucun mot de passe ou donnée sensible loggée

## 📈 Évolutions futures

- **Modèles locaux** : Support Ollama/LLaMA
- **Multilingue** : Détection automatique de langue
- **Intents avancés** : Classification plus fine des demandes
- **Intégrations** : Calendrier, CRM, notifications
- **Analytics** : Dashboard d'analyse des conversations

## 🎉 Résumé

Le chatbot Auto Visite Tech est maintenant opérationnel avec :

- ✅ **Backend** : Service Node.js avec OpenAI
- ✅ **Frontend** : Widget React intégré
- ✅ **Base de données** : PostgreSQL pour l'historique
- ✅ **API Gateway** : Routage automatique
- ✅ **Fallback** : Mode dégradé sans IA
- ✅ **Documentation** : Guide complet

**URL de test** : http://localhost:3000 (widget en bas à droite)

Pour toute question technique, consultez les logs ou testez les endpoints individuellement.
