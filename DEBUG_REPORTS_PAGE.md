# 🔧 Guide de dépannage - Page Rapports

## ✅ Corrections appliquées

### 1. Version simplifiée créée
J'ai créé une **page de debug** pour identifier le problème :
- `ReportsPageSimple.jsx` - Version avec logs et tests intégrés

### 2. Route mise à jour
```jsx
<Route path="/reports" element={<ReportsPageSimple />} />
```

---

## 🚀 Étapes de dépannage

### Étape 1 : Vérifier que le backend fonctionne

```bash
# 1. Vérifier que les services sont démarrés
docker ps

# Vous devriez voir :
# - api-gateway (port 8000)
# - report-service (port 8008)
# - report-db (PostgreSQL)

# 2. Tester l'API Gateway
curl http://localhost:8000/health

# 3. Tester le Report Service directement
curl http://localhost:8008/health

# 4. Tester l'API des rapports
curl http://localhost:8000/api/reports

# 5. Tester l'API des factures
curl http://localhost:8000/api/invoices
```

### Étape 2 : Démarrer les services si nécessaire

```bash
# Démarrer tous les services
docker-compose up -d

# Ou juste le report-service
docker-compose up -d report-service api-gateway
```

### Étape 3 : Redémarrer le frontend

```bash
# Arrêter le serveur (Ctrl+C)
cd frontend
npm run dev
```

### Étape 4 : Accéder à la page de debug

Ouvrez votre navigateur :
```
http://localhost:3000/reports
```

---

## 🔍 Ce que vous devriez voir

### Page de debug affiche :

1. **Header** : "📄 Rapports & Factures"
2. **Debug Info** (encadré jaune) :
   - API URL
   - Active Tab
   - Loading status
   - Erreurs éventuelles
   - Nombre d'items

3. **Onglets** : Rapports / Factures
4. **Bouton Actualiser**
5. **Boutons de test** en bas de page

---

## 🧪 Tests à effectuer

### Test 1 : Boutons de test intégrés

Sur la page, cliquez sur les boutons :
1. ✅ **Tester API Gateway** - Doit afficher un popup avec les infos
2. 📄 **Tester API Reports** - Doit afficher le nombre de rapports
3. 💰 **Tester API Invoices** - Doit afficher le nombre de factures

### Test 2 : Console du navigateur

Ouvrez la console (F12) et regardez :
- Les logs de fetch
- Les erreurs éventuelles
- Les données reçues

### Test 3 : Network tab

Dans les DevTools (F12) :
1. Onglet **Network**
2. Actualisez la page
3. Regardez les requêtes vers `/api/reports` et `/api/invoices`
4. Vérifiez le status code (doit être 200)

---

## ❌ Problèmes courants et solutions

### Problème 1 : "Failed to fetch"

**Cause** : Le backend n'est pas démarré ou l'URL est incorrecte

**Solution** :
```bash
# Vérifier les services
docker ps | grep -E "api-gateway|report-service"

# Démarrer si nécessaire
docker-compose up -d api-gateway report-service

# Vérifier les logs
docker logs api-gateway
docker logs report-service
```

### Problème 2 : "CORS error"

**Cause** : Le backend bloque les requêtes du frontend

**Solution** : Vérifier que CORS est activé dans l'API Gateway
```javascript
// Dans api-gateway/src/server.js
app.use(cors()); // Doit être présent
```

### Problème 3 : "404 Not Found"

**Cause** : La route n'existe pas dans l'API Gateway

**Solution** : Vérifier les routes dans `api-gateway/src/server.js`
```javascript
app.use('/api/reports', proxyRequest('report-service', 8008));
```

### Problème 4 : "Connection refused"

**Cause** : Le report-service n'est pas accessible

**Solution** :
```bash
# Vérifier que le service est démarré
docker ps | grep report-service

# Vérifier les logs
docker logs report-service

# Redémarrer si nécessaire
docker-compose restart report-service
```

### Problème 5 : Page blanche sans erreur

**Cause** : Erreur JavaScript dans le composant

**Solution** :
1. Ouvrir la console (F12)
2. Regarder les erreurs en rouge
3. Vérifier que tous les imports sont corrects

