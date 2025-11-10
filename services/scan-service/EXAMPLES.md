# 📋 Exemples d'Utilisation du Service de Scan

## 🔧 Avec cURL

### 1. Upload d'une Carte Grise avec OCR

```bash
curl -X POST http://localhost:8004/api/scans/ocr/carte-grise \
  -F "carteGrise=@/path/to/carte-grise.jpg" \
  -F "user_id=123" \
  -F "appointment_id=456"
```

### 2. Upload Simple de Fichier

```bash
curl -X POST http://localhost:8004/api/scans/upload \
  -F "file=@/path/to/document.jpg" \
  -F "user_id=123" \
  -F "document_type=carte_grise"
```

### 3. Générer un QR Code pour Rendez-vous

```bash
curl -X POST http://localhost:8004/api/scans/generate-qr/appointment \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": 123,
    "userId": 456,
    "date": "2024-12-15",
    "time": "10:00"
  }'
```

### 4. Lire un QR Code

```bash
curl -X POST http://localhost:8004/api/scans/read-qr \
  -F "qrImage=@/path/to/qr-code.png"
```

## 💻 Avec JavaScript (Frontend)

### 1. Upload de Carte Grise avec Extraction OCR

```javascript
async function uploadCarteGrise(file, userId, appointmentId) {
  const formData = new FormData();
  formData.append('carteGrise', file);
  formData.append('user_id', userId);
  formData.append('appointment_id', appointmentId);

  try {
    const response = await fetch('http://localhost:8004/api/scans/ocr/carte-grise', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Données extraites:', result.data);
      // Pré-remplir le formulaire avec les données
      document.getElementById('immatriculation').value = result.data.immatriculation;
      document.getElementById('marque').value = result.data.marque;
      document.getElementById('modele').value = result.data.modele;
      // etc...
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Utilisation avec un input file
document.getElementById('carteGriseInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    uploadCarteGrise(file, 123, 456);
  }
});
```

### 2. Générer et Afficher un QR Code

```javascript
async function generateAppointmentQR(appointmentData) {
  try {
    const response = await fetch('http://localhost:8004/api/scans/generate-qr/appointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });

    const result = await response.json();
    
    // Afficher le QR code dans une image
    const img = document.getElementById('qrCodeImage');
    img.src = result.qrCode;
    
    console.log('QR Code généré:', result.filePath);
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exemple d'utilisation
generateAppointmentQR({
  appointmentId: 123,
  userId: 456,
  date: '2024-12-15',
  time: '10:00'
});
```

### 3. Upload Multiple de Documents

```javascript
async function uploadMultipleDocuments(files, userId, appointmentId) {
  const formData = new FormData();
  
  // Ajouter tous les fichiers
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  
  formData.append('user_id', userId);
  formData.append('appointment_id', appointmentId);
  formData.append('document_type', 'factures_reparation');

  try {
    const response = await fetch('http://localhost:8004/api/scans/upload-multiple', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log(`${result.scans.length} fichiers uploadés avec succès`);
  } catch (error) {
    console.error('Erreur:', error);
  }
}
```

### 4. Scanner un QR Code depuis la Caméra

```javascript
async function scanQRFromCamera() {
  try {
    // Obtenir l'accès à la caméra
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById('video');
    video.srcObject = stream;
    
    // Capturer une image
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    // Convertir en blob
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('qrImage', blob, 'qr-scan.png');
      
      const response = await fetch('http://localhost:8004/api/scans/read-qr', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('QR Code décodé:', result.data);
        // Traiter les données du rendez-vous
        if (result.data.type === 'appointment') {
          loadAppointment(result.data.appointmentId);
        }
      }
      
      // Arrêter la caméra
      stream.getTracks().forEach(track => track.stop());
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
}
```

### 5. Vérifier la Qualité d'une Image avant Upload

```javascript
async function checkImageQuality(file) {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('http://localhost:8004/api/scans/check-quality', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.quality === 'poor') {
      alert('La qualité de l\'image est insuffisante. Veuillez prendre une photo plus nette.');
      return false;
    }
    
    console.log('Qualité:', result.quality);
    console.log('Résolution:', `${result.width}x${result.height}`);
    return true;
  } catch (error) {
    console.error('Erreur:', error);
    return false;
  }
}

// Utilisation
document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const isGoodQuality = await checkImageQuality(file);
    if (isGoodQuality) {
      // Procéder à l'upload
      uploadCarteGrise(file, userId, appointmentId);
    }
  }
});
```

## 🎨 Composant React Complet

