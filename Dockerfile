FROM node:18-alpine

WORKDIR /app

# Copiar package.json primero para aprovechar el caché de Docker
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Instalar dependencias del frontend
RUN cd frontend && \
    npm install && \
    cd ..

# Copiar el resto del código
COPY . .

# Construir el frontend
RUN cd frontend && \
    echo "Building frontend..." && \
    NODE_ENV=production npm run build && \
    echo "Frontend build completed" && \
    cd ..

# Instalar dependencias del backend
RUN cd backend && \
    npm install --omit=dev && \
    cd ..

# Crear directorio public y copiar build
RUN mkdir -p backend/public && \
    ls frontend/build && \
    cp -r frontend/build/* backend/public/ || exit 1

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"] 