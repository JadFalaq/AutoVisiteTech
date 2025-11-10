# 🚀 Quick Start - Report Service

Guide de démarrage rapide pour utiliser le Report Service en 5 minutes.

## ⚡ Démarrage rapide

### 1. Démarrer le service

```bash
# Avec Docker (recommandé)
docker-compose up report-service

# Ou en local
cd services/report-service
npm install
npm run dev
```

### 2. Vérifier que le service fonctionne

```bash
curl http://localhost:8008/health
```

**Réponse attendue:**
```json
{
  "status": "OK",
  "service": "report-service",
  "features": ["pdf_generation", "email_sending", "rabbitmq_integration"]
}
```

### 3. Générer votre premier certificat

```bash
curl -X POST http://localhost:8008/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "inspection_id": 1,
    "user_id": 1,
    "report_type": "inspection_certificate",
    "send_email": false,
    "inspection_data": {
      "inspection_number": "CT-2024-001",
      "inspection_date": "2024-11-10T10:00:00Z",
      "vehicle_registration": "AB-123-CD",
      "vehicle_brand": "Renault",
      "vehicle_model": "Clio",
      "vehicle_year": 2020,
      "mileage": 45000,
      "owner_name": "Jean Dupont",
      "owner_email": "jean.dupont@example.com",
      "status": "passed",
      "inspector_name": "Marie Martin",
      "checkpoints": [
        {"name": "Freinage", "status": "passed", "result": "OK"},
        {"name": "Direction", "status": "passed", "result": "OK"}
      ]
    }
  }'
```

### 4. Télécharger le PDF généré

La réponse contient une `file_url`. Ouvrez-la dans votre navigateur:

```
http://localhost:8008/api/reports/download/certificate_1_1699876543210.pdf
```

### 5. Créer votre première facture

```bash
curl -X POST http://localhost:8008/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "amount": 70.00,
    "send_email": false,
    "customer_data": {
      "name": "Jean Dupont",
      "email": "jean.dupont@example.com"
    }
  }'
```

---

## 🎯 Cas d'usage principaux

### Cas 1: Générer un certificat et l'envoyer par email

```javascript
const response = await fetch('http://localhost:8008/api/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    inspection_id: 123,
    user_id: 456,
    report_type: 'inspection_certificate',
    send_email: true, // ← Active l'envoi d'email
    inspection_data: {
      // ... données complètes
      owner_email: 'client@example.com' // ← Email du destinataire
    }
  })
});

const result = await response.json();
console.log('PDF généré:', result.report.file_url);
console.log('Email envoyé à:', result.report.owner_email);
```

### Cas 2: Créer une facture avec items détaillés

```javascript
const response = await fetch('http://localhost:8008/api/invoices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 456,
    amount: 95.00,
    send_email: true,
    customer_data: {
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com'
    },
    items: [
      { description: 'Contrôle technique', quantity: 1, unit_price: 70.00 },
      { description: 'Contre-visite', quantity: 1, unit_price: 15.00 },
      { description: 'Frais de dossier', quantity: 1, unit_price: 10.00 }
    ]
  })
});
```

### Cas 3: Marquer une facture comme payée

```javascript
await fetch('http://localhost:8008/api/invoices/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'paid',
    customer_email: 'client@example.com',
    customer_name: 'Jean Dupont'
  })
});
// → Envoie automatiquement un email de confirmation
```

---

## 🔧 Configuration minimale

### Mode développement (par défaut)

Aucune configuration requise ! Le service utilise:
- Base de données PostgreSQL (Docker)
- Emails de test (Ethereal)
- RabbitMQ optionnel

### Mode production

Créer un fichier `.env`:

```env
# Base de données
DB_HOST=report-db
DB_PORT=5432
DB_NAME=report_db
DB_USER=report_user
DB_PASSWORD=report_password

# Email (Gmail exemple)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Auto Visite Tech <noreply@autovisitetech.fr>"

# RabbitMQ (optionnel)
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
```

---

