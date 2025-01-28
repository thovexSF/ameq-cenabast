FROM node:18-alpine

# Instalar dependencias necesarias para el build
RUN apk add --no-cache python3 make g++

# Configurar directorio de trabajo
WORKDIR /app

# Copiar todos los archivos del proyecto
COPY . .

# Construir el frontend
RUN cd frontend && \
    npm install && \
    NODE_ENV=production CI=false npm run build && \
    echo "Frontend build completado" && \
    ls -la && \
    ls -la build/ || true && \
    pwd

# Instalar dependencias del backend y mover archivos del frontend
RUN cd backend && \
    npm install --omit=dev && \
    mkdir -p public && \
    cd .. && \
    echo "Contenido del directorio actual:" && \
    ls -la && \
    echo "Contenido del directorio frontend:" && \
    ls -la frontend/ && \
    echo "Contenido del directorio frontend/build:" && \
    ls -la frontend/build/ || true && \
    cp -r frontend/build/* backend/public/ && \
    echo "Archivos frontend copiados a public/"

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD cd backend && npm start