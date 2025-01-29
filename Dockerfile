# Etapa de construcción del frontend
FROM node:18-alpine as frontend-builder

# Configurar directorio de trabajo para el frontend
WORKDIR /app

# Copiar package.json del frontend e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente del frontend y construir
COPY frontend/package.json ./
RUN npm install --prefix client

COPY . .
RUN npm run frontend-build

# Etapa del backend
FROM node:18-alpine

# Configurar directorio de trabajo
WORKDIR /app

# Copiar package.json del backend e instalar dependencias de producción
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copiar el build del frontend a public
COPY --from=frontend-builder /app/frontend/build ./frontend/build

COPY . .
# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["node", "server.js"]