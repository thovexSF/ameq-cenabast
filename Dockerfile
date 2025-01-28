FROM node:18-alpine

# Configurar directorio de trabajo
WORKDIR /app

# Copiar todo el proyecto
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

# Puerto
EXPOSE 3002

# Establecer directorio de trabajo final
WORKDIR /app/backend

# Comando para iniciar
CMD ["npm", "start"]