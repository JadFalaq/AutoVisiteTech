# 🚀 Lancer l'application Auto Visite Tech

## ✅ Prérequis vérifiés

Tous les fichiers nécessaires sont créés :
- ✅ 10 Dockerfiles
- ✅ 9 package.json (Node.js)
- ✅ 1 requirements.txt (Python)
- ✅ Tous les fichiers server.js/main.py
- ✅ Frontend React complet
- ✅ API Gateway configuré
- ✅ docker-compose.yml
- ✅ .env créé

## 🎯 Lancement en 2 étapes

### Étape 1 : Démarrer tous les services

```bash
cd AutoVisiteTech
docker-compose up --build
```

**Temps estimé** : 5-10 minutes (première fois)

### Étape 2 : Accéder à l'application

Une fois tous les services démarrés, ouvrez votre navigateur :

**🌐 Frontend** : C

## 📊 Vérifier que tout fonctionne

### Health checks des services

Ouvrez ces URLs dans votre navigateur :

- ✅ Auth Service : http://localhost:8001/health
- ✅ Payment Service : http://localhost:8002/health
- ✅ Appointment Service : http://localhost:8003/health
- ✅ Scan Service : http://localhost:8004/health
- ✅ Parser Service : http://localhost:8005/health
- ✅ Chatbot Service : http://localhost:8006/health
- ✅ Inspection Service : http://localhost:8007/health
- ✅ Report Service : http://localhost:8008/health
- ✅ API Gateway : http://localhost:8000/health

### RabbitMQ Management

- URL : http://localhost:15672
- Username : `guest`
- Password : `guest`

## 🔍 Voir les logs

### Tous les services
```bash
docker-compose logs -f
```

### Un service spécifique
```bash
docker-compose logs -f auth-service
docker-compose logs -f frontend
```

## 🛑 Arrêter l'application

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v
```

## 🔧 Commandes utiles

### Redémarrer un service
```bash
docker-compose restart auth-service
```

### Rebuild un service
```bash
docker-compose up --build auth-service
```

### Voir les containers en cours
```bash
docker-compose ps
```

### Accéder au shell d'un service
```bash
docker-compose exec auth-service sh
```

## ⚡ Mode développement

Le **hot reload** est activé sur tous les services :
- Modifiez le code dans `services/*/src/`
- Les changements sont automatiquement détectés
- Pas besoin de rebuild !

## 🐛 Problèmes courants

### Les services ne démarrent pas
```bash
# Vérifier les logs
docker-compose logs

# Nettoyer et redémarrer
docker-compose down -v
docker-compose up --build
```

### Port déjà utilisé
```bash
# Vérifier les ports utilisés
netstat -ano | findstr :8000

# Arrêter le processus ou changer le port dans .env
```

### Base de données ne se connecte pas
```bash
# Attendre que PostgreSQL soit prêt (30 secondes)
# Ou redémarrer le service
docker-compose restart auth-service
```

## 📱 Interface Frontend

L'interface affiche :
- 🚗 Titre "Auto Visite Tech"
- ✅ Liste des 8 services disponibles
- 📊 Status de chaque service

## 🎉 Vous êtes prêt !

L'application est maintenant **100% fonctionnelle** en localhost avec :
- 8 microservices backend
- 1 API Gateway
- 1 Frontend React
- 8 bases de données PostgreSQL
- 1 RabbitMQ

**Bon développement !** 🚀
