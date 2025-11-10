# 📚 Exemples d'utilisation - Report Service

## 🎯 Scénarios d'utilisation

### Scénario 1: Génération complète d'un certificat avec email

```javascript
// Appel API pour générer un certificat et l'envoyer par email
const response = await fetch('http://localhost:8008/api/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    inspection_id: 123,
    user_id: 456,
    report_type: 'inspection_certificate',
    send_email: true,
    inspection_data: {
      inspection_number: 'CT-2024-001',
      inspection_date: '2024-11-10T10:30:00Z',
      vehicle_registration: 'AB-123-CD',
      vehicle_brand: 'Renault',
      vehicle_model: 'Clio V',
      vehicle_vin: 'VF1XXXXXXXX123456',
      vehicle_year: 2020,
      mileage: 45000,
      owner_name: 'Jean Dupont',
      owner_email: 'jean.dupont@example.com',
      owner_phone: '0612345678',
      status: 'passed', // 'passed', 'failed', 'conditional'
      inspector_name: 'Marie Martin',
      validity_date: '2025-11-10',
      observations: 'Véhicule en excellent état. Aucune anomalie détectée.',
      checkpoints: [
        { name: 'Freinage', status: 'passed', result: 'Efficacité: 95%' },
        { name: 'Direction', status: 'passed', result: 'Jeu normal' },
        { name: 'Éclairage', status: 'passed', result: 'Tous feux fonctionnels' },
        { name: 'Pneumatiques', status: 'passed', result: 'Profondeur: 4mm' },
        { name: 'Échappement', status: 'passed', result: 'Émissions conformes' }
      ]
    }
  })
});

const result = await response.json();
console.log('Certificat généré:', result.report.file_url);
```

### Scénario 2: Génération de rapport détaillé

```javascript
const response = await fetch('http://localhost:8008/api/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    inspection_id: 124,
    user_id: 456,
    report_type: 'detailed_report',
    send_email: false,
    inspection_data: {
      inspection_number: 'CT-2024-002',
      inspection_date: '2024-11-10T14:00:00Z',
      vehicle_registration: 'CD-456-EF',
      vehicle_brand: 'Peugeot',
      vehicle_model: '308',
      mileage: 78000,
      status: 'conditional',
      technical_details: `
        FREINAGE:
        - Disques avant: usure 70%, à surveiller
        - Plaquettes arrière: 3mm restants
        
        SUSPENSION:
        - Amortisseurs avant: légère fuite détectée
        - Silentblocs: état correct
        
        ÉCLAIRAGE:
        - Feu stop gauche défaillant (à remplacer)
        
        PNEUMATIQUES:
        - Avant gauche: 3mm (limite légale)
        - Autres pneus: état correct
      `,
      recommendations: `
        URGENT (à effectuer avant prochain contrôle):
        - Remplacer le feu stop gauche
        - Vérifier et réparer la fuite d'amortisseur avant gauche
        
        À SURVEILLER:
        - Disques de frein avant (prévoir remplacement dans 6 mois)
        - Pneumatique avant gauche (proche de la limite légale)
        
        PROCHAIN CONTRÔLE: Dans 2 mois maximum
      `
    }
  })
});
```

### Scénario 3: Création de facture avec items détaillés

```javascript
const response = await fetch('http://localhost:8008/api/invoices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 456,
    appointment_id: 789,
    amount: 95.00,
    tax_rate: 0.20,
    send_email: true,
    customer_data: {
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      phone: '0612345678'
    },
    items: [
      {
        description: 'Contrôle technique complet',
        quantity: 1,
        unit_price: 70.00
      },
      {
        description: 'Contre-visite',
        quantity: 1,
        unit_price: 15.00
      },
      {
        description: 'Frais de dossier',
        quantity: 1,
        unit_price: 10.00
      }
    ]
  })
});

const result = await response.json();
console.log('Facture créée:', result.invoice.invoice_number);
```

### Scénario 4: Workflow complet d'inspection