---

## 📊 Vérifications système

### Vérifier les ports

```bash
# Windows
netstat -ano | findstr "8000"
netstat -ano | findstr "8008"
netstat -ano | findstr "3000"

# Vous devriez voir :
# 8000 - API Gateway
# 8008 - Report Service
# 3000 - Frontend
```

### Vérifier les variables d'environnement

```bash
# Dans frontend/.env ou frontend/.env.local
VITE_API_GATEWAY_URL=http://localhost:8000
```

### Vérifier les logs en temps réel

```bash
# Terminal 1 : Frontend
cd frontend
npm run dev

# Terminal 2 : Backend
docker-compose logs -f api-gateway report-service
```

---

## 🎯 Générer des données de test

Si la page fonctionne mais est vide, générez des données :

```bash
# À la racine du projet
node test-report-service.js
```

Cela va créer :
- 2-3 rapports de test
- 2-3 factures de test

Puis actualisez la page.

---

## 🔄 Réinitialisation complète

Si rien ne fonctionne, réinitialisez tout :

```bash
# 1. Arrêter tous les services
docker-compose down

# 2. Supprimer les volumes (ATTENTION : efface les données)
docker-compose down -v

# 3. Redémarrer
docker-compose up -d

# 4. Attendre que tout démarre (30 secondes)
sleep 30

# 5. Vérifier
curl http://localhost:8000/health
curl http://localhost:8008/health

# 6. Générer des données de test
node test-report-service.js

# 7. Redémarrer le frontend
cd frontend
npm run dev
```

---

## 📝 Checklist de vérification

- [ ] Docker est démarré
- [ ] `docker ps` montre api-gateway et report-service
- [ ] `curl http://localhost:8000/health` fonctionne
- [ ] `curl http://localhost:8008/health` fonctionne
- [ ] `curl http://localhost:8000/api/reports` retourne un tableau JSON
- [ ] Frontend démarré avec `npm run dev`
- [ ] Page accessible à `http://localhost:3000/reports`
- [ ] Pas d'erreurs dans la console du navigateur (F12)
- [ ] Les boutons de test fonctionnent
- [ ] Les données s'affichent (ou message "Aucun rapport")

---

## 💡 Informations utiles

### URLs importantes

- Frontend : `http://localhost:3000`
- Page debug : `http://localhost:3000/reports`
- API Gateway : `http://localhost:8000`
- Report Service : `http://localhost:8008`
- API Reports : `http://localhost:8000/api/reports`
- API Invoices : `http://localhost:8000/api/invoices`

### Fichiers importants

- `frontend/src/App.jsx` - Routes
- `frontend/src/pages/ReportsPageSimple.jsx` - Page de debug
- `frontend/src/services/reportService.js` - Service API
- `services/api-gateway/src/server.js` - Routes backend
- `services/report-service/src/server.js` - Service rapports

### Commandes utiles

```bash
# Voir les logs
docker logs -f report-service
docker logs -f api-gateway

# Redémarrer un service
docker-compose restart report-service

# Voir les containers
docker ps

# Voir les ports utilisés
netstat -ano | findstr "8000"

# Tester l'API
curl http://localhost:8000/api/reports
```

---

## 🆘 Si rien ne fonctionne

1. **Prenez une capture d'écran** de :
   - La page dans le navigateur
   - La console du navigateur (F12)
   - Les logs Docker

2. **Vérifiez** :
   - Que Docker Desktop est démarré
   - Que les ports ne sont pas utilisés par d'autres applications
   - Que vous êtes dans le bon dossier

3. **Essayez** :
   - Redémarrer Docker Desktop
   - Redémarrer votre ordinateur
   - Utiliser un autre navigateur

---

## ✅ Une fois que ça fonctionne

Quand la page de debug fonctionne, vous pouvez revenir à la version complète :

```jsx
// Dans App.jsx, remplacer
<Route path="/reports" element={<ReportsPageSimple />} />

// Par
<Route path="/reports" element={<ReportsPage />} />
```

---

**La page de debug devrait vous aider à identifier le problème ! 🔍**

Regardez les informations dans l'encadré jaune et testez les boutons en bas de page.
