FROM node:18-alpine

WORKDIR /app

# Instalar dependencias necesarias para el build
RUN apk add --no-cache python3 make g++

# Crear directorios necesarios
RUN mkdir -p frontend backend

# Configurar y construir el frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN echo "Iniciando build del frontend..." && \
    NODE_ENV=production CI=false npm run build && \
    echo "Build del frontend completado" && \
    ls -la build/

# Configurar el backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend .

# Crear directorio public y copiar el build
RUN mkdir -p public && \
    echo "Copiando archivos del frontend..." && \
    cp -r ../frontend/build/* public/ && \
    echo "Archivos copiados correctamente" && \
    ls -la public/

# Volver al directorio raíz
WORKDIR /app
COPY package*.json ./

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD cd backend && npm start 