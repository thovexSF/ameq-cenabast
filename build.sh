#!/bin/bash

# Mostrar el directorio actual
echo "Current directory: $(pwd)"

# Construir el frontend
echo "Building frontend..."
cd frontend
npm install
CI=false npm run build

# Verificar si el build se creó correctamente
if [ ! -d "build" ]; then
    echo "Error: Frontend build directory not created"
    exit 1
fi

# Listar contenido del directorio build
echo "Frontend build contents:"
ls -la build/

# Preparar el backend
echo "Preparing backend..."
cd ../backend
npm install --omit=dev

# Crear directorio public y copiar build
echo "Copying frontend build to backend..."
mkdir -p public
cp -rv ../frontend/build/* public/

# Verificar si los archivos se copiaron
echo "Backend public directory contents:"
ls -la public/

# Iniciar la aplicación
echo "Starting application..."
npm start 