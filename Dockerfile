# Etapa de construcción del frontend
FROM node:18-alpine as frontend-builder

# Configurar directorio de trabajo para el frontend
WORKDIR /app/frontend

# Copiar package.json del frontend e instalar dependencias
COPY frontend/package*.json ./
RUN npm install

# Copiar código fuente del frontend y construir
COPY frontend/ ./
RUN npm run build

# Etapa del backend
FROM node:18-alpine

# Configurar directorio de trabajo
WORKDIR /app

# Copiar package.json del backend e instalar dependencias de producción
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copiar el código del backend
COPY backend/ ./

# Copiar el build del frontend a public
COPY --from=frontend-builder /app/frontend/build ./public

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3002

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["node", "server.js"]