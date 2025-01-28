FROM node:18-alpine

# Instalar dependencias necesarias
RUN apk add --no-cache python3 make g++

# Configurar directorio de trabajo
WORKDIR /app

# Copiar todo el código fuente
COPY . .

# Instalar dependencias y construir frontend
RUN cd frontend && \
    npm install && \
    npm run build

# Instalar dependencias de producción del backend y mover build
RUN cd backend && \
    npm install --omit=dev && \
    mkdir -p public && \
    cp -r ../frontend/build/* public/

# Limpiar archivos innecesarios
RUN rm -rf frontend/node_modules && \
    rm -rf frontend/src && \
    rm -rf .git

# Puerto
EXPOSE 3002

# Establecer directorio de trabajo en backend
WORKDIR /app/backend

# Comando para iniciar
CMD ["npm", "start"]