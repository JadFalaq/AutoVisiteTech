@echo off
chcp 65001 >nul
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║          REDÉMARRAGE DU FRONTEND                           ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.

echo ⚠️  IMPORTANT : Ce script va vous guider pour redémarrer le frontend
echo.
echo.

echo ═══════════════════════════════════════════════════════════════
echo   ÉTAPE 1 : Arrêter le frontend actuel
echo ═══════════════════════════════════════════════════════════════
echo.
echo Dans le terminal où le frontend tourne :
echo.
echo   1. Cliquez sur le terminal
echo   2. Appuyez sur Ctrl + C
echo   3. Le serveur va s'arrêter
echo.
pause
echo.

echo ═══════════════════════════════════════════════════════════════
echo   ÉTAPE 2 : Vérification des fichiers
echo ═══════════════════════════════════════════════════════════════
echo.

if exist "frontend\src\pages\ReportsPageSimple.jsx" (
    echo ✅ ReportsPageSimple.jsx existe
) else (
    echo ❌ ERREUR : ReportsPageSimple.jsx manquant
    echo.
    echo Le fichier n'existe pas. Contactez le support.
    pause
    exit /b 1
)

if exist "frontend\src\components\ReportsList.jsx" (
    echo ✅ ReportsList.jsx existe
) else (
    echo ❌ ERREUR : ReportsList.jsx manquant
    pause
    exit /b 1
)

if exist "frontend\src\services\reportService.js" (
    echo ✅ reportService.js existe
) else (
    echo ❌ ERREUR : reportService.js manquant
    pause
    exit /b 1
)

echo.
echo ✅ Tous les fichiers sont présents !
echo.
pause
echo.

echo ═══════════════════════════════════════════════════════════════
echo   ÉTAPE 3 : Redémarrer le serveur
echo ═══════════════════════════════════════════════════════════════
echo.
echo Maintenant, dans le même terminal où vous avez arrêté le serveur :
echo.
echo   1. Tapez : cd frontend
echo   2. Appuyez sur Entrée
echo   3. Tapez : npm run dev
echo   4. Appuyez sur Entrée
echo.
echo Attendez de voir ce message :
echo   ➜  Local:   http://localhost:3000/
echo.
pause
echo.

echo ═══════════════════════════════════════════════════════════════
echo   ÉTAPE 4 : Actualiser le navigateur
echo ═══════════════════════════════════════════════════════════════
echo.
echo Dans votre navigateur :
echo.
echo   1. Allez sur http://localhost:3000
echo   2. Appuyez sur F5 (ou Ctrl + R)
echo   3. La page va se recharger
echo.
echo Le lien "Rapports & Factures" devrait maintenant apparaître !
echo.
pause
echo.

echo ═══════════════════════════════════════════════════════════════
echo   VÉRIFICATION
echo ═══════════════════════════════════════════════════════════════
echo.
echo Le lien "Rapports & Factures" est-il visible ? (O/N)
set /p visible="Réponse : "
echo.

if /i "%visible%"=="O" (
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║                                                            ║
    echo ║              ✅ PARFAIT ! ÇA MARCHE !                      ║
    echo ║                                                            ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo Vous pouvez maintenant cliquer sur le lien pour accéder
    echo à la page Rapports ^& Factures.
    echo.
) else (
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║                                                            ║
    echo ║              ⚠️  DÉPANNAGE                                 ║
    echo ║                                                            ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo Essayez ces solutions :
    echo.
    echo 1. Videz le cache du navigateur :
    echo    - Appuyez sur Ctrl + Shift + R
    echo    - Ou Ctrl + F5
    echo.
    echo 2. Ouvrez la console du navigateur :
    echo    - Appuyez sur F12
    echo    - Regardez s'il y a des erreurs en rouge
    echo.
    echo 3. Vérifiez que vous êtes connecté :
    echo    - Vous devez voir votre nom en haut à droite
    echo.
    echo 4. Testez l'accès direct :
    echo    - Tapez : http://localhost:3000/reports
    echo    - La page devrait s'afficher
    echo.
    echo 5. Ouvrez test-reports-page.html :
    echo    - Double-cliquez sur le fichier
    echo    - Testez l'API avec les boutons
    echo.
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo   FICHIERS UTILES
echo ═══════════════════════════════════════════════════════════════
echo.
echo • SOLUTION_FINALE_REPORTS.md    → Guide complet
echo • test-reports-page.html        → Test de l'API
echo • RESTART_FRONTEND.ps1          → Script PowerShell
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
pause
