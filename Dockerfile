# Etapa de construcción del frontend
FROM node:19-alpine as frontend-builder

WORKDIR /app/frontend

# Copiar e instalar dependencias del frontend
COPY frontend/package*.json ./
RUN npm install

# Copiar y construir el frontend
COPY frontend/ ./
RUN npm run build

# Etapa final con el backend
FROM node:19-alpine

WORKDIR /app/backend

# Copiar e instalar dependencias del backend
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copiar archivos del backend
COPY backend/ ./

# Crear directorio public y copiar build del frontend
RUN mkdir -p public
COPY --from=frontend-builder /app/frontend/build ./public

# Variables de entorno por defecto
ENV PORT=3002
ENV NODE_ENV=production

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"]