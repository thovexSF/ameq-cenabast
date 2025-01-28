# Etapa de construcción del frontend
FROM node:18-alpine as frontend-builder

# Configurar directorio de trabajo para el frontend
WORKDIR /app/frontend
RUN ls -la /app
# Copiar package.json y package-lock.json del frontend
COPY frontend/package*.json ./
RUN npm install

# Copiar todo el código fuente del frontend
COPY frontend/ ./

# Construir el frontend
RUN npm run build

# Instalar dependencias de producción del backend
RUN cd backend && \
    npm install --omit=dev && \
    mkdir -p public && \
    cp -r ../frontend/build/* public/

# Configurar para producción
WORKDIR /app/backend
ENV PORT=3002
ENV NODE_ENV=production

EXPOSE 3002

CMD ["npm", "start"]