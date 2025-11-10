@echo off
echo ========================================
echo TEST FRONTEND - PAGE REPORTS
echo ========================================
echo.

echo 1. Verification des fichiers...
echo.

if exist "frontend\src\pages\ReportsPageSimple.jsx" (
    echo [OK] ReportsPageSimple.jsx existe
) else (
    echo [ERREUR] ReportsPageSimple.jsx manquant
)

if exist "frontend\src\components\ReportsList.jsx" (
    echo [OK] ReportsList.jsx existe
) else (
    echo [ERREUR] ReportsList.jsx manquant
)

if exist "frontend\src\components\InvoicesList.jsx" (
    echo [OK] InvoicesList.jsx existe
) else (
    echo [ERREUR] InvoicesList.jsx manquant
)

if exist "frontend\src\services\reportService.js" (
    echo [OK] reportService.js existe
) else (
    echo [ERREUR] reportService.js manquant
)

echo.
echo 2. Verification du backend...
echo.

curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] API Gateway accessible
) else (
    echo [ERREUR] API Gateway non accessible
    echo Demarrez avec: docker-compose up -d api-gateway
)

curl -s http://localhost:8008/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Report Service accessible
) else (
    echo [ERREUR] Report Service non accessible
    echo Demarrez avec: docker-compose up -d report-service
)

echo.
echo 3. Test des APIs...
echo.

curl -s http://localhost:8000/api/reports >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] API Reports accessible
) else (
    echo [ERREUR] API Reports non accessible
)

curl -s http://localhost:8000/api/invoices >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] API Invoices accessible
) else (
    echo [ERREUR] API Invoices non accessible
)

echo.
echo 4. Instructions...
echo.
echo Pour tester la page:
echo.
echo 1. Assurez-vous que le frontend tourne:
echo    cd frontend
echo    npm run dev
echo.
echo 2. Ouvrez votre navigateur:
echo    http://localhost:3000/reports
echo.
echo 3. Pour voir le lien dans la navbar:
echo    - Connectez-vous d'abord
echo    - Ou allez directement sur /reports
echo.
echo 4. Generez des donnees de test:
echo    node test-report-service.js
echo.
echo ========================================
echo.
pause
