FROM node:18-alpine

# Configurar directorio de trabajo
WORKDIR /app

# Copiar todo el código fuente
COPY . .

# Instalar dependencias y construir frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Instalar dependencias de producción del backend y mover build
WORKDIR /app/backend
RUN npm install --omit=dev
RUN mkdir -p public
RUN cp -r ../frontend/build/* public/

# Limpiar archivos innecesarios
WORKDIR /app
RUN rm -rf frontend/node_modules \
    && rm -rf frontend/src \
    && rm -rf .git

# Puerto
EXPOSE 3002

# Establecer directorio de trabajo final
WORKDIR /app/backend

# Comando para iniciar
CMD ["npm", "start"]