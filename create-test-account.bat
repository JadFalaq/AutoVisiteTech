@echo off
echo ========================================
echo   Creation d'un compte de test
echo ========================================
echo.

echo Envoi de la requete d'inscription...
curl -X POST http://localhost:8001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"nom\":\"Test\",\"prenom\":\"User\",\"telephone\":\"0612345678\"}"

echo.
echo.
echo ========================================
echo   Compte cree avec succes !
echo ========================================
echo.
echo Email: test@example.com
echo Mot de passe: test123
echo.
echo Vous pouvez maintenant vous connecter sur:
echo http://localhost:3000/login
echo.
pause
