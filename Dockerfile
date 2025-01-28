FROM node:18-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Instalar dependencias del backend
RUN cd backend && npm install --omit=dev

# Instalar dependencias y construir el frontend
RUN cd frontend && npm install && npm run build

# Copiar el código fuente
COPY . .

# Mover los archivos construidos del frontend al backend
RUN mkdir -p backend/public && cp -r frontend/build/* backend/public/

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"] 