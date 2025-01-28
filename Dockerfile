FROM node:18-alpine

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos del backend
COPY backend/package*.json ./
COPY backend/ ./

# Instalar dependencias de producción del backend
RUN npm install --omit=dev

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"]