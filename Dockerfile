FROM node:18-alpine

WORKDIR /app

# Copiar todo el código fuente primero
COPY . .

# Instalar dependencias y construir frontend
RUN cd frontend && \
    npm install && \
    npm run build && \
    cd ..

# Instalar dependencias del backend
RUN cd backend && \
    npm install --omit=dev && \
    cd ..

# Mover los archivos construidos del frontend al backend
RUN mkdir -p backend/public && \
    cp -r frontend/build/* backend/public/

# Puerto
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"] 