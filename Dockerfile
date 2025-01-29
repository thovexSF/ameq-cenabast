# Etapa 1: Construcción del frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Etapa 2: Configuración del backend
FROM node:18 AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ .
COPY --from=frontend-builder /app/frontend/build ./public

# Expone el puerto 3002 (o el que uses en tu servidor)
EXPOSE 3002

# Comando para ejecutar el backend
CMD ["node", "server.js"]