FROM node:18-alpine

WORKDIR /app

# Crear directorios necesarios
RUN mkdir -p frontend backend

# Copiar package.json primero para aprovechar el caché de Docker
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Instalar dependencias del frontend
WORKDIR /app/frontend
COPY frontend .
RUN npm install
RUN npm run build

# Instalar dependencias del backend
WORKDIR /app/backend
COPY backend .
RUN npm install --omit=dev

# Copiar build del frontend al directorio public del backend
RUN mkdir -p public && \
    cp -r ../frontend/build/* public/

# Volver al directorio raíz
WORKDIR /app

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"] 