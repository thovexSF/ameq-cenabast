# Etapa de construcción del frontend
FROM node:18-alpine as frontend-builder

# Instalar dependencias necesarias
RUN apk add --no-cache python3 make g++

# Configurar directorio de trabajo
WORKDIR /app/frontend

# Copiar package.json y package-lock.json del frontend
COPY frontend/package*.json ./

# Instalar dependencias del frontend
RUN npm install

# Copiar archivos del frontend
COPY frontend/ ./

# Construir el frontend
RUN npm run build

# Etapa final con el backend
FROM node:18-alpine

# Instalar dependencias necesarias
RUN apk add --no-cache python3 make g++

# Configurar directorio de trabajo
WORKDIR /app/backend

# Copiar package.json y package-lock.json del backend
COPY backend/package*.json ./

# Instalar dependencias de producción del backend
RUN npm install --omit=dev

# Copiar archivos del backend
COPY backend/ ./

# Crear directorio public y copiar build del frontend
RUN mkdir -p public
COPY --from=frontend-builder /app/frontend/build ./public

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"]