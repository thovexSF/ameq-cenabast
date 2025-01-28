FROM node:18-alpine

# Instalar dependencias necesarias
RUN apk add --no-cache python3 make g++

# Configurar directorio de trabajo
WORKDIR /app

# Copiar todos los archivos de configuración primero
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Instalar dependencias del backend
RUN cd backend && npm install --production

# Instalar dependencias del frontend
RUN cd frontend && npm install

# Copiar el resto de los archivos
COPY . .

# Construir el frontend
RUN cd frontend && \
    npm run build && \
    cd ../backend && \
    mkdir -p public && \
    cp -r ../frontend/build/* public/

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"]