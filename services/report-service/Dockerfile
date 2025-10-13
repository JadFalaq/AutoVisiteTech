FROM node:18-alpine

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Créer le dossier reports
RUN mkdir -p reports

# Exposer le port
EXPOSE 8008

# Démarrer avec nodemon pour hot reload
CMD ["npm", "run", "dev"]
