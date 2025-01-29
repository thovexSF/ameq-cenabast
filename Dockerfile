# Etapa 1: Construcción del frontend
FROM node:16 as build-stage

WORKDIR /app

# Copia los archivos de configuración del proyecto
COPY package.json package-lock.json ./

# Instala las dependencias del servidor
RUN npm install

# Copia los archivos del frontend y sus dependencias
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm install --prefix frontend

# Copia el resto de los archivos del proyecto
COPY . .

# Construye el frontend
RUN npm run frontend-build

# Etapa 2: Configuración de producción
FROM node:16 as production-stage

WORKDIR /app

# Copia los archivos de configuración del proyecto
COPY package.json package-lock.json ./

# Instala las dependencias del servidor
RUN npm install --only=production

# Copia el servidor y los archivos estáticos construidos
COPY --from=build-stage /app/frontend/build ./frontend/build
COPY . .

# Expone el puerto
EXPOSE 3000

# Comando para ejecutar el servidor
CMD ["node", "server.js"]