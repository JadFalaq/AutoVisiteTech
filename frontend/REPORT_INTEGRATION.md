# 📄 Intégration du Report Service dans le Frontend

## 🎯 Fichiers créés

### Services
- **`src/services/reportService.js`** - Service API pour rapports et factures

### Composants
- **`src/components/ReportsList.jsx`** - Liste des rapports de contrôle technique
- **`src/components/InvoicesList.jsx`** - Liste des factures

### Pages
- **`src/pages/ReportsPage.jsx`** - Page complète avec onglets rapports/factures

---

## 🚀 Intégration dans votre application

### 1. Ajouter la route dans App.jsx

```jsx
import ReportsPage from './pages/ReportsPage';

// Dans vos routes
<Route path="/reports" element={<ReportsPage />} />
```

### 2. Ajouter un lien dans la navigation

```jsx
<Link to="/reports" className="nav-link">
  📄 Mes Documents
</Link>
```

---

## 📦 Utilisation des composants

### Afficher les rapports d'un utilisateur

```jsx
import ReportsList from './components/ReportsList';

function MyComponent() {
  const userId = 123; // ID de l'utilisateur connecté
  
  return <ReportsList userId={userId} />;
}
```

### Afficher les rapports d'une inspection spécifique

```jsx
import ReportsList from './components/ReportsList';

function InspectionDetails() {
  const inspectionId = 456;
  
  return <ReportsList inspectionId={inspectionId} />;
}
```

### Afficher les factures

```jsx
import InvoicesList from './components/InvoicesList';

function MyInvoices() {
  const userId = 123;
  
  return <InvoicesList userId={userId} />;
}
```

### Afficher uniquement les factures en retard

```jsx
import InvoicesList from './components/InvoicesList';

function OverdueInvoices() {
  return <InvoicesList showOverdueOnly={true} />;
}
```

---

## 🔧 Utilisation du service API

### Importer le service

```javascript
import reportService from './services/reportService';
// ou
import { getAllReports, createInvoice } from './services/reportService';
```

### Exemples d'utilisation

#### Récupérer tous les rapports

```javascript
const reports = await getAllReports();
// Avec filtres
const userReports = await getAllReports({ user_id: 123 });
const inspectionReports = await getAllReports({ inspection_id: 456 });
```

#### Générer un nouveau rapport

```javascript
const newReport = await generateReport({
  inspection_id: 123,
  user_id: 456,
  report_type: 'inspection_certificate',
  send_email: true,
  inspection_data: {
    inspection_number: 'CT-2024-001',
    inspection_date: '2024-11-10T10:00:00Z',
    vehicle_registration: 'AB-123-CD',
    vehicle_brand: 'Renault',
    vehicle_model: 'Clio',
    status: 'passed',
    owner_email: 'client@example.com',
    // ... autres données
  }
});
```

#### Télécharger un rapport

```javascript
const downloadUrl = downloadReport('certificate_123_1699876543210.pdf');
window.open(downloadUrl, '_blank');
```

#### Créer une facture

```javascript
const invoice = await createInvoice({
  user_id: 456,
  amount: 70.00,
  send_email: true,
  customer_data: {
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com'
  }
});
```

#### Marquer une facture comme payée

```javascript
await updateInvoiceStatus(invoiceId, {
  status: 'paid',
  customer_email: 'client@example.com',
  customer_name: 'Jean Dupont'
});
```

#### Envoyer un rappel de paiement

```javascript
await sendPaymentReminder(invoiceId, {
  email: 'client@example.com',
  name: 'Jean Dupont'
});
```

---

## 🎨 Personnalisation

### Modifier les couleurs

Les composants utilisent Tailwind CSS. Vous pouvez personnaliser les couleurs :

```jsx
// Dans ReportsList.jsx ou InvoicesList.jsx
className="bg-blue-600" // Changer en bg-green-600, bg-purple-600, etc.
```

### Ajouter des fonctionnalités

#### Exemple : Ajouter un filtre par date

```jsx
const [dateFilter, setDateFilter] = useState('');

// Dans le composant
<input
  type="date"
  value={dateFilter}
  onChange={(e) => setDateFilter(e.target.value)}
/>

// Filtrer les résultats
const filteredReports = reports.filter(report => {
  if (!dateFilter) return true;
  return new Date(report.created_at).toDateString() === new Date(dateFilter).toDateString();
});
```

