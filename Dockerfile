# Etapa 1: Construcción del frontend
FROM node:18 AS frontend-builder

# Establecer el directorio de trabajo
WORKDIR /app/frontend

# Copiar los archivos necesarios para instalar dependencias
COPY frontend/package*.json ./

# Instalar las dependencias del frontend
RUN npm install

# Copiar el resto del código del frontend
COPY frontend/ .

# Construir el frontend
RUN npm run build

# Etapa 2: Configuración del backend
FROM node:18 AS backend

# Establecer el directorio de trabajo
WORKDIR /app/backend

# Copiar los archivos necesarios para instalar dependencias del backend
COPY backend/package*.json ./

# Instalar las dependencias del backend en modo producción
RUN npm install --omit=dev

# Copiar el resto del código del backend
COPY backend/ .

# Copiar los archivos ya construidos del frontend
COPY --from=frontend-builder /app/frontend/build ./public

# Exponer el puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]