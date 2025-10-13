# 🚀 Guide de Démarrage Rapide - Auto Visite Tech

## ⚡ Installation en 3 étapes

### 1. Configuration de l'environnement

```bash
# Copier le fichier d'environnement
copy .env.example .env

# Éditer .env et configurer vos clés API (optionnel pour démarrer)
```

### 2. Lancer tous les services

```bash
# Construire et démarrer tous les services
docker-compose up --build

# Ou en arrière-plan
docker-compose up -d --build
```

### 3. Accéder à l'application

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## 📋 Services disponibles

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Interface utilisateur React |
| API Gateway | 8000 | Point d'entrée unique |
| Auth Service | 8001 | Authentification & utilisateurs |
| Payment Service | 8002 | Paiements Stripe |
| Appointment Service | 8003 | Gestion rendez-vous |
| Scan Service | 8004 | Scan documents/QR codes |
| Parser Service | 8005 | Parsing cartes grises |
| Chatbot Service | 8006 | Assistant conversationnel |
| Inspection Service | 8007 | Processus visites techniques |
| Report Service | 8008 | Rapports & certificats PDF |

## 🛠️ Commandes utiles

### Gestion des services

```bash
# Voir les logs de tous les services
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f auth-service

# Redémarrer un service
docker-compose restart auth-service

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v
```

### Développement

```bash
# Rebuild un service après modification du Dockerfile
docker-compose up --build auth-service

# Accéder au shell d'un service
docker-compose exec auth-service sh

# Exécuter les migrations d'un service
docker-compose exec auth-service npm run migrate

# Exécuter les tests
docker-compose exec auth-service npm test
```

## 🔧 Développement local (sans Docker)

### Backend (exemple avec auth-service)

```bash
cd services/auth-service
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📝 Premiers pas

### 1. Créer un compte utilisateur

```bash
POST http://localhost:8000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "0612345678"
}
```

### 2. Se connecter

```bash
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 3. Créer un rendez-vous

```bash
POST http://localhost:8000/api/appointments
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "vehicleRegistration": "AB-123-CD",
  "date": "2024-10-20",
  "time": "10:00",
  "serviceType": "controle_technique"
}
```

## 🐛 Dépannage

### Les services ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs

# Vérifier que les ports ne sont pas déjà utilisés
netstat -ano | findstr :8000
```

### Base de données ne se connecte pas

```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps

# Recréer les volumes
docker-compose down -v
docker-compose up -d
```

### Hot reload ne fonctionne pas

```bash
# Vérifier que les volumes sont bien montés
docker-compose config

# Redémarrer le service
docker-compose restart auth-service
```

## 📚 Documentation complète

- [README.md](./README.md) - Vue d'ensemble du projet
- [Architecture](./docs/ARCHITECTURE.md) - Architecture détaillée
- [API Documentation](./docs/API.md) - Documentation des APIs
- [Deployment](./docs/DEPLOYMENT.md) - Guide de déploiement

## 🆘 Besoin d'aide ?

- Consultez les logs : `docker-compose logs -f`
- Vérifiez la santé des services : `http://localhost:8001/health`
- Ouvrez une issue sur GitHub

## ✅ Checklist de démarrage

- [ ] Docker et Docker Compose installés
- [ ] Fichier `.env` créé et configuré
- [ ] `docker-compose up --build` exécuté
- [ ] Frontend accessible sur http://localhost:3000
- [ ] API Gateway accessible sur http://localhost:8000
- [ ] Compte utilisateur créé
- [ ] Premier rendez-vous créé

Bon développement ! 🚀
