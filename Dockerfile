# Etapa 1: Construcción del frontend
FROM node:18 AS frontend-builder

# Define el directorio de trabajo para el frontend
WORKDIR /app/frontend

# Copia los archivos necesarios para instalar las dependencias del frontend
COPY frontend/package*.json ./

# Instala las dependencias del frontend
RUN npm install

# Copia el resto del frontend
COPY frontend/ .

# Construye el frontend
RUN npm run build

# Etapa 2: Configuración del backend
FROM node:18 AS backend

# Define el directorio de trabajo para el backend
WORKDIR /app/backend

# Copia los archivos necesarios para instalar las dependencias del backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ .
COPY --from=frontend-builder /app/frontend/build ./public

# Expone el puerto 3002 (o el que uses en tu servidor)
EXPOSE 3002

# Comando para ejecutar el backend
CMD ["node", "server.js"]