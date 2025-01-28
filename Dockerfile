# Etapa de construcción del frontend
FROM node:18-alpine as builder

WORKDIR /app

# Copiar todo el código fuente
COPY . .

# Instalar dependencias y construir frontend
RUN cd frontend && \
    npm install && \
    npm run build

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