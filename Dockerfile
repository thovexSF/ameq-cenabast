FROM node:18-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY backend/package*.json ./backend/

# Instalar dependencias
RUN npm run build

# Copiar el código fuente
COPY backend ./backend

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"] 