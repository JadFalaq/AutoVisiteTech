# 🚀 Comment lancer Auto Visite Tech

## ❌ NE PAS FAIRE

```bash
npm install  # ❌ Pas besoin à la racine !
```

## ✅ À FAIRE

### Option 1 : Avec Docker (RECOMMANDÉ)

```bash
# 1. Aller dans le dossier
cd AutoVisiteTech

# 2. Lancer avec Docker Compose
docker-compose up --build
```

**C'est tout !** Docker va :
- Installer automatiquement toutes les dépendances
- Créer tous les containers
- Démarrer tous les services

### Option 2 : Sans Docker (développement local)

Si vous voulez développer sans Docker, installez les dépendances service par service :

```bash
# Auth Service
cd services/auth-service
npm install
npm run dev

# Payment Service
cd services/payment-service
npm install
npm run dev

# Etc... pour chaque service
```

## 🎯 Commande simple

```bash
docker-compose up --build
```

Puis ouvrez : **http://localhost:3000**

## ⏱️ Temps d'attente

- Première fois : 5-10 minutes
- Fois suivantes : 1-2 minutes

## 📊 Vérifier que ça marche

Vous verrez dans les logs :
```
✅ Auth Service running on port 8001
✅ Payment Service running on port 8002
✅ Appointment Service running on port 8003
...
```

## 🐛 Si ça ne marche pas

```bash
# Arrêter tout
docker-compose down

# Nettoyer et relancer
docker-compose down -v
docker-compose up --build
```

**Pas besoin de npm install !** Docker s'occupe de tout. 🎉
