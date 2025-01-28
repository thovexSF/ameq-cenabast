FROM node:18-alpine

# Instalar dependencias necesarias
RUN apk add --no-cache python3 make g++

# Configurar directorio de trabajo
WORKDIR /app

# Copiar package.json primero para aprovechar el cache de Docker
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Instalar dependencias
RUN npm run install-all

# Copiar el resto de los archivos
COPY . .

# Construir el frontend
RUN cd frontend && npm run build

# Preparar el backend
RUN cd backend && \
    mkdir -p public && \
    cp -r ../frontend/build/* public/

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"]