FROM node:18-alpine

# Configurar directorio de trabajo
WORKDIR /app

# Copiar package.json del backend e instalar dependencias
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copiar el código del backend
COPY backend/ ./

# Variables de entorno por defecto
ENV PORT=3002
ENV NODE_ENV=production

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"]