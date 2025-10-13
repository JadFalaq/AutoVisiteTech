@echo off
echo ========================================
echo Auto Visite Tech - Project Setup
echo ========================================

echo.
echo Creating project structure...

REM Create main directories
mkdir services 2>nul
mkdir frontend 2>nul
mkdir api-gateway 2>nul

REM Create all microservices directories
for %%s in (auth payment appointment scan parser chatbot inspection report) do (
    echo Creating %%s-service...
    mkdir services\%%s-service\src\controllers 2>nul
    mkdir services\%%s-service\src\models 2>nul
    mkdir services\%%s-service\src\routes 2>nul
    mkdir services\%%s-service\src\middleware 2>nul
    mkdir services\%%s-service\src\database 2>nul
    mkdir services\%%s-service\src\messaging 2>nul
    mkdir services\%%s-service\src\utils 2>nul
    mkdir services\%%s-service\tests 2>nul
)

REM Create frontend structure
echo Creating frontend structure...
mkdir frontend\src\components 2>nul
mkdir frontend\src\pages 2>nul
mkdir frontend\src\services 2>nul
mkdir frontend\src\context 2>nul
mkdir frontend\src\utils 2>nul
mkdir frontend\public 2>nul

REM Create API Gateway structure
echo Creating API Gateway structure...
mkdir api-gateway\src\routes 2>nul
mkdir api-gateway\src\middleware 2>nul
mkdir api-gateway\src\utils 2>nul

echo.
echo ========================================
echo Project structure created successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Copy .env.example to .env
echo 2. Update environment variables in .env
echo 3. Run: docker-compose up --build
echo.
pause
