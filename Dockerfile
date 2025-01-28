# Etapa de construcción del frontend
FROM node:18-alpine as frontend-builder

# Configurar el directorio de trabajo del frontend
WORKDIR /app/frontend

# Copiar package.json y package-lock.json del frontend
COPY frontend/package*.json ./

# Instalar dependencias del frontend
RUN npm install

# Copiar el resto del código del frontend
COPY frontend/ ./

# Construir el frontend
RUN npm run build

# Etapa final para el backend
FROM node:18-alpine

# Configurar el directorio de trabajo del backend
WORKDIR /app/backend

# Copiar package.json y package-lock.json del backend
COPY backend/package*.json ./

# Instalar dependencias del backend
RUN npm install 

# Copiar el resto del código del backend
COPY backend/ ./

# Copiar el build del frontend
COPY --from=frontend-builder /app/frontend/build ./public

# Variables de entorno por defecto
ENV PORT=3002
ENV NODE_ENV=production

# Exponer el puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"]