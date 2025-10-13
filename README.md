# 🚗 Auto Visite Tech

Application complète de gestion de visites techniques automobiles avec architecture microservices.

## 🏗️ Architecture

### Backend - 8 Microservices
1. **Auth Service** - Authentification, JWT, gestion utilisateurs
2. **Payment Service** - Paiements Stripe, transactions
3. **Appointment Service** - Gestion des rendez-vous
4. **Scan Service** - Scan documents, QR codes
5. **Parser Service** - Parsing automatique cartes grises
6. **Chatbot Service** - Assistant conversationnel
7. **Inspection Service** - Processus métier visites techniques
8. **Report Service** - Facturation, rapports, certificats PDF

### Frontend
- **React** (Vite) - Interface utilisateur moderne et responsive

### Infrastructure
- **PostgreSQL** - Base de données pour chaque service
- **RabbitMQ** - Message broker pour communication inter-services
- **API Gateway** - Point d'entrée unique pour le frontend
- **Docker** - Conteneurisation de tous les services

## 🚀 Démarrage rapide

### Prérequis
- Docker & Docker Compose
- Node.js 18+ (pour développement local)
- Git

### Installation

```bash
# Cloner le projet
git clone <repo-url>
cd AutoVisiteTech

# Copier les fichiers d'environnement
cp .env.example .env

# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

### Accès aux services

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **Auth Service**: http://localhost:8001
- **Payment Service**: http://localhost:8002
- **Appointment Service**: http://localhost:8003
- **Scan Service**: http://localhost:8004
- **Parser Service**: http://localhost:8005
- **Chatbot Service**: http://localhost:8006
- **Inspection Service**: http://localhost:8007
- **Report Service**: http://localhost:8008
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## 📁 Structure du projet

```
AutoVisiteTech/
├── services/
│   ├── auth-service/
│   ├── payment-service/
│   ├── appointment-service/
│   ├── scan-service/
│   ├── parser-service/
│   ├── chatbot-service/
│   ├── inspection-service/
│   └── report-service/
├── frontend/
├── api-gateway/
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🛠️ Développement

### Hot Reload activé
Tous les services supportent le hot reload en développement :
- Backend Node.js : `nodemon`
- Backend Python : `uvicorn --reload`
- Frontend React : Vite HMR

### Commandes utiles

```bash
# Démarrer un service spécifique
docker-compose up auth-service

# Rebuild un service
docker-compose up --build auth-service

# Arrêter tous les services
docker-compose down

# Voir les logs d'un service
docker-compose logs -f auth-service

# Exécuter les migrations
docker-compose exec auth-service npm run migrate

# Accéder au shell d'un service
docker-compose exec auth-service sh
```

## 🧪 Tests

```bash
# Tests unitaires pour un service
docker-compose exec auth-service npm test

# Tests d'intégration
npm run test:integration
```

## 📚 Documentation API

Chaque service expose sa documentation Swagger/OpenAPI :
- Auth: http://localhost:8001/api/docs
- Payment: http://localhost:8002/api/docs
- etc.

## 🔐 Sécurité

- JWT pour l'authentification
- HTTPS en production
- Variables d'environnement pour les secrets
- Rate limiting sur l'API Gateway
- Validation des données entrantes

## 📄 Licence

MIT

## 👥 Contributeurs

Votre équipe
