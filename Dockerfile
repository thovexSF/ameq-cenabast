FROM node:18-alpine

WORKDIR /app

# Crear directorios necesarios
RUN mkdir -p frontend backend

# Copiar package.json primero para aprovechar el caché de Docker
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Configurar y construir el frontend
WORKDIR /app/frontend
COPY frontend .
RUN npm install && \
    echo "Iniciando build del frontend..." && \
    ls -la && \
    npm run build && \
    echo "Build del frontend completado" && \
    ls -la build/

# Configurar el backend
WORKDIR /app/backend
COPY backend .
RUN npm install --omit=dev

# Crear directorio public y copiar el build
RUN mkdir -p public && \
    echo "Copiando archivos del frontend..." && \
    ls -la ../frontend/build/ && \
    cp -r ../frontend/build/* public/ && \
    echo "Archivos copiados correctamente" && \
    ls -la public/

# Volver al directorio raíz
WORKDIR /app

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"] 