# Test du Service d'Inscription

## Problème identifié
Le bouton "S'inscrire" ne répond pas lors du remplissage du formulaire.

## Modifications apportées
1. ✅ Ajout d'un état de chargement (`loading`)
2. ✅ Amélioration des logs dans la console
3. ✅ Indicateur visuel pendant l'inscription
4. ✅ Meilleure gestion des erreurs

## Comment tester

### 1. Ouvrir la console du navigateur
- Appuyez sur `F12` ou `Ctrl+Shift+I`
- Allez dans l'onglet "Console"

### 2. Accéder à la page d'inscription
- Ouvrez http://localhost:3000/register

### 3. Remplir le formulaire
- **Nom**: Test
- **Prénom**: User
- **Email**: test@example.com
- **Téléphone**: 0612345678
- **Mot de passe**: test123
- **Confirmer**: test123

### 4. Cliquer sur "S'inscrire"
Vous devriez voir dans la console:
```
📝 Tentative d'inscription avec: test@example.com
📋 Données du formulaire: {...}
📡 Envoi de la requête vers: http://localhost:8000/api/auth/register
📥 Réponse reçue, status: 201
✅ Inscription réussie: {...}
```

## Vérifications à faire

### Si le bouton ne fait rien:
1. **Vérifier la console** - Y a-t-il des erreurs JavaScript ?
2. **Vérifier les services** - Sont-ils tous lancés ?
   ```powershell
   docker-compose ps
   ```
3. **Vérifier l'API Gateway**
   ```powershell
   curl http://localhost:8000/health
   ```
4. **Vérifier le service auth**
   ```powershell
   curl http://localhost:8001/health
   ```

### Si erreur CORS:
L'API Gateway et le service auth ont déjà CORS activé, mais vérifiez les logs:
```powershell
docker logs auto-visite-tech-api-gateway-1 --tail 20
docker logs auto-visite-tech-auth-service-1 --tail 20
```

### Si erreur de connexion:
1. Vérifiez que le frontend accède bien à `http://localhost:8000` (API Gateway)
2. Vérifiez que l'API Gateway redirige vers `http://auth-service:8001`

## Test manuel avec curl (PowerShell)

```powershell
$body = @{
    email = "test@example.com"
    password = "test123"
    nom = "Test"
    prenom = "User"
    telephone = "0612345678"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/api/auth/register -Method POST -ContentType "application/json" -Body $body
```

## Résultat attendu
```json
{
  "message": "Inscription réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "nom": "Test",
    "prenom": "User",
    "telephone": "0612345678",
    "role": "client"
  }
}
```

## Actions suivantes
1. Ouvrez http://localhost:3000/register
2. Ouvrez la console (F12)
3. Remplissez le formulaire
4. Cliquez sur "S'inscrire"
5. Observez les logs dans la console
6. Partagez les messages d'erreur si le problème persiste
