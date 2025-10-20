# Création du compte administrateur
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Création du compte ADMINISTRATEUR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$admin = @{
    email = "admin@autovisitetech.com"
    password = "Admin123!"
    nom = "Administrateur"
    prenom = "Système"
    telephone = "0600000000"
    role = "admin"
} | ConvertTo-Json

Write-Host "Création du compte admin..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8001/api/auth/register" `
        -Method POST `
        -Body $admin `
        -ContentType "application/json"
    
    Write-Host ""
    Write-Host "✅ COMPTE ADMIN CRÉÉ AVEC SUCCÈS !" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  IDENTIFIANTS ADMINISTRATEUR" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Email:        admin@autovisitetech.com" -ForegroundColor Green
    Write-Host "Mot de passe: Admin123!" -ForegroundColor Green
    Write-Host "Rôle:         Administrateur" -ForegroundColor Green
    Write-Host ""
    Write-Host "Connectez-vous sur: http://localhost:3000/login" -ForegroundColor Cyan
    Write-Host ""
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host ""
        Write-Host "⚠️  Le compte admin existe déjà" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Email:        admin@autovisitetech.com" -ForegroundColor Yellow
        Write-Host "Mot de passe: Admin123!" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
