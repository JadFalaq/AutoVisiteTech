@echo off
echo ========================================
echo   Test des Services Backend
echo ========================================
echo.

echo [1/3] Test API Gateway (port 8000)...
curl -s http://localhost:8000/health
if %ERRORLEVEL% NEQ 0 (
    echo ❌ API Gateway n'est pas accessible
) else (
    echo ✅ API Gateway OK
)
echo.

echo [2/3] Test Auth Service (port 8001)...
curl -s http://localhost:8001/health
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Auth Service n'est pas accessible
) else (
    echo ✅ Auth Service OK
)
echo.

echo [3/3] Test Frontend (port 3000)...
curl -s http://localhost:3000
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend n'est pas accessible
) else (
    echo ✅ Frontend OK
)
echo.

echo ========================================
echo   Résultat du diagnostic
echo ========================================
echo.
echo Si tous les services sont OK, le probleme vient d'ailleurs.
echo Si un service est inaccessible, lancez-le d'abord.
echo.
pause
