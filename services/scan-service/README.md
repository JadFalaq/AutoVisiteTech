# 📷 Service de Scan - Auto Visite Tech

Service de scan et traitement de documents pour le système de contrôle technique automobile.

## 🎯 Fonctionnalités

### 1. Upload de Fichiers
- Upload de fichiers images (JPEG, PNG, GIF, WEBP) et PDF
- Upload multiple (jusqu'à 5 fichiers simultanément)
- Génération automatique de miniatures
- Optimisation automatique des images
- Limite de taille : 10MB par fichier

### 2. Génération de QR Codes
- QR codes pour rendez-vous (avec données du RDV)
- QR codes pour rapports de contrôle technique
- QR codes simples personnalisables
- Export en base64 et fichier PNG

### 3. Lecture de QR Codes
- Scan de QR codes depuis images uploadées
- Décodage automatique des données JSON
- Support des QR codes de rendez-vous et rapports

### 4. OCR (Reconnaissance de Texte)
- **Extraction de carte grise** : Détection automatique des informations
  - Numéro d'immatriculation
  - Marque et modèle
  - VIN (numéro de série)
  - Date de première immatriculation
  - Titulaire
  - Puissance fiscale
  - Type d'énergie
  - Nombre de places
  
- **Extraction de procès-verbal** : Analyse des PV de contrôle technique
  - Numéro de PV
  - Date de contrôle
  - Immatriculation
  - Résultat (favorable/défavorable)
  - Kilométrage

- **Extraction de texte générique** : OCR sur n'importe quelle image

### 5. Traitement d'Images
- Redimensionnement et optimisation
- Création de miniatures
- Amélioration pour OCR (niveaux de gris, netteté)
- Vérification de qualité d'image

## 📡 API Endpoints

### Upload de Fichiers

#### Upload simple
```http
POST /api/scans/upload
Content-Type: multipart/form-data

Body:
- file: [fichier image/PDF]
- user_id: [ID utilisateur]
- appointment_id: [ID rendez-vous] (optionnel)
- document_type: [type de document]

Response:
{
  "message": "Fichier uploadé et traité avec succès",
  "scan": { ... },
  "files": {
    "original": "/uploads/xxx.jpg",
    "thumbnail": "/uploads/thumbnails/thumb_xxx.jpg",
    "optimized": "/uploads/optimized/opt_xxx.jpg"
  }
}
```

#### Upload multiple
```http
POST /api/scans/upload-multiple
Content-Type: multipart/form-data

Body:
- files: [tableau de fichiers, max 5]
- user_id: [ID utilisateur]
- appointment_id: [ID rendez-vous] (optionnel)
- document_type: [type de document]
```

### Génération de QR Codes

#### QR Code pour rendez-vous
```http
POST /api/scans/generate-qr/appointment
Content-Type: application/json

{
  "appointmentId": 123,
  "userId": 456,
  "date": "2024-12-15",
  "time": "10:00"
}

Response:
{
  "message": "QR Code généré avec succès",
  "qrCode": "data:image/png;base64,...",
  "filePath": "/uploads/qrcodes/qr_appointment_123_xxx.png",
  "data": "{...}"
}
```

#### QR Code pour rapport
```http
POST /api/scans/generate-qr/report
Content-Type: application/json

{
  "reportId": 789,
  "vehicleRegistration": "AB-123-CD",
  "inspectionDate": "2024-12-15",
  "result": "favorable"
}
```

#### QR Code simple
```http
POST /api/scans/generate-qr/simple
Content-Type: application/json

{
  "text": "Votre texte ici"
}
```

### Lecture de QR Code

```http
POST /api/scans/read-qr
Content-Type: multipart/form-data

Body:
- qrImage: [image contenant un QR code]

Response:
{
  "message": "QR Code lu avec succès",
  "success": true,
  "data": { ... },
  "rawData": "..."
}
```

### OCR - Extraction de Données

#### Carte grise
```http
POST /api/scans/ocr/carte-grise
Content-Type: multipart/form-data

Body:
- carteGrise: [image de la carte grise]
- user_id: [ID utilisateur] (optionnel)
- appointment_id: [ID rendez-vous] (optionnel)

Response:
{
  "message": "Carte grise analysée avec succès",
  "success": true,
  "data": {
    "immatriculation": "AB-123-CD",
    "marque": "RENAULT",
    "modele": "CLIO",
    "vin": "VF1XXXXXXXXXX",
    "dateImmatriculation": "15/06/2020",
    "titulaire": "DUPONT JEAN",
    "puissanceFiscale": "5",
    "energie": "ESSENCE",
    "places": "5"
  },
  "confidence": 85.5,
  "filePath": "/uploads/xxx.jpg"
}
```

#### Procès-verbal
```http
POST /api/scans/ocr/pv
Content-Type: multipart/form-data

Body:
- pv: [image du procès-verbal]

Response:
{
  "message": "Procès-verbal analysé avec succès",
  "success": true,
  "data": {
    "numeroPV": "PV-2024-12345",
    "dateControle": "15/12/2024",
    "immatriculation": "AB-123-CD",
    "resultat": "FAVORABLE",
    "kilometrage": "45000"
  },
  "confidence": 82.3
}
```

#### Texte générique
```http
POST /api/scans/ocr/text
Content-Type: multipart/form-data

Body:
- image: [image contenant du texte]
- lang: "fra" (optionnel, défaut: français)

Response:
{
  "message": "Texte extrait avec succès",
  "text": "Texte extrait...",
  "confidence": 90.2,
  "words": [...],
  "lines": [...]
}
```

### Vérification de Qualité

```http
POST /api/scans/check-quality
Content-Type: multipart/form-data

Body:
- image: [image à vérifier]

Response:
{
  "message": "Qualité de l'image vérifiée",
  "width": 1920,
  "height": 1080,
  "format": "jpeg",
  "size": 245678,
  "isHighResolution": true,
  "quality": "good"
}
```

### Récupération de Scans

#### Tous les scans
```http
GET /api/scans
GET /api/scans?user_id=123
GET /api/scans?appointment_id=456
```

#### Scan par ID
```http
GET /api/scans/:id
```

### Suppression

```http
DELETE /api/scans/:id
```

## 🗂️ Structure des Dossiers

```
scan-service/
├── src/
│   ├── config/
│   │   └── multer.js          # Configuration upload
│   ├── utils/
│   │   ├── qrCodeGenerator.js # Génération QR codes
│   │   ├── qrCodeReader.js    # Lecture QR codes
│   │   ├── ocrProcessor.js    # OCR et extraction
│   │   └── imageProcessor.js  # Traitement images
│   └── server.js              # Serveur principal
├── uploads/                   # Fichiers uploadés
│   ├── thumbnails/           # Miniatures
│   ├── optimized/            # Images optimisées
│   ├── enhanced/             # Images améliorées pour OCR
│   └── qrcodes/              # QR codes générés
└── package.json
```

## 🔧 Technologies Utilisées

- **Express.js** : Framework web
- **Multer** : Gestion des uploads
- **Sharp** : Traitement d'images
- **Tesseract.js** : OCR (reconnaissance de texte)
- **QRCode** : Génération de QR codes
- **jsQR** : Lecture de QR codes
- **Jimp** : Manipulation d'images
- **PostgreSQL** : Base de données

## 🚀 Utilisation

### Démarrage
```bash
npm install
npm start
```

### Développement
```bash
npm run dev
```

## 📝 Cas d'Usage

### 1. Réservation de Rendez-vous
1. Client upload sa carte grise
2. OCR extrait automatiquement les données
3. Formulaire pré-rempli avec les informations du véhicule
4. QR code généré pour le rendez-vous
5. Client reçoit le QR code par email

### 2. Arrivée au Centre
1. Client présente son QR code
2. Scan du QR code pour récupérer les infos du RDV
3. Accès instantané au dossier

### 3. Après Contrôle
1. Génération du rapport avec QR code
2. QR code contient les résultats du contrôle
3. Client peut vérifier l'authenticité du rapport

## ⚠️ Notes Importantes

- Les fichiers OCR nécessitent Tesseract.js qui télécharge des données de langue (~50MB pour le français)
- La première utilisation de l'OCR peut être lente
- Les images de mauvaise qualité donnent des résultats OCR moins précis
- Recommandé : images haute résolution (min 800x600) pour l'OCR

## 🔒 Sécurité

- Validation des types de fichiers (images et PDF uniquement)
- Limite de taille de fichier (10MB)
- Nettoyage automatique des fichiers temporaires
- Stockage sécurisé des fichiers uploadés

## 📊 Performance

- Miniatures générées automatiquement pour affichage rapide
- Images optimisées pour réduire la bande passante
- Support du cache pour les fichiers statiques
