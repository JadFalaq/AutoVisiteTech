# Script pour redémarrer le frontend et vérifier les modifications

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "REDÉMARRAGE DU FRONTEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon dossier
if (-not (Test-Path "frontend\src\App.jsx")) {
    Write-Host "❌ ERREUR: Vous n'êtes pas dans le dossier AutoVisiteTech" -ForegroundColor Red
    Write-Host "Allez dans le bon dossier avec:" -ForegroundColor Yellow
    Write-Host "cd 'C:\Users\falaq\OneDrive\Desktop\Jad Falaq\Originalook\AutoVisiteTech'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Dossier correct" -ForegroundColor Green
Write-Host ""

# Vérifier les fichiers
Write-Host "Vérification des fichiers..." -ForegroundColor Cyan

$files = @(
    "frontend\src\App.jsx",
    "frontend\src\components\Navbar.jsx",
    "frontend\src\pages\ReportsPageSimple.jsx",
    "frontend\src\components\ReportsList.jsx",
    "frontend\src\components\InvoicesList.jsx",
    "frontend\src\services\reportService.js"
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file MANQUANT" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "❌ Des fichiers sont manquants!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Vérification du contenu de App.jsx..." -ForegroundColor Cyan

$appContent = Get-Content "frontend\src\App.jsx" -Raw
if ($appContent -match "ReportsPageSimple") {
    Write-Host "✅ ReportsPageSimple importé dans App.jsx" -ForegroundColor Green
} else {
    Write-Host "❌ ReportsPageSimple NON importé dans App.jsx" -ForegroundColor Red
    exit 1
}

if ($appContent -match "path=`"/reports`"") {
    Write-Host "✅ Route /reports présente dans App.jsx" -ForegroundColor Green
} else {
    Write-Host "❌ Route /reports ABSENTE dans App.jsx" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Vérification du contenu de Navbar.jsx..." -ForegroundColor Cyan

$navbarContent = Get-Content "frontend\src\components\Navbar.jsx" -Raw
if ($navbarContent -match "Rapports & Factures") {
    Write-Host "✅ Lien 'Rapports & Factures' présent dans Navbar.jsx" -ForegroundColor Green
} else {
    Write-Host "❌ Lien 'Rapports & Factures' ABSENT dans Navbar.jsx" -ForegroundColor Red
    exit 1
}

if ($navbarContent -match "Receipt") {
    Write-Host "✅ Icône Receipt importée dans Navbar.jsx" -ForegroundColor Green
} else {
    Write-Host "❌ Icône Receipt NON importée dans Navbar.jsx" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TOUS LES FICHIERS SONT CORRECTS !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Maintenant, suivez ces étapes:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Arrêtez le serveur frontend (Ctrl+C dans le terminal où il tourne)" -ForegroundColor White
Write-Host ""
Write-Host "2. Ouvrez un nouveau terminal PowerShell" -ForegroundColor White
Write-Host ""
Write-Host "3. Allez dans le dossier frontend:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Démarrez le serveur:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Attendez que le serveur démarre (vous verrez 'Local: http://localhost:3000')" -ForegroundColor White
Write-Host ""
Write-Host "6. Actualisez votre page dans le navigateur (F5 ou Ctrl+R)" -ForegroundColor White
Write-Host ""
Write-Host "7. Le lien 'Rapports & Factures' devrait maintenant apparaître dans la navbar!" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Proposer de tester l'API
Write-Host "Voulez-vous tester l'API maintenant? (O/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "O" -or $response -eq "o") {
    Write-Host ""
    Write-Host "Test de l'API Gateway..." -ForegroundColor Cyan
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
        Write-Host "✅ API Gateway OK" -ForegroundColor Green
        Write-Host $result | ConvertTo-Json
    } catch {
        Write-Host "❌ API Gateway ne répond pas" -ForegroundColor Red
        Write-Host "Démarrez-le avec: docker-compose up -d api-gateway" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "Test de l'API Reports..." -ForegroundColor Cyan
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:8000/api/reports" -Method Get
        Write-Host "✅ API Reports OK - $($result.Count) rapports" -ForegroundColor Green
    } catch {
        Write-Host "❌ API Reports ne répond pas" -ForegroundColor Red
        Write-Host "Démarrez-le avec: docker-compose up -d report-service" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Script terminé!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
