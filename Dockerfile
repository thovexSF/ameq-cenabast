# Etapa 1: Construcción del frontend
FROM node:18 as frontend-builder

WORKDIR /app/frontend

# Copiar archivos del frontend
COPY frontend/package.json ./
RUN npm install

# Copiar el resto del frontend y construirlo
COPY frontend/ ./
RUN npm run build

# Etapa 2: Configuración del backend y producción
FROM node:18 as backend

WORKDIR /app/backend

# Copiar archivos del backend
COPY backend/package.json ./
RUN npm install --only=production

# Copiar el código fuente del backend
COPY backend/ ./

# Copiar los archivos del frontend generados en la etapa anterior
COPY --from=frontend-builder /app/frontend/build ./public

# Exponer el puerto del backend
EXPOSE 3000

# Comando para ejecutar el backend
CMD ["node", "server.js"]