```jsx
import React, { useState } from 'react';

function CarteGriseUploader({ userId, appointmentId, onDataExtracted }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload et OCR
    setLoading(true);
    const formData = new FormData();
    formData.append('carteGrise', file);
    formData.append('user_id', userId);
    formData.append('appointment_id', appointmentId);

    try {
      const response = await fetch('http://localhost:8004/api/scans/ocr/carte-grise', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setExtractedData(result.data);
        onDataExtracted(result.data);
      } else {
        alert('Erreur lors de l\'extraction des données');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="carte-grise-uploader">
      <h3>Scanner votre Carte Grise</h3>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading}
      />

      {preview && (
        <div className="preview">
          <img src={preview} alt="Prévisualisation" style={{ maxWidth: '300px' }} />
        </div>
      )}

      {loading && <p>Analyse en cours...</p>}

      {extractedData && (
        <div className="extracted-data">
          <h4>Données Extraites</h4>
          <p><strong>Immatriculation:</strong> {extractedData.immatriculation}</p>
          <p><strong>Marque:</strong> {extractedData.marque}</p>
          <p><strong>Modèle:</strong> {extractedData.modele}</p>
          <p><strong>VIN:</strong> {extractedData.vin}</p>
          <p><strong>Date:</strong> {extractedData.dateImmatriculation}</p>
          <p><strong>Énergie:</strong> {extractedData.energie}</p>
          <p className="confidence">
            Confiance: {extractedData.confidence?.toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}

export default CarteGriseUploader;
```

## 📱 Exemple HTML Complet

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Scanner Carte Grise</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
    .upload-area { border: 2px dashed #ccc; padding: 40px; text-align: center; margin: 20px 0; }
    .preview img { max-width: 100%; margin: 20px 0; }
    .extracted-data { background: #f5f5f5; padding: 20px; border-radius: 8px; }
    .loading { color: #0066cc; }
    .error { color: #cc0000; }
  </style>
</head>
<body>
  <h1>📷 Scanner Carte Grise</h1>
  
  <div class="upload-area">
    <input type="file" id="carteGriseInput" accept="image/*">
    <p>Sélectionnez ou déposez votre carte grise</p>
  </div>

  <div id="preview" class="preview"></div>
  <div id="loading" class="loading" style="display:none;">Analyse en cours...</div>
  <div id="result" class="extracted-data" style="display:none;"></div>

  <script>
    document.getElementById('carteGriseInput').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('preview').innerHTML = 
          `<img src="${e.target.result}" alt="Carte Grise">`;
      };
      reader.readAsDataURL(file);

      // Upload et OCR
      document.getElementById('loading').style.display = 'block';
      document.getElementById('result').style.display = 'none';

      const formData = new FormData();
      formData.append('carteGrise', file);
      formData.append('user_id', '123');

      try {
        const response = await fetch('http://localhost:8004/api/scans/ocr/carte-grise', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        
        document.getElementById('loading').style.display = 'none';

        if (result.success) {
          const data = result.data;
          document.getElementById('result').innerHTML = `
            <h3>✅ Données Extraites</h3>
            <p><strong>Immatriculation:</strong> ${data.immatriculation || 'N/A'}</p>
            <p><strong>Marque:</strong> ${data.marque || 'N/A'}</p>
            <p><strong>Modèle:</strong> ${data.modele || 'N/A'}</p>
            <p><strong>VIN:</strong> ${data.vin || 'N/A'}</p>
            <p><strong>Date:</strong> ${data.dateImmatriculation || 'N/A'}</p>
            <p><strong>Titulaire:</strong> ${data.titulaire || 'N/A'}</p>
            <p><strong>Puissance:</strong> ${data.puissanceFiscale || 'N/A'} CV</p>
            <p><strong>Énergie:</strong> ${data.energie || 'N/A'}</p>
            <p><strong>Places:</strong> ${data.places || 'N/A'}</p>
            <p style="color: ${result.confidence > 70 ? 'green' : 'orange'}">
              Confiance: ${result.confidence?.toFixed(1)}%
            </p>
          `;
          document.getElementById('result').style.display = 'block';
        } else {
          alert('Erreur lors de l\'extraction des données');
        }
      } catch (error) {
        document.getElementById('loading').style.display = 'none';
        alert('Erreur: ' + error.message);
      }
    });
  </script>
</body>
</html>
```

## 🧪 Tests avec Postman

### Collection Postman

Importez cette collection dans Postman :

```json
{
  "info": {
    "name": "Scan Service API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Upload Carte Grise OCR",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "carteGrise",
              "type": "file",
              "src": "/path/to/carte-grise.jpg"
            },
            {
              "key": "user_id",
              "value": "123",
              "type": "text"
            }
          ]
        },
        "url": {
          "raw": "http://localhost:8004/api/scans/ocr/carte-grise",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8004",
          "path": ["api", "scans", "ocr", "carte-grise"]
        }
      }
    },
    {
      "name": "Generate QR Code",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"appointmentId\": 123,\n  \"userId\": 456,\n  \"date\": \"2024-12-15\",\n  \"time\": \"10:00\"\n}"
        },
        "url": {
          "raw": "http://localhost:8004/api/scans/generate-qr/appointment",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8004",
          "path": ["api", "scans", "generate-qr", "appointment"]
        }
      }
    }
  ]
}
```
