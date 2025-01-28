# Etapa de construcción del frontend
FROM node:18-alpine as frontend-builder

# Configurar directorio de trabajo
WORKDIR /app

# Copiar todo el proyecto
COPY . .

# Ir al directorio frontend, instalar dependencias y construir
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Etapa del backend
FROM node:18-alpine

# Configurar directorio de trabajo
WORKDIR /app

# Copiar package.json del backend e instalar dependencias
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copiar el código del backend
COPY backend/ ./

# Crear directorio public y copiar el build del frontend
RUN mkdir -p public
COPY --from=frontend-builder /app/frontend/build ./public

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"]