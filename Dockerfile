# Etapa de construcción del frontend
FROM node:18-alpine as frontend-builder

# Configurar directorio de trabajo
WORKDIR /frontend-build

# Copiar solo los archivos necesarios para instalar dependencias
COPY frontend/package*.json ./

# Instalar dependencias del frontend
RUN npm install

# Copiar el resto de los archivos del frontend
COPY frontend/ ./

# Construir el frontend
RUN npm run build

# Etapa final con el backend
FROM node:18-alpine

# Configurar directorio de trabajo
WORKDIR /app

# Copiar solo los archivos necesarios para instalar dependencias
COPY backend/package*.json ./

# Instalar dependencias de producción del backend
RUN npm install --omit=dev

# Copiar el resto de los archivos del backend
COPY backend/ ./

# Crear directorio public y copiar build del frontend
RUN mkdir -p public
COPY --from=frontend-builder /frontend-build/build ./public

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"]