## 📊 Endpoints essentiels

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/health` | Vérifier le statut |
| `POST` | `/api/reports` | Générer un certificat |
| `GET` | `/api/reports` | Liste des rapports |
| `GET` | `/api/reports/download/:filename` | Télécharger un PDF |
| `POST` | `/api/invoices` | Créer une facture |
| `GET` | `/api/invoices` | Liste des factures |
| `PATCH` | `/api/invoices/:id` | Mettre à jour une facture |

---

## 🧪 Tester rapidement

### Option 1: Script de test automatique

```bash
node test-report-service.js
```

Ce script teste tous les endpoints automatiquement.

### Option 2: Tests manuels

```bash
# 1. Health check
curl http://localhost:8008/health

# 2. Générer un rapport
curl -X POST http://localhost:8008/api/reports \
  -H "Content-Type: application/json" \
  -d @test-data.json

# 3. Lister les rapports
curl http://localhost:8008/api/reports

# 4. Créer une facture
curl -X POST http://localhost:8008/api/invoices \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "amount": 70.00}'
```

---

## 🐛 Dépannage rapide

### Le service ne démarre pas

```bash
# Vérifier les logs
docker logs report-service

# Vérifier que PostgreSQL est démarré
docker ps | grep report-db
```

### Les PDF ne se génèrent pas

```bash
# Vérifier que le dossier existe
ls services/report-service/reports/

# Vérifier les permissions
chmod -R 755 services/report-service/reports/
```

### Les emails ne s'envoient pas

En développement, c'est normal ! Les emails sont en mode test.

Pour voir les emails:
1. Regardez les logs du service
2. Cherchez les URLs de prévisualisation
3. Ouvrez-les dans votre navigateur

Pour envoyer de vrais emails:
1. Configurez les variables EMAIL_* dans .env
2. Redémarrez le service

### RabbitMQ ne se connecte pas

Ce n'est pas grave ! Le service fonctionne sans RabbitMQ.

Pour activer RabbitMQ:
```bash
docker-compose up rabbitmq
```

---

## 📚 Aller plus loin

### Documentation complète
- `README.md` - Documentation détaillée
- `EXAMPLES.md` - Exemples d'utilisation
- `CHANGELOG.md` - Historique des versions

### Intégration avec les autres services

#### Depuis Inspection Service
```javascript
// Publier un événement quand l'inspection est terminée
publishEvent('inspection_events', 'inspection.completed', {
  inspection_id: 123,
  user_id: 456,
  inspection_data: { /* données complètes */ }
});
// → Report Service génère automatiquement le certificat
```

#### Depuis Payment Service
```javascript
// Publier un événement quand le paiement est réussi
publishEvent('payment_events', 'payment.succeeded', {
  payment_id: 789,
  user_id: 456,
  amount: 70.00
});
// → Report Service crée automatiquement la facture
```

---

## 🎯 Checklist de démarrage

- [ ] Service démarré (`docker-compose up report-service`)
- [ ] Health check OK (`curl http://localhost:8008/health`)
- [ ] Premier certificat généré
- [ ] PDF téléchargé et vérifié
- [ ] Première facture créée
- [ ] Tests automatiques exécutés (`node test-report-service.js`)
- [ ] Documentation lue (`README.md`)

---

## 💡 Astuces

### Activer les logs détaillés

```bash
# Docker
docker logs -f report-service

# Local
DEBUG=* npm run dev
```

### Vérifier les fichiers générés

```bash
ls -lh services/report-service/reports/
ls -lh services/report-service/reports/invoices/
```

### Tester l'envoi d'emails

1. Mettez `send_email: true` dans votre requête
2. Regardez les logs pour l'URL de prévisualisation
3. Ouvrez l'URL dans votre navigateur

### Nettoyer les fichiers de test

```bash
rm -rf services/report-service/reports/*.pdf
rm -rf services/report-service/reports/invoices/*.pdf
```

---

## 🚀 Vous êtes prêt !

Le Report Service est maintenant opérationnel. Vous pouvez:

✅ Générer des certificats PDF  
✅ Créer des factures  
✅ Envoyer des emails  
✅ Intégrer avec les autres services  

**Bon développement ! 🎉**

---

*Pour toute question, consultez README.md ou EXAMPLES.md*
