# Etapa de construcción del frontend
FROM node:18-alpine as builder

# Configurar directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json de ambos proyectos
COPY package*.json ./
COPY frontend/package*.json frontend/
COPY backend/package*.json backend/

# Instalar dependencias
RUN npm install
RUN cd frontend && npm install

# Copiar el código fuente
COPY . .

# Construir el frontend
RUN cd frontend && npm run build

# Etapa final
FROM node:18-alpine

WORKDIR /usr/src/app

# Copiar package.json e instalar dependencias de producción
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copiar el código del backend
COPY backend/ ./

# Copiar el build del frontend
COPY --from=builder /usr/src/app/frontend/build ./public

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3002

# Exponer puerto
EXPOSE 3002

# Iniciar la aplicación
CMD ["npm", "start"]