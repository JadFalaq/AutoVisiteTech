# 📄 Report Service - Auto Visite Tech

Service de génération de rapports, certificats PDF et gestion de facturation pour l'application Auto Visite Tech.

## 🎯 Fonctionnalités

### 1. Génération de Rapports PDF
- ✅ **Certificats de contrôle technique** - Documents officiels avec résultats d'inspection
- ✅ **Rapports détaillés** - Analyses complètes avec observations et recommandations
- ✅ **Templates professionnels** - Design moderne et conforme aux normes
- ✅ **Génération automatique** - Déclenchée par événements RabbitMQ

### 2. Gestion de Facturation
- ✅ **Création de factures PDF** - Factures professionnelles avec TVA
- ✅ **Numérotation automatique** - Format INV-{timestamp}
- ✅ **Calcul automatique de la TVA** - 20% par défaut
- ✅ **Suivi des paiements** - Statuts (pending, paid)
- ✅ **Factures en retard** - Détection automatique

### 3. Envoi d'Emails
- ✅ **Envoi de certificats** - Email automatique avec PDF en pièce jointe
- ✅ **Envoi de factures** - Notification client avec facture PDF
- ✅ **Rappels de paiement** - Emails automatiques pour factures impayées
- ✅ **Confirmations de paiement** - Notification après règlement
- ✅ **Templates HTML** - Emails professionnels et responsive

### 4. Intégration RabbitMQ
- ✅ **Écoute d'événements** - Inspection terminée, paiement réussi
- ✅ **Publication d'événements** - Rapport généré, facture créée/payée
- ✅ **Communication inter-services** - Architecture événementielle

## 🏗️ Architecture

```
report-service/
├── src/
│   ├── controllers/
│   │   ├── reportController.js      # Gestion des rapports
│   │   └── invoiceController.js     # Gestion des factures
│   ├── utils/
│   │   ├── pdfGenerator.js          # Génération PDF (PDFKit)
│   │   └── emailService.js          # Envoi emails (Nodemailer)
│   ├── messaging/
│   │   └── rabbitmq.js              # Client RabbitMQ
│   └── server.js                     # Serveur principal
├── reports/                          # Stockage des PDF générés
│   └── invoices/                     # Factures
├── Dockerfile
├── package.json
└── README.md
```

## 📡 API Endpoints

### Rapports

#### `GET /api/reports`
Récupérer tous les rapports (filtrables par user_id ou inspection_id)

**Query Parameters:**
- `user_id` (optional) - Filtrer par utilisateur
- `inspection_id` (optional) - Filtrer par inspection

**Response:**
```json
[
  {
    "id": 1,
    "inspection_id": 123,
    "user_id": 456,
    "report_type": "inspection_certificate",
    "file_name": "certificate_123_1699876543210.pdf",
    "file_url": "http://localhost:8008/api/reports/download/certificate_123_1699876543210.pdf",
    "status": "completed",
    "generated_at": "2024-11-10T14:00:00.000Z"
  }
]
```

#### `POST /api/reports`
Générer un nouveau rapport avec PDF réel

**Body:**
```json
{
  "inspection_id": 123,
  "user_id": 456,
  "report_type": "inspection_certificate",
  "send_email": true,
  "inspection_data": {
    "inspection_number": "CT-2024-001",
    "inspection_date": "2024-11-10",
    "vehicle_registration": "AB-123-CD",
    "vehicle_brand": "Renault",
    "vehicle_model": "Clio",
    "vehicle_vin": "VF1XXXXXXXX123456",
    "vehicle_year": 2020,
    "mileage": 45000,
    "owner_name": "Jean Dupont",
    "owner_email": "jean.dupont@example.com",
    "owner_phone": "0612345678",
    "status": "passed",
    "inspector_name": "Marie Martin",
    "validity_date": "2025-11-10",
    "observations": "Véhicule en bon état général",
    "checkpoints": [
      { "name": "Freinage", "status": "passed", "result": "OK" },
      { "name": "Direction", "status": "passed", "result": "OK" },
      { "name": "Éclairage", "status": "passed", "result": "OK" }
    ]
  }
}
```

**Response:**
```json
{
  "message": "Rapport généré avec succès",
  "report": {
    "id": 1,
    "inspection_id": 123,
    "file_url": "http://localhost:8008/api/reports/download/certificate_123_1699876543210.pdf"
  }
}
```

#### `GET /api/reports/:id`
Récupérer un rapport par ID

#### `GET /api/reports/download/:filename`
Télécharger un fichier PDF de rapport

#### `POST /api/reports/:id/resend`
Renvoyer un rapport par email

**Body:**
```json
{
  "email": "client@example.com",
  "name": "Jean Dupont"
}
```

#### `DELETE /api/reports/:id`
Supprimer un rapport

---

### Factures

#### `GET /api/invoices`
Récupérer toutes les factures

**Query Parameters:**
- `user_id` (optional) - Filtrer par utilisateur
- `status` (optional) - Filtrer par statut (pending, paid)

#### `GET /api/invoices/overdue`
Récupérer les factures en retard

#### `POST /api/invoices`
Créer une nouvelle facture avec PDF

**Body:**
```json
{
  "user_id": 456,
  "appointment_id": 789,
  "amount": 70.00,
  "tax_rate": 0.20,
  "send_email": true,
  "customer_data": {
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "phone": "0612345678"
  },
  "items": [
    {
      "description": "Contrôle technique complet",
      "quantity": 1,
      "unit_price": 70.00
    }
  ]
}
```

