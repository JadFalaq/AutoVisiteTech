# Création de plusieurs comptes de test
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Création de comptes de test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$accounts = @(
    @{
        email = "admin@autovisite.com"
        password = "admin123"
        nom = "Admin"
        prenom = "Système"
        telephone = "0600000000"
    },
    @{
        email = "user@test.com"
        password = "user123"
        nom = "Utilisateur"
        prenom = "Test"
        telephone = "0611111111"
    },
    @{
        email = "demo@demo.com"
        password = "demo123"
        nom = "Demo"
        prenom = "Account"
        telephone = "0622222222"
    }
)

foreach ($account in $accounts) {
    Write-Host "Création du compte: $($account.email)" -ForegroundColor Yellow
    
    try {
        $body = $account | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:8001/api/auth/register" `
            -Method POST `
            -Body $body `
            -ContentType "application/json"
        
        Write-Host "✅ Compte créé avec succès!" -ForegroundColor Green
        Write-Host ""
    } catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Host "⚠️  Compte déjà existant" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        }
        Write-Host ""
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Comptes disponibles" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. test@example.com / test123" -ForegroundColor Green
Write-Host "2. admin@autovisite.com / admin123" -ForegroundColor Green
Write-Host "3. user@test.com / user123" -ForegroundColor Green
Write-Host "4. demo@demo.com / demo123" -ForegroundColor Green
Write-Host ""
Write-Host "Connectez-vous sur: http://localhost:3000/login" -ForegroundColor Cyan
Write-Host ""