---

## 🔌 Intégration avec d'autres pages

### Dans la page d'inspection

Après qu'une inspection soit terminée, générer automatiquement le rapport :

```jsx
// InspectionPage.jsx
import { generateReport } from '../services/reportService';

const handleCompleteInspection = async (inspectionData) => {
  // 1. Terminer l'inspection
  await completeInspection(inspectionData);
  
  // 2. Générer le rapport automatiquement
  const report = await generateReport({
    inspection_id: inspectionData.id,
    user_id: inspectionData.user_id,
    report_type: 'inspection_certificate',
    send_email: true,
    inspection_data: inspectionData
  });
  
  // 3. Afficher un message de succès
  alert('Inspection terminée ! Le certificat a été envoyé par email.');
};
```

### Dans la page de paiement

Après un paiement réussi, créer automatiquement la facture :

```jsx
// PaymentPage.jsx
import { createInvoice } from '../services/reportService';

const handlePaymentSuccess = async (paymentData) => {
  // 1. Créer la facture
  const invoice = await createInvoice({
    user_id: paymentData.user_id,
    appointment_id: paymentData.appointment_id,
    amount: paymentData.amount,
    send_email: true,
    customer_data: {
      name: user.name,
      email: user.email
    }
  });
  
  // 2. Rediriger vers la page des factures
  navigate('/reports?tab=invoices');
};
```

---

## 📱 Responsive Design

Les composants sont déjà responsive grâce à Tailwind CSS :

- **Mobile** : Affichage en colonne
- **Tablet** : Grid 2 colonnes
- **Desktop** : Grid 3 colonnes

Pour personnaliser :

```jsx
// Exemple de grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Contenu */}
</div>
```

---

## 🧪 Tests

### Tester l'affichage des rapports

1. Démarrer le backend : `docker-compose up report-service`
2. Générer des données de test : `node test-report-service.js`
3. Ouvrir le frontend : `http://localhost:3000/reports`

### Tester le téléchargement de PDF

1. Cliquer sur le bouton "📄 Télécharger"
2. Le PDF devrait s'ouvrir dans un nouvel onglet

### Tester l'envoi d'emails

1. Cliquer sur "📧 Email"
2. Entrer un email et un nom
3. Vérifier les logs du report-service pour l'URL de prévisualisation

---

## 🔒 Sécurité

### Authentification

Les composants utilisent l'ID utilisateur depuis le localStorage. En production, utilisez un système d'authentification approprié :

```jsx
import { useAuth } from '../context/AuthContext';

function ReportsPage() {
  const { user } = useAuth();
  
  return <ReportsList userId={user.id} />;
}
```

### Validation

Le service API valide déjà les données côté backend. Ajoutez une validation côté frontend si nécessaire :

```jsx
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

if (!validateEmail(emailData.email)) {
  alert('Email invalide');
  return;
}
```

---

## 🐛 Dépannage

### Les rapports ne s'affichent pas

1. Vérifier que le report-service est démarré : `docker ps | grep report-service`
2. Vérifier l'API Gateway : `curl http://localhost:8000/api/reports`
3. Vérifier la console du navigateur pour les erreurs

### Les PDF ne se téléchargent pas

1. Vérifier que les fichiers existent : `ls services/report-service/reports/`
2. Vérifier l'URL de téléchargement dans la réponse API
3. Vérifier les CORS dans l'API Gateway

### Les emails ne s'envoient pas

1. En développement, c'est normal (mode test)
2. Vérifier les logs du report-service pour l'URL de prévisualisation
3. En production, vérifier la configuration EMAIL_* dans .env

---

## 📚 Ressources

- **Service API** : `src/services/reportService.js`
- **Documentation backend** : `services/report-service/README.md`
- **Exemples backend** : `services/report-service/EXAMPLES.md`
- **Tests** : `test-report-service.js`

---

## ✅ Checklist d'intégration

- [ ] Fichiers copiés dans le projet frontend
- [ ] Route ajoutée dans App.jsx
- [ ] Lien ajouté dans la navigation
- [ ] Backend démarré (`docker-compose up report-service`)
- [ ] Page testée (`http://localhost:3000/reports`)
- [ ] Téléchargement de PDF testé
- [ ] Envoi d'email testé
- [ ] Responsive design vérifié

---

**Le Report Service est maintenant intégré dans votre frontend ! 🎉**