**Response:**
```json
{
  "message": "Facture créée avec succès",
  "invoice": {
    "id": 1,
    "invoice_number": "INV-1699876543210",
    "amount": 70.00,
    "tax_amount": 14.00,
    "total_amount": 84.00,
    "status": "pending",
    "due_date": "2024-12-10",
    "file_url": "http://localhost:8008/api/invoices/download/INV-1699876543210.pdf"
  }
}
```

#### `GET /api/invoices/:id`
Récupérer une facture par ID

#### `GET /api/invoices/download/:filename`
Télécharger un fichier PDF de facture

#### `PATCH /api/invoices/:id`
Mettre à jour le statut d'une facture

**Body:**
```json
{
  "status": "paid",
  "customer_email": "client@example.com",
  "customer_name": "Jean Dupont"
}
```

#### `POST /api/invoices/:id/reminder`
Envoyer un rappel de paiement

**Body:**
```json
{
  "email": "client@example.com",
  "name": "Jean Dupont"
}
```

#### `POST /api/invoices/:id/resend`
Renvoyer une facture par email

---

## 🔌 Événements RabbitMQ

### Événements écoutés

#### `inspection.completed`
Déclenche la génération automatique d'un certificat

**Payload attendu:**
```json
{
  "inspection_id": 123,
  "user_id": 456,
  "inspection_data": { /* données complètes */ }
}
```

#### `payment.succeeded`
Déclenche la création automatique d'une facture

**Payload attendu:**
```json
{
  "payment_id": 789,
  "user_id": 456,
  "appointment_id": 123,
  "amount": 70.00
}
```

### Événements publiés

#### `report.generated`
Publié après génération d'un rapport

#### `invoice.created`
Publié après création d'une facture

#### `invoice.paid`
Publié après paiement d'une facture

#### `email.sent`
Publié après envoi d'un email

---

## 🛠️ Technologies

- **Express.js** - Framework web
- **PostgreSQL** - Base de données
- **PDFKit** - Génération de PDF
- **Nodemailer** - Envoi d'emails
- **RabbitMQ (amqplib)** - Message broker
- **Winston** - Logging

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL
- RabbitMQ

### Installation locale

```bash
cd services/report-service
npm install
```

### Variables d'environnement

Créer un fichier `.env`:

```env
# Serveur
PORT=8008
NODE_ENV=development
API_URL=http://localhost:8008

# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=report_db
DB_USER=report_user
DB_PASSWORD=report_password

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Email (Production)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Auto Visite Tech <noreply@autovisitetech.fr>"

# Frontend URL (pour les liens dans les emails)
FRONTEND_URL=http://localhost:3000
```

### Démarrage

```bash
# Développement avec hot reload
npm run dev

# Production
npm start
```

## 🐳 Docker

```bash
# Build
docker build -t report-service .

# Run
docker run -p 8008:8008 --env-file .env report-service
```

## 📧 Configuration Email

### Mode Développement
Par défaut, le service utilise **Ethereal Email** (service de test) si aucune configuration email n'est fournie. Les emails ne sont pas réellement envoyés mais vous pouvez les prévisualiser via les URLs affichées dans les logs.

### Mode Production
Configurez un vrai service SMTP:

#### Gmail
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password  # Mot de passe d'application
```

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

## 🧪 Tests

### Test de génération de rapport

```bash
curl -X POST http://localhost:8008/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "inspection_id": 123,
    "user_id": 456,
    "report_type": "inspection_certificate",
    "send_email": false,
    "inspection_data": {
      "inspection_number": "CT-2024-001",
      "inspection_date": "2024-11-10",
      "vehicle_registration": "AB-123-CD",
      "vehicle_brand": "Renault",
      "vehicle_model": "Clio",
      "status": "passed",
      "owner_name": "Jean Dupont",
      "owner_email": "jean.dupont@example.com"
    }
  }'
```

### Test de création de facture

```bash
curl -X POST http://localhost:8008/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 456,
    "amount": 70.00,
    "send_email": false,
    "customer_data": {
      "name": "Jean Dupont",
      "email": "jean.dupont@example.com"
    }
  }'
```

## 📊 Base de données

### Table `reports`
```sql
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  report_type VARCHAR(100),
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  generated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table `invoices`
```sql
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  appointment_id INTEGER,
  payment_id INTEGER,
  invoice_number VARCHAR(100) UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  paid_at TIMESTAMP,
  file_path VARCHAR(500),
  file_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔗 Intégration avec les autres services

### Avec Inspection Service
- Écoute les événements `inspection.completed`
- Génère automatiquement les certificats

### Avec Payment Service
- Écoute les événements `payment.succeeded`
- Crée automatiquement les factures

### Avec Auth Service
- Utilise les user_id pour associer rapports et factures

### Avec Appointment Service
- Lie les factures aux rendez-vous via appointment_id

## 📝 Logs

Le service utilise `console.log` pour le logging. En production, utilisez Winston pour des logs structurés.

## 🐛 Dépannage

### Les PDF ne se génèrent pas
- Vérifiez que le dossier `reports/` existe et est accessible en écriture
- Vérifiez les logs pour les erreurs PDFKit

### Les emails ne s'envoient pas
- Vérifiez la configuration SMTP dans `.env`
- En développement, vérifiez les URLs de prévisualisation dans les logs
- Vérifiez que le port SMTP n'est pas bloqué par un firewall

### RabbitMQ ne se connecte pas
- Le service fonctionne sans RabbitMQ (mode dégradé)
- Vérifiez que RabbitMQ est démarré
- Vérifiez l'URL de connexion dans `RABBITMQ_URL`

## 📄 Licence

MIT

## 👥 Contributeurs

Auto Visite Tech Team
