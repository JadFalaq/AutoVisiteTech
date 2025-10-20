# Test de connexion
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test de Connexion API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$body = @{
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

Write-Host "Envoi de la requête de connexion..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8001/api/auth/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host ""
    Write-Host "✅ CONNEXION RÉUSSIE !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Token reçu:" -ForegroundColor Green
    Write-Host $response.token
    Write-Host ""
    Write-Host "Utilisateur:" -ForegroundColor Green
    $response.user | ConvertTo-Json
} catch {
    Write-Host ""
    Write-Host "❌ ERREUR DE CONNEXION" -ForegroundColor Red
    Write-Host "Détails: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Réponse du serveur:" -ForegroundColor Red
    $_.ErrorDetails.Message
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
