#!/bin/bash

# Construir el frontend
echo "Building frontend..."
cd frontend
npm install --omit=dev
npm run build

# Preparar el backend
echo "Preparing backend..."
cd ../backend
npm install --omit=dev
mkdir -p public
cp -r ../frontend/build/* public/

# Iniciar la aplicación
echo "Starting application..."
npm start 