@echo off
echo Generating service files...

REM Auth Service files
echo Creating Auth Service files...
(
echo const express = require('express'^);
echo const cors = require('cors'^);
echo const dotenv = require('dotenv'^);
echo dotenv.config(^);
echo const app = express(^);
echo app.use(cors(^)^);
echo app.use(express.json(^)^);
echo app.get('/health', (req, res^) =^> res.json({ status: 'OK', service: 'auth-service' })^);
echo const PORT = process.env.PORT ^|^| 8001;
echo app.listen(PORT, (^) =^> console.log(`Auth Service on port ${PORT}`^)^);
) > services\auth-service\src\server.js

REM Create package.json for each service
for %%s in (auth payment appointment scan chatbot inspection report) do (
    echo Creating package.json for %%s-service...
    (
    echo {
    echo   "name": "%%s-service",
    echo   "version": "1.0.0",
    echo   "main": "src/server.js",
    echo   "scripts": {
    echo     "start": "node src/server.js",
    echo     "dev": "nodemon src/server.js"
    echo   },
    echo   "dependencies": {
    echo     "express": "^4.18.2",
    echo     "pg": "^8.11.3",
    echo     "dotenv": "^16.3.1",
    echo     "cors": "^2.8.5",
    echo     "amqplib": "^0.10.3"
    echo   },
    echo   "devDependencies": {
    echo     "nodemon": "^3.0.2"
    echo   }
    echo }
    ) > services\%%s-service\package.json
    
    echo Creating Dockerfile for %%s-service...
    (
    echo FROM node:18-alpine
    echo WORKDIR /app
    echo COPY package*.json ./
    echo RUN npm install
    echo COPY . .
    echo EXPOSE 800X
    echo CMD ["npm", "run", "dev"]
    ) > services\%%s-service\Dockerfile
)

echo.
echo Service files generated!
echo Next: Run docker-compose up --build
pause