```javascript
// 1. L'inspection est terminée (depuis inspection-service)
// Cela publie un événement RabbitMQ qui déclenche automatiquement
// la génération du certificat

// 2. Le client paie (depuis payment-service)
// Cela publie un événement qui déclenche la création de la facture

// 3. Récupérer le rapport généré
const reportResponse = await fetch(
  'http://localhost:8008/api/reports?inspection_id=123'
);
const reports = await reportResponse.json();
const certificate = reports[0];

// 4. Télécharger le certificat
window.open(certificate.file_url, '_blank');

// 5. Récupérer la facture
const invoiceResponse = await fetch(
  'http://localhost:8008/api/invoices?user_id=456'
);
const invoices = await invoiceResponse.json();
const invoice = invoices[0];

// 6. Renvoyer la facture par email si nécessaire
await fetch(`http://localhost:8008/api/invoices/${invoice.id}/resend`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'autre-email@example.com',
    name: 'Jean Dupont'
  })
});
```

### Scénario 5: Gestion des factures en retard

```javascript
// 1. Récupérer les factures en retard
const overdueResponse = await fetch('http://localhost:8008/api/invoices/overdue');
const overdueInvoices = await overdueResponse.json();

// 2. Envoyer des rappels automatiques
for (const invoice of overdueInvoices) {
  // Récupérer les infos client (depuis auth-service)
  const userResponse = await fetch(`http://localhost:8001/api/users/${invoice.user_id}`);
  const user = await userResponse.json();
  
  // Envoyer le rappel
  await fetch(`http://localhost:8008/api/invoices/${invoice.id}/reminder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      name: user.name
    })
  });
  
  console.log(`Rappel envoyé pour facture ${invoice.invoice_number}`);
}
```

### Scénario 6: Marquer une facture comme payée

```javascript
// Après confirmation de paiement (webhook Stripe par exemple)
const response = await fetch('http://localhost:8008/api/invoices/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'paid',
    customer_email: 'jean.dupont@example.com',
    customer_name: 'Jean Dupont'
  })
});

// Cela va:
// 1. Mettre à jour le statut dans la DB
// 2. Publier un événement 'invoice.paid' sur RabbitMQ
// 3. Envoyer un email de confirmation au client
```

## 🔌 Intégration avec RabbitMQ

### Publier un événement d'inspection terminée (depuis inspection-service)

```javascript
const amqp = require('amqplib');

async function publishInspectionCompleted(inspectionData) {
  const connection = await amqp.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();
  
  await channel.assertExchange('inspection_events', 'topic', { durable: true });
  
  const message = {
    event: 'inspection.completed',
    timestamp: new Date().toISOString(),
    data: {
      inspection_id: inspectionData.id,
      user_id: inspectionData.user_id,
      inspection_data: {
        inspection_number: inspectionData.inspection_number,
        inspection_date: inspectionData.inspection_date,
        vehicle_registration: inspectionData.vehicle_registration,
        vehicle_brand: inspectionData.vehicle_brand,
        vehicle_model: inspectionData.vehicle_model,
        status: inspectionData.status,
        owner_name: inspectionData.owner_name,
        owner_email: inspectionData.owner_email,
        // ... autres données
      }
    }
  };
  
  channel.publish(
    'inspection_events',
    'inspection.completed',
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
  
  console.log('Événement publié: inspection.completed');
  
  await channel.close();
  await connection.close();
}
```

### Publier un événement de paiement réussi (depuis payment-service)

```javascript
async function publishPaymentSucceeded(paymentData) {
  const connection = await amqp.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();
  
  await channel.assertExchange('payment_events', 'topic', { durable: true });
  
  const message = {
    event: 'payment.succeeded',
    timestamp: new Date().toISOString(),
    data: {
      payment_id: paymentData.id,
      user_id: paymentData.user_id,
      appointment_id: paymentData.appointment_id,
      amount: paymentData.amount
    }
  };
  
  channel.publish(
    'payment_events',
    'payment.succeeded',
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
  
  console.log('Événement publié: payment.succeeded');
  
  await channel.close();
  await connection.close();
}
```

## 🎨 Exemples de données complètes

### Inspection avec défaillances

```json
{
  "inspection_id": 125,
  "user_id": 457,
  "report_type": "inspection_certificate",
  "send_email": true,
  "inspection_data": {
    "inspection_number": "CT-2024-003",
    "inspection_date": "2024-11-10T16:00:00Z",
    "vehicle_registration": "GH-789-IJ",
    "vehicle_brand": "Citroën",
    "vehicle_model": "C3",
    "vehicle_vin": "VF7XXXXXXXX789012",
    "vehicle_year": 2018,
    "mileage": 92000,
    "owner_name": "Marie Martin",
    "owner_email": "marie.martin@example.com",
    "owner_phone": "0623456789",
    "status": "failed",
    "inspector_name": "Pierre Dubois",
    "validity_date": null,
    "observations": "DÉFAILLANCES MAJEURES DÉTECTÉES - Véhicule non conforme. Contre-visite obligatoire dans les 2 mois.",
    "checkpoints": [
      { "name": "Freinage", "status": "failed", "result": "Efficacité insuffisante: 42% (min 50%)" },
      { "name": "Direction", "status": "passed", "result": "Conforme" },
      { "name": "Éclairage", "status": "failed", "result": "Feux de croisement défaillants" },
      { "name": "Pneumatiques", "status": "failed", "result": "Pneu avant droit: 1.2mm (min 1.6mm)" },
      { "name": "Échappement", "status": "passed", "result": "Conforme" },
      { "name": "Suspension", "status": "failed", "result": "Amortisseur arrière gauche HS" }
    ]
  }
}
```

### Facture avec remise

```json
{
  "user_id": 458,
  "appointment_id": 790,
  "amount": 63.00,
  "tax_rate": 0.20,
  "send_email": true,
  "customer_data": {
    "name": "Sophie Bernard",
    "email": "sophie.bernard@example.com",
    "phone": "0634567890"
  },
  "items": [
    {
      "description": "Contrôle technique complet",
      "quantity": 1,
      "unit_price": 70.00
    },
    {
      "description": "Remise fidélité -10%",
      "quantity": 1,
      "unit_price": -7.00
    }
  ]
}
```

## 🧪 Tests avec cURL

### Générer un certificat

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
      "inspection_date": "2024-11-10T10:30:00Z",
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

### Créer une facture

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

### Télécharger un rapport

```bash
curl -O http://localhost:8008/api/reports/download/certificate_123_1699876543210.pdf
```

### Marquer une facture comme payée

```bash
curl -X PATCH http://localhost:8008/api/invoices/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "paid",
    "customer_email": "jean.dupont@example.com",
    "customer_name": "Jean Dupont"
  }'
```

### Envoyer un rappel de paiement

```bash
curl -X POST http://localhost:8008/api/invoices/1/reminder \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "name": "Jean Dupont"
  }'
```

## 📊 Monitoring et Logs

### Vérifier le health check

```bash
curl http://localhost:8008/health
```

**Réponse:**
```json
{
  "status": "OK",
  "service": "report-service",
  "timestamp": "2024-11-10T14:30:00.000Z",
  "features": ["pdf_generation", "email_sending", "rabbitmq_integration"]
}
```

### Surveiller les logs

```bash
# Docker
docker logs -f report-service

# Local
npm run dev
```

**Logs typiques:**
```
✅ Connecté à la base de données PostgreSQL
✅ Tables reports créées ou déjà existantes
✅ Connecté à RabbitMQ
👂 Écoute de la queue: report_generation
👂 Écoute de la queue: invoice_creation
✅ Abonné aux événements RabbitMQ
📄 Report Service running on port 8008
📊 Features: PDF Generation, Email Sending, RabbitMQ Integration
🔗 Health check: http://localhost:8008/health
```

## 🎯 Bonnes pratiques

1. **Toujours fournir des données complètes** pour la génération de PDF
2. **Activer send_email=true** uniquement en production
3. **Stocker les file_url** dans votre base de données frontend
4. **Gérer les erreurs** - Les PDF peuvent échouer si les données sont incomplètes
5. **Surveiller les factures en retard** avec un cron job
6. **Tester les emails** en développement avec Ethereal
7. **Utiliser RabbitMQ** pour la génération automatique

## 🔗 Liens utiles

- [Documentation PDFKit](http://pdfkit.org/)
- [Documentation Nodemailer](https://nodemailer.com/)
- [Documentation RabbitMQ](https://www.rabbitmq.com/documentation.html)
